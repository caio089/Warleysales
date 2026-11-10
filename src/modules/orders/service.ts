import type { AuditRecorder } from "@/modules/audit/service";
import type { InventoryService } from "@/modules/inventory/service";
import { guard } from "@/shared/lib/authz/guard";
import { can, readableCouncilIds, type Actor } from "@/shared/lib/authz/policy";
import { fail, ok, type Result } from "@/shared/lib/result";
import { parseInput, type RuntimeDeps } from "@/shared/lib/service-support";
import {
  approveMaterialOrder,
  cancelMaterialOrder,
  createMaterialOrder,
  rejectMaterialOrder,
} from "./domain/order";
import type { MaterialOrderFilter, MaterialOrderRepository } from "./repository";
import {
  createMaterialOrderSchema,
  type MaterialOrder,
} from "./schemas";

export class MaterialOrderService {
  constructor(
    private readonly repository: MaterialOrderRepository,
    private readonly inventory: InventoryService,
    private readonly audit: AuditRecorder,
    private readonly runtime: RuntimeDeps,
  ) {}

  /**
   * Criação de pedido de material contra o saldo liberado/disponível do órgão.
   * Valida permissão 'stock.move', valida saldo disponível, gera número sequencial,
   * reserva saldo no estoque, persiste e registra auditoria.
   */
  async create(actor: Actor, input: unknown): Promise<Result<MaterialOrder>> {
    const parsed = parseInput(createMaterialOrderSchema, input);
    if (!parsed.ok) return parsed;

    const { councilId, notes, items } = parsed.data;
    const allowed = await guard(this.audit, actor, "stock.move", councilId, "material_order");
    if (!allowed.ok) return allowed;

    // Checagem de saldo liberado/disponível
    const levelsResult = await this.inventory.listLevels(actor, councilId);
    if (!levelsResult.ok) return levelsResult;

    const balances = new Map<string, number>();
    for (const lvl of levelsResult.data) {
      balances.set(lvl.materialId, lvl.available);
    }

    const orderNumber = parsed.data.number || (await this.repository.nextNumber(councilId));

    const domainResult = createMaterialOrder(
      {
        id: parsed.data.id ?? this.runtime.newId(),
        number: orderNumber,
        councilId,
        requestedBy: actor.userId,
        notes: notes ?? null,
        items,
        now: this.runtime.now(),
      },
      balances,
    );
    if (!domainResult.ok) return domainResult;

    // Reserva atômica no estoque via inventory
    const reserveResult = await this.inventory.reserveForOrder(
      actor,
      councilId,
      domainResult.data.items.map((i) => ({
        materialId: i.materialId,
        quantity: i.quantity,
      })),
    );
    if (!reserveResult.ok) return reserveResult;

    const saved = await this.repository.create(domainResult.data);

    await this.audit.record({
      actorId: actor.userId,
      action: "material_order.create",
      entity: "material_order",
      entityId: saved.id,
      councilId: saved.councilId,
      result: "success",
      details: { number: saved.number, itemsCount: saved.items.length },
    });

    return ok(saved);
  }

  /**
   * Homologação e expedição de pedido de material.
   * Veredito estritamente exclusivo de Warley (Administrador Central).
   * Baixa o estoque reservado e o saldo físico no ledger ('transfer_out') e marca pedido como aprovado.
   */
  async approve(actor: Actor, orderId: string): Promise<Result<MaterialOrder>> {
    if (!actor.isCentralAdmin) {
      await this.audit.record({
        actorId: actor.userId,
        action: "material_order.approve",
        entity: "material_order",
        entityId: orderId,
        councilId: null,
        result: "denied",
        details: { reason: "Apenas Warley (Administrador Central) pode homologar pedidos de material." },
      });
      return fail("FORBIDDEN", "Apenas o Administrador Central (Warley) pode aprovar pedidos de material.");
    }

    const order = await this.repository.getById(orderId);
    if (!order) {
      return fail("NOT_FOUND", "Pedido de material não encontrado.");
    }

    const approvedDomain = approveMaterialOrder(order, actor.userId, this.runtime.now());
    if (!approvedDomain.ok) return approvedDomain;

    const dispatchResult = await this.inventory.dispatchOrder(
      order.councilId,
      order.items.map((i) => ({ materialId: i.materialId, quantity: i.quantity })),
      order.id,
      actor.userId,
    );
    if (!dispatchResult.ok) return dispatchResult;

    const saved = await this.repository.update(approvedDomain.data);

    await this.audit.record({
      actorId: actor.userId,
      action: "material_order.approve",
      entity: "material_order",
      entityId: saved.id,
      councilId: saved.councilId,
      result: "success",
      details: { number: saved.number },
    });

    return ok(saved);
  }

  /**
   * Rejeição de pedido de material.
   * Exclusivo de Warley (Administrador Central). Exige justificativa formal (>= 5 caracteres).
   * Estorna a reserva de volta para o saldo disponível e atualiza o status para rejeitado.
   */
  async reject(actor: Actor, orderId: string, reason: string): Promise<Result<MaterialOrder>> {
    if (!actor.isCentralAdmin) {
      await this.audit.record({
        actorId: actor.userId,
        action: "material_order.reject",
        entity: "material_order",
        entityId: orderId,
        councilId: null,
        result: "denied",
        details: { reason: "Apenas Warley (Administrador Central) pode rejeitar pedidos de material." },
      });
      return fail("FORBIDDEN", "Apenas o Administrador Central (Warley) pode rejeitar pedidos de material.");
    }

    if (!reason || reason.trim().length < 5) {
      return fail("VALIDATION", "O motivo da recusa deve ter ao menos 5 caracteres.");
    }

    const order = await this.repository.getById(orderId);
    if (!order) {
      return fail("NOT_FOUND", "Pedido de material não encontrado.");
    }

    const rejectedDomain = rejectMaterialOrder(order, actor.userId, reason, this.runtime.now());
    if (!rejectedDomain.ok) return rejectedDomain;

    const unreserveResult = await this.inventory.unreserveOrder(
      order.councilId,
      order.items.map((i) => ({ materialId: i.materialId, quantity: i.quantity })),
    );
    if (!unreserveResult.ok) return unreserveResult;

    const saved = await this.repository.update(rejectedDomain.data);

    await this.audit.record({
      actorId: actor.userId,
      action: "material_order.reject",
      entity: "material_order",
      entityId: saved.id,
      councilId: saved.councilId,
      result: "success",
      details: { number: saved.number, reason: reason.trim() },
    });

    return ok(saved);
  }

  /**
   * Cancelamento de pedido pelo órgão solicitante (ou Warley).
   * Permitido apenas enquanto o status for 'pendente'. Estorna a reserva no estoque.
   */
  async cancel(actor: Actor, orderId: string): Promise<Result<MaterialOrder>> {
    const order = await this.repository.getById(orderId);
    if (!order) {
      return fail("NOT_FOUND", "Pedido de material não encontrado.");
    }

    if (!actor.isCentralAdmin && !can(actor, "stock.move", order.councilId)) {
      await this.audit.record({
        actorId: actor.userId,
        action: "material_order.cancel",
        entity: "material_order",
        entityId: orderId,
        councilId: order.councilId,
        result: "denied",
        details: { reason: "Sem permissão no órgão solicitante." },
      });
      return fail("FORBIDDEN", "Você não tem permissão para cancelar este pedido.");
    }

    const canceledDomain = cancelMaterialOrder(order, this.runtime.now());
    if (!canceledDomain.ok) return canceledDomain;

    const unreserveResult = await this.inventory.unreserveOrder(
      order.councilId,
      order.items.map((i) => ({ materialId: i.materialId, quantity: i.quantity })),
    );
    if (!unreserveResult.ok) return unreserveResult;

    const saved = await this.repository.update(canceledDomain.data);

    await this.audit.record({
      actorId: actor.userId,
      action: "material_order.cancel",
      entity: "material_order",
      entityId: saved.id,
      councilId: saved.councilId,
      result: "success",
      details: { number: saved.number },
    });

    return ok(saved);
  }

  /**
   * Obtenção de um pedido por ID com isolamento multi-tenant (R14).
   */
  async get(actor: Actor, orderId: string): Promise<Result<MaterialOrder>> {
    const order = await this.repository.getById(orderId);
    if (!order) {
      return fail("NOT_FOUND", "Pedido de material não encontrado.");
    }

    if (!actor.isCentralAdmin && !can(actor, "council.read", order.councilId)) {
      return fail("FORBIDDEN", "Sem acesso a este pedido de material.");
    }

    return ok(order);
  }

  async getById(actor: Actor, orderId: string): Promise<Result<MaterialOrder>> {
    return this.get(actor, orderId);
  }

  /**
   * Listagem de pedidos de material com isolamento multi-tenant (R14).
   */
  async list(actor: Actor, filter?: MaterialOrderFilter): Promise<Result<MaterialOrder[]>> {
    if (filter?.councilId) {
      if (!actor.isCentralAdmin && !can(actor, "council.read", filter.councilId)) {
        return fail("FORBIDDEN", "Sem acesso a este conselho.");
      }
      const list = await this.repository.list([filter.councilId], filter);
      return ok(list);
    }

    const councilScope = actor.isCentralAdmin ? "all" : readableCouncilIds(actor);
    if (councilScope !== "all" && councilScope.length === 0) {
      return ok([]);
    }

    const list = await this.repository.list(councilScope, filter);
    return ok(list);
  }
}
