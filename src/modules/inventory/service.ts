import type { AuditRecorder } from "@/modules/audit/service";
import { guard } from "@/shared/lib/authz/guard";
import { canInAnyCouncil, can, readableCouncilIds, type Actor } from "@/shared/lib/authz/policy";
import { addQuantity, percentage } from "@/shared/lib/decimal";
import { fail, ok, type Result } from "@/shared/lib/result";
import { parseInput, type RuntimeDeps } from "@/shared/lib/service-support";
import { classifyStockLevel, reconciliationDifference, type StockLevel } from "./domain/levels";
import { applyMovement, availableOf, dispatchReservedStock, physicalFromLedger, provisionBlocked, releaseBlocked, releaseReservation, reserve, reserveStock, unreserveStock, type MovementType } from "./domain/stock";
import type { InventoryRepository, StockKey } from "./repository";
import { createMaterialSchema, registerMovementSchema, setMinimumSchema, type Material } from "./schemas";

export interface StockLevelView {
  councilId: string;
  materialId: string;
  physical: number;
  reserved: number;
  blocked: number;
  available: number;
  minimum: number;
  level: StockLevel;
}

export interface StockSummary {
  totalBlocked: number;
  totalReady: number;
  totalReserved: number;
  totalPhysical: number;
  percentReady: number;
}

export function calculateStockSummary(levels: readonly StockLevelView[]): StockSummary {
  const totalBlocked = levels.reduce((acc, l) => addQuantity(acc, l.blocked), 0);
  const totalPhysical = levels.reduce((acc, l) => addQuantity(acc, l.physical), 0);
  const totalReserved = levels.reduce((acc, l) => addQuantity(acc, l.reserved), 0);
  const totalReady = levels.reduce((acc, l) => addQuantity(acc, l.available), 0);
  const totalPipeline = addQuantity(totalPhysical, totalBlocked);
  const percentReady = percentage(totalReady, totalPipeline);

  return {
    totalBlocked,
    totalReady,
    totalReserved,
    totalPhysical,
    percentReady,
  };
}

export interface ReconciliationIssue extends StockKey {
  stored: number;
  fromLedger: number;
  difference: number;
}

/** Movimentação interna (sem checagem de ator): usada por recebimentos e transferências já autorizados. */
export interface InternalMovement extends StockKey {
  type: MovementType;
  quantity: number;
  idempotencyKey: string;
  reason: string;
  reference: string | null;
  actorId: string | null;
}

export class InventoryService {
  constructor(
    private readonly repository: InventoryRepository,
    private readonly audit: AuditRecorder,
    private readonly runtime: RuntimeDeps,
  ) {}

  async createMaterial(actor: Actor, input: unknown): Promise<Result<Material>> {
    const parsed = parseInput(createMaterialSchema, input);
    if (!parsed.ok) return parsed;
    if (!canInAnyCouncil(actor, "material.manage")) {
      await this.audit.record({ actorId: actor.userId, action: "material.manage", entity: "material", entityId: null, councilId: null, result: "denied", details: {} });
      return fail("FORBIDDEN", "Você não tem permissão para executar esta ação.");
    }
    const saved = await this.repository.insertMaterial({ id: this.runtime.newId(), ...parsed.data, active: true });
    if (saved.ok) await this.audit.record({ actorId: actor.userId, action: "material.create", entity: "material", entityId: saved.data.id, councilId: null, result: "success", details: { code: parsed.data.code } });
    return saved;
  }

  async listMaterials(actor: Actor): Promise<Result<Material[]>> {
    if (!actor.isCentralAdmin && actor.memberships.length === 0) return fail("FORBIDDEN", "Sem acesso.");
    return ok(await this.repository.listMaterials());
  }

  /** Registro manual de entrada/consumo/ajuste. Ajuste exige gestor (matriz §6). */
  async registerMovement(actor: Actor, input: unknown): Promise<Result<{ physical: number; available: number; duplicate: boolean }>> {
    const parsed = parseInput(registerMovementSchema, input);
    if (!parsed.ok) return parsed;
    const data = parsed.data;
    const action = data.type.startsWith("adjustment") ? "stock.adjust" : "stock.move";
    const allowed = await guard(this.audit, actor, action, data.councilId, "stock_movement", data.materialId);
    if (!allowed.ok) return allowed;
    if (!(await this.repository.findMaterial(data.materialId))) return fail("NOT_FOUND", "Material não encontrado.");

    const result = await this.applyInternal({ ...data, reference: null, actorId: actor.userId });
    if (result.ok && !result.data.duplicate) {
      await this.audit.record({ actorId: actor.userId, action: `stock.${data.type}`, entity: "stock_movement", entityId: data.materialId, councilId: data.councilId, result: "success", details: { quantity: data.quantity, reason: data.reason } });
    }
    return result;
  }

  /** Aplica movimentação atomicamente (ledger + saldo), idempotente pela chave. */
  async applyInternal(movement: InternalMovement): Promise<Result<{ physical: number; available: number; duplicate: boolean }>> {
    const { councilId, materialId } = movement;
    return this.repository.transact({ councilId, materialId }, (state) => {
      const outcome = applyMovement(state.balance, { type: movement.type, quantity: movement.quantity, idempotencyKey: movement.idempotencyKey }, state.processedKeys);
      if (!outcome.ok) return outcome;
      const { balance, duplicate } = outcome.data;
      const value = { physical: balance.physical, available: availableOf(balance), duplicate };
      if (duplicate) return ok({ balance, value });
      return ok({
        balance,
        value,
        movement: { councilId, materialId, type: movement.type, quantity: movement.quantity, idempotencyKey: movement.idempotencyKey, reason: movement.reason, reference: movement.reference, actorId: movement.actorId },
      });
    });
  }

  /** Reserva (transferência aprovada). Não gera movimentação: altera apenas o reservado. */
  async reserveInternal(key: StockKey, quantity: number): Promise<Result<true>> {
    return this.repository.transact(key, (state) => {
      const next = reserve(state.balance, quantity);
      return next.ok ? ok({ balance: next.data, value: true as const }) : next;
    });
  }

  async releaseInternal(key: StockKey, quantity: number): Promise<Result<true>> {
    return this.repository.transact(key, (state) => {
      const next = releaseReservation(state.balance, quantity);
      return next.ok ? ok({ balance: next.data, value: true as const }) : next;
    });
  }

  /**
   * Provisiona saldo bloqueado para o órgão (ex.: criação de solicitação de compra).
   * Não altera o saldo físico nem o disponível (R11/Onda 1).
   */
  async provisionBlocked(actor: Actor, councilId: string, items: { materialId: string; quantity: number }[]): Promise<Result<void>> {
    const allowed = await guard(this.audit, actor, "request.create", councilId, "stock_balance");
    if (!allowed.ok) return allowed;

    for (const item of items) {
      if (!item.materialId || typeof item.materialId !== "string") {
        return fail("VALIDATION", "Material inválido.");
      }
      if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
        return fail("VALIDATION", "A quantidade deve ser maior que zero.");
      }
    }

    for (const item of items) {
      const result = await this.repository.transact({ councilId, materialId: item.materialId }, (state) => {
        const next = provisionBlocked(state.balance, item.quantity);
        return next.ok ? ok({ balance: next.data, value: undefined }) : next;
      });
      if (!result.ok) return result;
    }

    return ok(undefined);
  }

  /**
   * Converte saldo bloqueado em saldo físico (Pronto para Uso) após homologação de Warley.
   * Debita `blocked` e credita `physical` para cada item informado.
   */
  async releaseBlockedStock(
    councilId: string,
    items: { materialId: string; quantity: number }[],
    idempotencyKeyPrefix?: string,
  ): Promise<Result<void>> {
    for (const item of items) {
      if (!item.materialId || typeof item.materialId !== "string") {
        return fail("VALIDATION", "Material inválido.");
      }
      if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
        return fail("VALIDATION", "A quantidade deve ser maior que zero.");
      }
    }

    for (const item of items) {
      const result = await this.repository.transact({ councilId, materialId: item.materialId }, (state) => {
        const next = releaseBlocked(state.balance, item.quantity);
        if (!next.ok) return next;
        return ok({
          balance: next.data,
          value: undefined,
          movement: {
            councilId,
            materialId: item.materialId,
            type: "entry",
            quantity: item.quantity,
            idempotencyKey: idempotencyKeyPrefix
              ? `release:${idempotencyKeyPrefix}:${item.materialId}`
              : `release:${councilId}:${item.materialId}:${this.runtime.now().getTime()}`,
            reason: "Homologação de formalização (liberação de saldo)",
            reference: null,
            actorId: null,
          },
        });
      });
      if (!result.ok) return result;
    }

    return ok(undefined);
  }

  /**
   * Reserva saldo liberado para pedido de material (R11/R12).
   * Se algum item falhar, faz rollback dos itens já reservados nesta chamada.
   */
  async reserveForOrder(
    actor: Actor,
    councilId: string,
    items: { materialId: string; quantity: number }[],
  ): Promise<Result<void>> {
    const allowed = await guard(this.audit, actor, "stock.move", councilId, "stock_balance");
    if (!allowed.ok) return allowed;

    for (const item of items) {
      if (!item.materialId || typeof item.materialId !== "string") {
        return fail("VALIDATION", "Material inválido.");
      }
      if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
        return fail("VALIDATION", "A quantidade deve ser maior que zero.");
      }
    }

    const reservedItems: { materialId: string; quantity: number }[] = [];
    for (const item of items) {
      const result = await this.repository.transact({ councilId, materialId: item.materialId }, (state) => {
        const next = reserveStock(state.balance, item.quantity);
        return next.ok ? ok({ balance: next.data, value: undefined }) : next;
      });
      if (!result.ok) {
        // Rollback atomicamente os itens já reservados
        for (const rev of reservedItems) {
          await this.repository.transact({ councilId, materialId: rev.materialId }, (state) => {
            const rollbackNext = unreserveStock(state.balance, rev.quantity);
            return rollbackNext.ok ? ok({ balance: rollbackNext.data, value: undefined }) : rollbackNext;
          });
        }
        return result;
      }
      reservedItems.push(item);
    }

    return ok(undefined);
  }

  /**
   * Estorna a reserva de materiais de um pedido cancelado ou rejeitado (R11/R12).
   */
  async unreserveOrder(
    councilId: string,
    items: { materialId: string; quantity: number }[],
  ): Promise<Result<void>> {
    for (const item of items) {
      if (!item.materialId || typeof item.materialId !== "string") {
        return fail("VALIDATION", "Material inválido.");
      }
      if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
        return fail("VALIDATION", "A quantidade deve ser maior que zero.");
      }
    }

    for (const item of items) {
      const result = await this.repository.transact({ councilId, materialId: item.materialId }, (state) => {
        const next = unreserveStock(state.balance, item.quantity);
        return next.ok ? ok({ balance: next.data, value: undefined }) : next;
      });
      if (!result.ok) return result;
    }

    return ok(undefined);
  }

  /**
   * Despacha pedido homologado por Warley: baixa o reservado e o físico no mesmo passo,
   * registrando a saída no ledger (R11/R12).
   */
  async dispatchOrder(
    councilId: string,
    items: { materialId: string; quantity: number }[],
    orderId: string,
    actorId?: string | null,
  ): Promise<Result<void>> {
    for (const item of items) {
      if (!item.materialId || typeof item.materialId !== "string") {
        return fail("VALIDATION", "Material inválido.");
      }
      if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
        return fail("VALIDATION", "A quantidade deve ser maior que zero.");
      }
    }

    for (const item of items) {
      const idempotencyKey = `dispatch:${orderId}:${item.materialId}`;
      const result = await this.repository.transact({ councilId, materialId: item.materialId }, (state) => {
        if (state.processedKeys.has(idempotencyKey)) {
          return ok({ balance: state.balance, value: undefined });
        }
        const next = dispatchReservedStock(state.balance, item.quantity);
        if (!next.ok) return next;
        return ok({
          balance: next.data,
          value: undefined,
          movement: {
            councilId,
            materialId: item.materialId,
            type: "transfer_out",
            quantity: item.quantity,
            idempotencyKey,
            reason: "Expedição de Pedido de Material Homologada por Warley",
            reference: orderId,
            actorId: actorId ?? null,
          },
        });
      });
      if (!result.ok) return result;
    }

    return ok(undefined);
  }

  /**
   * Saída de material reservado (transferência despachada): libera a reserva e baixa o físico
   * na MESMA transação, para o item nunca ficar disponível "no meio do caminho" (R12).
   */
  async dispatchReservedInternal(movement: Omit<InternalMovement, "type">): Promise<Result<true>> {
    const { councilId, materialId } = movement;
    return this.repository.transact({ councilId, materialId }, (state) => {
      if (state.processedKeys.has(movement.idempotencyKey)) return ok({ balance: state.balance, value: true as const });
      const released = releaseReservation(state.balance, movement.quantity);
      if (!released.ok) return released;
      const outcome = applyMovement(released.data, { type: "transfer_out", quantity: movement.quantity, idempotencyKey: movement.idempotencyKey }, state.processedKeys);
      if (!outcome.ok) return outcome;
      return ok({
        balance: outcome.data.balance,
        value: true as const,
        movement: { councilId, materialId, type: "transfer_out", quantity: movement.quantity, idempotencyKey: movement.idempotencyKey, reason: movement.reason, reference: movement.reference, actorId: movement.actorId },
      });
    });
  }

  async setMinimum(actor: Actor, input: unknown): Promise<Result<true>> {
    const parsed = parseInput(setMinimumSchema, input);
    if (!parsed.ok) return parsed;
    const allowed = await guard(this.audit, actor, "stock.adjust", parsed.data.councilId, "stock_minimum", parsed.data.materialId);
    if (!allowed.ok) return allowed;
    await this.repository.setMinimum(parsed.data, parsed.data.minimum);
    await this.audit.record({ actorId: actor.userId, action: "stock.set_minimum", entity: "stock_balance", entityId: parsed.data.materialId, councilId: parsed.data.councilId, result: "success", details: { minimum: parsed.data.minimum } });
    return ok(true);
  }

  /** Níveis calculados sobre o DISPONÍVEL; restrito aos conselhos legíveis (R14). */
  async listLevels(actor: Actor, councilId?: string): Promise<Result<StockLevelView[]>> {
    if (councilId && !can(actor, "council.read", councilId)) return fail("FORBIDDEN", "Sem acesso a este conselho.");
    const scope = councilId ? [councilId] : readableCouncilIds(actor);
    const rows = await this.repository.listStock(scope);
    return ok(rows.map((r) => {
      const available = availableOf(r.balance);
      return { councilId: r.councilId, materialId: r.materialId, physical: r.balance.physical, reserved: r.balance.reserved, blocked: r.balance.blocked ?? 0, available, minimum: r.minimum, level: classifyStockLevel(available, r.minimum) };
    }));
  }

  /**
   * Resumo consolidado de estoque (bloqueado em formalização, pronto para uso, reservado, físico e % liberado).
   * Restrito aos conselhos legíveis para o ator (R14).
   */
  async stockSummary(actor: Actor, councilId?: string): Promise<Result<StockSummary>> {
    const levelsResult = await this.listLevels(actor, councilId);
    if (!levelsResult.ok) return levelsResult;
    return ok(calculateStockSummary(levelsResult.data));
  }

  async listMovements(actor: Actor, councilId: string) {
    const allowed = await guard(this.audit, actor, "council.read", councilId, "stock_movement");
    if (!allowed.ok) return allowed;
    return ok(await this.repository.listMovements().then((all) => all.filter((m) => m.councilId === councilId)));
  }

  /** Reconciliação (H2): compara saldo físico gravado com o recalculado do ledger. */
  async reconcile(): Promise<ReconciliationIssue[]> {
    const issues: ReconciliationIssue[] = [];
    for (const row of await this.repository.listStock("all")) {
      const ledger = await this.repository.listMovements({ councilId: row.councilId, materialId: row.materialId });
      const fromLedger = physicalFromLedger(ledger);
      const difference = reconciliationDifference(row.balance.physical, fromLedger);
      if (difference !== 0) issues.push({ councilId: row.councilId, materialId: row.materialId, stored: row.balance.physical, fromLedger, difference });
    }
    return issues;
  }
}
