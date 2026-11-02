import type { AuditRecorder } from "@/modules/audit/service";
import type { InventoryService } from "@/modules/inventory/service";
import { guard } from "@/shared/lib/authz/guard";
import { can, readableCouncilIds, type Actor, type PermissionAction } from "@/shared/lib/authz/policy";
import { fail, ok, type Result } from "@/shared/lib/result";
import { parseInput, type RuntimeDeps } from "@/shared/lib/service-support";
import { changeTransferStatus, stockEffectFor, type TransferStatus } from "./domain/transfer";
import type { TransferRepository } from "./repository";
import { advanceTransferSchema, requestTransferSchema, type Transfer } from "./schemas";

/** Quem executa cada passo e em qual conselho (a origem decide e despacha; o destino recebe). */
function requiredPermission(transfer: Transfer, to: TransferStatus): { action: PermissionAction; councilId: string }[] {
  const origin = transfer.originCouncilId;
  const destination = transfer.destinationCouncilId;
  switch (to) {
    case "em_analise":
    case "aprovada":
    case "rejeitada":
      return [{ action: "transfer.decide", councilId: origin }];
    case "separada":
    case "em_transito":
      return [{ action: "stock.move", councilId: origin }];
    case "recebida":
      return [{ action: "stock.move", councilId: destination }];
    case "cancelada":
      // Qualquer um dos gestores envolvidos pode cancelar.
      return [{ action: "transfer.decide", councilId: origin }, { action: "transfer.decide", councilId: destination }];
    default:
      return [];
  }
}

export class TransferService {
  constructor(
    private readonly transfers: TransferRepository,
    private readonly inventory: InventoryService,
    private readonly audit: AuditRecorder,
    private readonly runtime: RuntimeDeps,
  ) {}

  /** O conselho de destino solicita material ao de origem. */
  async request(actor: Actor, input: unknown): Promise<Result<Transfer>> {
    const parsed = parseInput(requestTransferSchema, input);
    if (!parsed.ok) return parsed;
    const allowed = await guard(this.audit, actor, "transfer.request", parsed.data.destinationCouncilId, "stock_transfer");
    if (!allowed.ok) return allowed;

    const now = this.runtime.now();
    const transfer = await this.transfers.insert({
      id: this.runtime.newId(),
      originCouncilId: parsed.data.originCouncilId,
      destinationCouncilId: parsed.data.destinationCouncilId,
      status: "solicitada",
      items: parsed.data.items.map((i) => ({ ...i, receivedQuantity: null })),
      events: [{ from: null, to: "solicitada", actorId: actor.userId, at: now }],
      createdAt: now,
    });
    await this.audit.record({ actorId: actor.userId, action: "transfer.request", entity: "stock_transfer", entityId: transfer.id, councilId: transfer.destinationCouncilId, result: "success", details: {} });
    return ok(transfer);
  }

  async list(actor: Actor): Promise<Result<Transfer[]>> {
    const scope = readableCouncilIds(actor);
    if (scope !== "all" && scope.length === 0) return ok([]);
    return ok(await this.transfers.listByCouncils(scope));
  }

  async get(actor: Actor, id: string): Promise<Result<Transfer>> {
    const transfer = await this.transfers.findById(id);
    if (!transfer || !(can(actor, "council.read", transfer.originCouncilId) || can(actor, "council.read", transfer.destinationCouncilId))) {
      return fail("NOT_FOUND", "Transferência não encontrada.");
    }
    return ok(transfer);
  }

  /** Avança a máquina de estados aplicando o efeito de estoque correspondente (R12). */
  async advance(actor: Actor, input: unknown): Promise<Result<Transfer>> {
    const parsed = parseInput(advanceTransferSchema, input);
    if (!parsed.ok) return parsed;
    const transfer = await this.transfers.findById(parsed.data.transferId);
    if (!transfer) return fail("NOT_FOUND", "Transferência não encontrada.");

    const requirements = requiredPermission(transfer, parsed.data.to);
    if (!requirements.some((r) => can(actor, r.action, r.councilId))) {
      const first = requirements[0]!;
      const denied = await guard(this.audit, actor, first.action, first.councilId, "stock_transfer", transfer.id);
      return denied.ok ? fail("FORBIDDEN", "Sem permissão.") : denied;
    }

    const to = parsed.data.to;
    const valid = changeTransferStatus(transfer.status, to);
    if (!valid.ok) return valid;

    // Caminho transacional (Supabase): efeitos de estoque de todos os materiais + status + evento em uma transação SQL.
    if (this.transfers.advanceAtomically) {
      const step = await this.transfers.advanceAtomically({
        transferId: transfer.id, to, actorId: actor.userId, at: this.runtime.now(), note: parsed.data.note, received: parsed.data.received,
      });
      if (!step.ok) return step;
      await this.recordAdvance(transfer, to, actor);
      return ok(step.data);
    }

    const applied = await this.applyStockEffects(transfer, to, parsed.data.received);
    if (!applied.ok) return applied;

    const items = applied.data;
    const updated = await this.transfers.save({
      ...transfer,
      status: to,
      items,
      events: [...transfer.events, { from: transfer.status, to, actorId: actor.userId, at: this.runtime.now(), note: parsed.data.note }],
    });
    await this.recordAdvance(transfer, to, actor);
    return ok(updated);
  }

  private async recordAdvance(transfer: Transfer, to: TransferStatus, actor: Actor): Promise<void> {
    await this.audit.record({ actorId: actor.userId, action: `transfer.${to}`, entity: "stock_transfer", entityId: transfer.id, councilId: transfer.originCouncilId, result: "success", details: { from: transfer.status } });
  }

  /** Executa os efeitos item a item; falha no meio compensa o que já foi aplicado. */
  private async applyStockEffects(transfer: Transfer, to: TransferStatus, received?: { materialId: string; quantity: number }[]): Promise<Result<Transfer["items"]>> {
    const done: (() => Promise<unknown>)[] = []; // compensações
    const items = transfer.items.map((i) => ({ ...i }));

    for (const item of items) {
      const receivedQuantity = received?.find((r) => r.materialId === item.materialId)?.quantity ?? item.quantity;
      const effect = stockEffectFor(transfer.status, to, { sent: item.quantity, received: receivedQuantity });
      if (!effect.ok) { await Promise.all(done.map((undo) => undo())); return effect; }

      const origin = { councilId: transfer.originCouncilId, materialId: item.materialId };
      const reference = `transfer:${transfer.id}`;
      let step: Result<unknown> = ok(true);

      switch (effect.data.kind) {
        case "reserve_origin":
          step = await this.inventory.reserveInternal(origin, item.quantity);
          if (step.ok) done.push(() => this.inventory.releaseInternal(origin, item.quantity));
          break;
        case "release_reservation_origin":
          step = await this.inventory.releaseInternal(origin, item.quantity);
          break;
        case "dispatch_from_origin":
          step = await this.inventory.dispatchReservedInternal({ ...origin, quantity: item.quantity, idempotencyKey: `${reference}:out:${item.materialId}`, reason: "Saída por transferência", reference, actorId: null });
          break;
        case "receive_at_destination":
          item.receivedQuantity = effect.data.receivedQuantity;
          if (effect.data.receivedQuantity > 0) {
            step = await this.inventory.applyInternal({ councilId: transfer.destinationCouncilId, materialId: item.materialId, type: "transfer_in", quantity: effect.data.receivedQuantity, idempotencyKey: `${reference}:in:${item.materialId}`, reason: "Entrada por transferência", reference, actorId: null });
          }
          break;
        default:
          break;
      }
      if (!step.ok) { await Promise.all(done.map((undo) => undo())); return step as Result<never>; }
    }
    return ok(items);
  }
}
