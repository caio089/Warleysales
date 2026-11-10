import type { AtaService } from "@/modules/atas/service";
import type { AuditRecorder } from "@/modules/audit/service";
import type { InventoryService } from "@/modules/inventory/service";
import type { ProcessService } from "@/modules/processes/service";
import { guard } from "@/shared/lib/authz/guard";
import { can, readableCouncilIds, type Actor, type PermissionAction } from "@/shared/lib/authz/policy";
import { fail, ok, type Result } from "@/shared/lib/result";
import { parseInput, type RuntimeDeps } from "@/shared/lib/service-support";
import { applyReceipt } from "./domain/receipt";
import { changeRequestStatus, reopenRejected, type PurchaseRequestStatus } from "./domain/request-status";
import type { PurchaseRequestRepository } from "./repository";
import { createRequestSchema, decisionSchema, receiveSchema, rejectSchema, reopenSchema, requestIdSchema, type PurchaseRequest } from "./schemas";

export class PurchaseRequestService {
  constructor(
    private readonly repository: PurchaseRequestRepository,
    private readonly atas: AtaService,
    private readonly inventory: InventoryService,
    private readonly processes: ProcessService,
    private readonly audit: AuditRecorder,
    private readonly runtime: RuntimeDeps,
  ) {}

  async create(actor: Actor, input: unknown): Promise<Result<PurchaseRequest>> {
    const parsed = parseInput(createRequestSchema, input);
    if (!parsed.ok) return parsed;
    const d = parsed.data;
    const allowed = await guard(this.audit, actor, "request.create", d.councilId, "purchase_request");
    if (!allowed.ok) return allowed;

    const now = this.runtime.now();
    let processId: string | null = null;
    if (d.createProcess) {
      const currentYear = new Date(now).getFullYear();
      const processNumber = await this.processes.getNextNumber(d.councilId, currentYear);
      const createdProc = await this.processes.create(actor, {
        councilId: d.councilId,
        number: processNumber,
        title: d.title,
      });
      if (!createdProc.ok) return createdProc;
      processId = createdProc.data.id;
    }

    if (d.items && d.items.length > 0) {
      const provisioned = await this.inventory.provisionBlocked(actor, d.councilId, d.items);
      if (!provisioned.ok) return provisioned;
    }

    const saved = await this.repository.insert({
      id: this.runtime.newId(), councilId: d.councilId, title: d.title, status: "rascunho",
      processId,
      estimatedValue: d.estimatedValue ?? null,
      items: d.items.map((i) => ({ id: this.runtime.newId(), materialId: i.materialId, quantity: i.quantity, ataItemId: i.ataItemId ?? null, receivedTotal: 0 })),
      events: [{ from: null, to: "rascunho", actorId: actor.userId, at: now }],
      receiptKeys: [], createdBy: actor.userId, createdAt: now,
    });
    await this.audit.record({ actorId: actor.userId, action: "request.create", entity: "purchase_request", entityId: saved.id, councilId: d.councilId, result: "success", details: {} });
    return ok(saved);
  }

  submit(actor: Actor, input: unknown) { return this.simpleStep(actor, input, requestIdSchema, "enviada", "request.create"); }
  startReview(actor: Actor, input: unknown) { return this.simpleStep(actor, input, requestIdSchema, "em_analise", "request.decide"); }
  requestCorrection(actor: Actor, input: unknown) { return this.simpleStep(actor, input, rejectSchema, "aguardando_correcao", "request.decide"); }
  reject(actor: Actor, input: unknown) { return this.simpleStep(actor, input, rejectSchema, "rejeitada", "request.decide"); }

  /** Reenvio após correção volta para análise (aguardando_correcao → em_analise). */
  resubmitAfterCorrection(actor: Actor, input: unknown) { return this.simpleStep(actor, input, requestIdSchema, "em_analise", "request.create"); }

  /**
   * Aprovar NÃO altera estoque (R11). Itens ligados a ata comprometem saldo atomicamente (R9);
   * se algum falhar, os já comprometidos são devolvidos e a solicitação permanece em análise.
   */
  async approve(actor: Actor, input: unknown): Promise<Result<PurchaseRequest>> {
    const parsed = parseInput(decisionSchema, input);
    if (!parsed.ok) return parsed;
    const request = await this.repository.findById(parsed.data.requestId);
    if (!request) return fail("NOT_FOUND", "Solicitação não encontrada.");
    const allowed = await guard(this.audit, actor, "request.decide", request.councilId, "purchase_request", request.id);
    if (!allowed.ok) return allowed;
    const valid = changeRequestStatus(request.status, "aprovada");
    if (!valid.ok) return valid;

    // Caminho transacional (Supabase): todas as linhas de ata, status e evento em uma única transação SQL.
    if (this.repository.approveAtomically) {
      for (const item of request.items.filter((i) => i.ataItemId)) {
        const committable = await this.atas.checkCommittable(item.ataItemId!);
        if (!committable.ok) return committable;
      }
      const saved = await this.repository.approveAtomically({ requestId: request.id, actorId: actor.userId, at: this.runtime.now(), note: parsed.data.note });
      if (!saved.ok) return saved;
      await this.recordTransition(request, "aprovada", actor, parsed.data.note);
      return ok(saved.data);
    }

    const committed: { itemId: string; quantity: number }[] = [];
    for (const item of request.items.filter((i) => i.ataItemId)) {
      const result = await this.atas.commitInternal({ itemId: item.ataItemId!, councilId: request.councilId, quantity: item.quantity, reference: `request:${request.id}` });
      if (!result.ok) {
        for (const done of committed) await this.atas.releaseInternal({ itemId: done.itemId, councilId: request.councilId, quantity: done.quantity, reason: `rollback aprovação ${request.id}` });
        return result;
      }
      committed.push({ itemId: item.ataItemId!, quantity: item.quantity });
    }
    return ok(await this.transition(request, "aprovada", actor, parsed.data.note));
  }

  /** Cancelar após aprovação devolve o saldo comprometido da ata. */
  async cancel(actor: Actor, input: unknown): Promise<Result<PurchaseRequest>> {
    const parsed = parseInput(decisionSchema, input);
    if (!parsed.ok) return parsed;
    const request = await this.repository.findById(parsed.data.requestId);
    if (!request) return fail("NOT_FOUND", "Solicitação não encontrada.");
    const isOwnerDraft = request.createdBy === actor.userId && (request.status === "rascunho" || request.status === "enviada");
    const action: PermissionAction = isOwnerDraft ? "request.create" : "request.decide";
    const allowed = await guard(this.audit, actor, action, request.councilId, "purchase_request", request.id);
    if (!allowed.ok) return allowed;
    const valid = changeRequestStatus(request.status, "cancelada");
    if (!valid.ok) return valid;

    if (this.repository.cancelAtomically) {
      const saved = await this.repository.cancelAtomically({ requestId: request.id, actorId: actor.userId, at: this.runtime.now(), note: parsed.data.note });
      if (!saved.ok) return saved;
      await this.recordTransition(request, "cancelada", actor, parsed.data.note);
      return ok(saved.data);
    }

    if (request.status === "aprovada") {
      for (const item of request.items.filter((i) => i.ataItemId)) {
        await this.atas.releaseInternal({ itemId: item.ataItemId!, councilId: request.councilId, quantity: item.quantity, reason: `cancelamento ${request.id}` });
      }
    }
    return ok(await this.transition(request, "cancelada", actor, parsed.data.note));
  }

  /** Reabertura excepcional de solicitação rejeitada (ação explícita, gestor, com justificativa). */
  async reopen(actor: Actor, input: unknown): Promise<Result<PurchaseRequest>> {
    const parsed = parseInput(reopenSchema, input);
    if (!parsed.ok) return parsed;
    const request = await this.repository.findById(parsed.data.requestId);
    if (!request) return fail("NOT_FOUND", "Solicitação não encontrada.");
    const next = reopenRejected(request.status, { canReopen: can(actor, "request.decide", request.councilId) }, parsed.data.justification);
    if (!next.ok) {
      if (next.code === "FORBIDDEN") await guard(this.audit, actor, "request.decide", request.councilId, "purchase_request", request.id);
      return next;
    }
    return ok(await this.transition(request, next.data, actor, parsed.data.justification));
  }

  /**
   * Recebimento (parcial ou total): única origem de entrada de estoque a partir de compras (R11).
   * Idempotente pela receiptKey. Quantidade acima do esperado é rejeitada.
   */
  async receive(actor: Actor, input: unknown): Promise<Result<PurchaseRequest>> {
    const parsed = parseInput(receiveSchema, input);
    if (!parsed.ok) return parsed;
    const request = await this.repository.findById(parsed.data.requestId);
    if (!request) return fail("NOT_FOUND", "Solicitação não encontrada.");
    const allowed = await guard(this.audit, actor, "stock.move", request.councilId, "purchase_receipt", request.id);
    if (!allowed.ok) return allowed;
    if (request.receiptKeys.includes(parsed.data.receiptKey)) return ok(request); // já aplicado

    if (!["aprovada", "em_atendimento", "parcialmente_atendida"].includes(request.status)) {
      return fail("INVALID_STATE", "A solicitação não está em fase de recebimento.");
    }
    const outcome = applyReceipt(request.items.map((i) => ({ itemId: i.id, expected: i.quantity, receivedBefore: i.receivedTotal })), parsed.data.lines);
    if (!outcome.ok) return outcome;

    // Entrada no ledger por linha, cada uma com chave idempotente própria.
    for (const line of parsed.data.lines) {
      const item = request.items.find((i) => i.id === line.itemId)!;
      const entry = await this.inventory.applyInternal({
        councilId: request.councilId, materialId: item.materialId, type: "entry", quantity: line.received,
        idempotencyKey: `receipt:${parsed.data.receiptKey}:${line.itemId}`, reason: "Recebimento de compra", reference: `request:${request.id}`, actorId: actor.userId,
      });
      if (!entry.ok) return entry;
    }

    let current = request;
    if (current.status === "aprovada") current = await this.transition(current, "em_atendimento", actor);
    const updated: PurchaseRequest = {
      ...current,
      items: current.items.map((i) => ({ ...i, receivedTotal: outcome.data.items.find((r) => r.itemId === i.id)!.receivedTotal })),
      receiptKeys: [...current.receiptKeys, parsed.data.receiptKey],
    };
    const finalStatus = changeRequestStatus(updated.status, outcome.data.requestStatus);
    if (!finalStatus.ok) return finalStatus;
    return ok(await this.transition(updated, outcome.data.requestStatus, actor));
  }

  async list(actor: Actor): Promise<Result<PurchaseRequest[]>> {
    const scope = readableCouncilIds(actor);
    if (scope !== "all" && scope.length === 0) return ok([]);
    return ok(await this.repository.listByCouncils(scope));
  }

  async get(actor: Actor, id: string): Promise<Result<PurchaseRequest>> {
    const request = await this.repository.findById(id);
    if (!request || !can(actor, "council.read", request.councilId)) return fail("NOT_FOUND", "Solicitação não encontrada.");
    return ok(request);
  }

  /** Passo simples da máquina de estados (autoriza, valida transição, persiste, audita). */
  private async simpleStep(actor: Actor, input: unknown, schema: Parameters<typeof parseInput>[0], to: PurchaseRequestStatus, action: PermissionAction): Promise<Result<PurchaseRequest>> {
    const parsed = parseInput(schema, input) as Result<{ requestId: string; note?: string }>;
    if (!parsed.ok) return parsed;
    const request = await this.repository.findById(parsed.data.requestId);
    if (!request) return fail("NOT_FOUND", "Solicitação não encontrada.");
    const allowed = await guard(this.audit, actor, action, request.councilId, "purchase_request", request.id);
    if (!allowed.ok) return allowed;
    const valid = changeRequestStatus(request.status, to);
    if (!valid.ok) return valid;
    return ok(await this.transition(request, to, actor, parsed.data.note));
  }

  private async transition(request: PurchaseRequest, to: PurchaseRequestStatus, actor: Actor, note?: string): Promise<PurchaseRequest> {
    const saved = await this.repository.save({ ...request, status: to, events: [...request.events, { from: request.status, to, actorId: actor.userId, at: this.runtime.now(), note }] });
    await this.recordTransition(request, to, actor, note);
    return saved;
  }

  /** Auditoria da transição (o estado já foi persistido, inclusive pelos caminhos transacionais). */
  private async recordTransition(request: PurchaseRequest, to: PurchaseRequestStatus, actor: Actor, note?: string): Promise<void> {
    await this.audit.record({ actorId: actor.userId, action: `request.${to}`, entity: "purchase_request", entityId: request.id, councilId: request.councilId, result: "success", details: { from: request.status, note } });
  }
}
