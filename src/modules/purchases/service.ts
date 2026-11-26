import type { AtaService } from "@/modules/atas/service";
import type { AuditRecorder } from "@/modules/audit/service";
import type { ContractService } from "@/modules/contracts/service";
import type { InventoryService } from "@/modules/inventory/service";
import type { ProcessService } from "@/modules/processes/service";
import { guard } from "@/shared/lib/authz/guard";
import { can, readableCouncilIds, type Actor, type PermissionAction } from "@/shared/lib/authz/policy";
import { fail, ok, type Result } from "@/shared/lib/result";
import { parseInput, type RuntimeDeps } from "@/shared/lib/service-support";
import {
  assertContractAllowsReceive,
  assertReceiveLinesWithinContract,
  contractedQuantityByAtaItem,
  receivedQuantitiesByProcess,
} from "./domain/receive-contract-gate";
import { applyReceipt } from "./domain/receipt";
import { changeRequestStatus, reopenRejected, type PurchaseRequestStatus } from "./domain/request-status";
import type { PurchaseRequestRepository } from "./repository";
import { cancelSchema, createRequestSchema, decisionSchema, receiveSchema, rejectSchema, reopenSchema, requestIdSchema, type PurchaseRequest } from "./schemas";

export class PurchaseRequestService {
  constructor(
    private readonly repository: PurchaseRequestRepository,
    _atas: AtaService,
    private readonly inventory: InventoryService,
    private readonly processes: ProcessService,
    private readonly audit: AuditRecorder,
    private readonly runtime: RuntimeDeps,
    private readonly contracts?: ContractService,
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

    const items: { materialId: string; quantity: number; ataItemId: string | null }[] = [];
    for (const item of d.items) {
      if (item.materialId) {
        items.push({ materialId: item.materialId, quantity: item.quantity, ataItemId: item.ataItemId ?? null });
        continue;
      }
      const material = await this.inventory.ensureMaterial({ name: item.description ?? "", unit: item.unit });
      if (!material.ok) return material;
      items.push({ materialId: material.data.id, quantity: item.quantity, ataItemId: item.ataItemId ?? null });
    }

    // A quantidade pedida entra bloqueada: visível no estoque, mas indisponível para pedido até a liberação.
    if (items.length > 0) {
      const provisioned = await this.inventory.provisionBlocked(actor, d.councilId, items);
      if (!provisioned.ok) return provisioned;
    }

    const saved = await this.repository.insert({
      id: this.runtime.newId(), councilId: d.councilId, title: d.title, status: "rascunho",
      processId,
      estimatedValue: d.estimatedValue ?? null,
      items: items.map((i) => ({ id: this.runtime.newId(), materialId: i.materialId, quantity: i.quantity, ataItemId: i.ataItemId, receivedTotal: 0 })),
      events: [{ from: null, to: "rascunho", actorId: actor.userId, at: now }],
      receiptKeys: [], createdBy: actor.userId, createdAt: now,
    });
    await this.audit.record({ actorId: actor.userId, action: "request.create", entity: "purchase_request", entityId: saved.id, councilId: d.councilId, result: "success", details: {} });
    return ok(saved);
  }

  submit(actor: Actor, input: unknown) { return this.simpleStep(actor, input, requestIdSchema, "enviada", "request.create"); }
  startReview(actor: Actor, input: unknown) { return this.simpleStep(actor, input, requestIdSchema, "em_analise", "request.decide"); }

  /** Pedir ajuste: de enviada, entra em análise e já devolve com o motivo. */
  async requestCorrection(actor: Actor, input: unknown): Promise<Result<PurchaseRequest>> {
    const parsed = parseInput(rejectSchema, input);
    if (!parsed.ok) return parsed;
    const loaded = await this.loadForDecision(actor, parsed.data.requestId);
    if (!loaded.ok) return loaded;
    const valid = changeRequestStatus(loaded.data.status, "aguardando_correcao");
    if (!valid.ok) return valid;
    return ok(await this.transition(loaded.data, "aguardando_correcao", actor, parsed.data.note));
  }

  /** Recusar: de enviada, entra em análise e já rejeita com o motivo. */
  async reject(actor: Actor, input: unknown): Promise<Result<PurchaseRequest>> {
    const parsed = parseInput(rejectSchema, input);
    if (!parsed.ok) return parsed;
    const loaded = await this.loadForDecision(actor, parsed.data.requestId);
    if (!loaded.ok) return loaded;
    const valid = changeRequestStatus(loaded.data.status, "rejeitada");
    if (!valid.ok) return valid;
    return ok(await this.transition(loaded.data, "rejeitada", actor, parsed.data.note));
  }

  /** Reenvio após correção volta para análise (aguardando_correcao → em_analise). */
  resubmitAfterCorrection(actor: Actor, input: unknown) { return this.simpleStep(actor, input, requestIdSchema, "em_analise", "request.create"); }

  /**
   * Aprovar NÃO libera estoque físico (R11 — isso ocorre na homologação).
   * Libera o processo para documentação e o fluxo de recebimento.
   * De enviada, entra em análise e aprova no mesmo passo.
   * O saldo da ata é comprometido quando o contrato é criado.
   */
  async approve(actor: Actor, input: unknown): Promise<Result<PurchaseRequest>> {
    const parsed = parseInput(decisionSchema, input);
    if (!parsed.ok) return parsed;
    const loaded = await this.loadForDecision(actor, parsed.data.requestId);
    if (!loaded.ok) return loaded;
    const request = loaded.data;
    const valid = changeRequestStatus(request.status, "aprovada");
    if (!valid.ok) return valid;

    // Caminho transacional (Supabase): status e evento em uma única transação SQL.
    if (this.repository.approveAtomically) {
      const saved = await this.repository.approveAtomically({ requestId: request.id, actorId: actor.userId, at: this.runtime.now(), note: parsed.data.note });
      if (!saved.ok) return saved;
      await this.recordTransition(request, "aprovada", actor, parsed.data.note);
      return ok(saved.data);
    }

    return ok(await this.transition(request, "aprovada", actor, parsed.data.note));
  }

  /** Cancelar a solicitação não altera o saldo já comprometido por contratos. Exige motivo. */
  async cancel(actor: Actor, input: unknown): Promise<Result<PurchaseRequest>> {
    const parsed = parseInput(cancelSchema, input);
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

    if (this.repository.receiveAtomically) {
      const received = await this.repository.receiveAtomically({
        requestId: request.id, actorId: actor.userId, at: this.runtime.now(),
        receiptKey: parsed.data.receiptKey, lines: parsed.data.lines,
        closeIncomplete: parsed.data.closeIncomplete,
        incompleteJustification: parsed.data.incompleteJustification,
      });
      if (!received.ok) return received;
      await this.audit.record({
        actorId: actor.userId, action: "purchase.receive", entity: "purchase_request",
        entityId: request.id, councilId: request.councilId, result: "success",
        details: { receiptKey: parsed.data.receiptKey },
      });
      return received;
    }

    // Parte 3: entrada no estoque só após contrato (e, no registro de preços, contrato↔ata).
    if (!this.contracts) return fail("UNAVAILABLE", "Não foi possível conferir os contratos para o recebimento.");
    {
      if (!request.processId) return fail("INVALID_STATE", "Vincule a solicitação a um processo antes do recebimento.");
      const processView = await this.processes.get(actor, request.processId);
      if (!processView.ok) return processView;
      const contractingMode = processView.data.process.contractingMode ?? null;
      const listed = await this.contracts.list(actor, { id: request.processId, councilId: request.councilId });
      if (!listed.ok) return listed;
      const contracts = listed.data
        .filter((view) => view.contract.processId === request.processId)
        .map((view) => ({
            processId: view.contract.processId ?? null,
            ataId: view.contract.ataId ?? null,
            ataItems: (view.contract.ataItems ?? []).map((item) => ({
              ataItemId: item.ataItemId,
              quantity: item.quantity,
            })),
          }));
      const gate = assertContractAllowsReceive({
        processId: request.processId,
        contractingMode,
        requestItems: request.items,
        contracts,
      });
      if (!gate.ok) return gate;
      const contractedByAtaItem = contractedQuantityByAtaItem(contracts, request.processId);
      const linkedRequests = await this.repository.listByCouncils([request.councilId]);
      const receivedByAtaItem = receivedQuantitiesByProcess(linkedRequests).get(request.processId);
      const within = assertReceiveLinesWithinContract({
        items: request.items,
        lines: parsed.data.lines,
        contractedByAtaItem,
        receivedByAtaItem,
      });
      if (!within.ok) return within;
    }

    const outcome = applyReceipt(request.items.map((i) => ({ itemId: i.id, expected: i.quantity, receivedBefore: i.receivedTotal })), parsed.data.lines);
    if (!outcome.ok) return outcome;

    const isClosingIncomplete = parsed.data.closeIncomplete === true && !outcome.data.fullyReceived;
    if (isClosingIncomplete) {
      const justification = parsed.data.incompleteJustification?.trim();
      if (!justification) {
        return fail("VALIDATION", "Justificativa obrigatória para encerramento de entrega com saldo pendente.", {
          incompleteJustification: ["Justificativa obrigatória para encerramento de entrega com saldo pendente."],
        });
      }
      if (justification.length < 15) {
        return fail("VALIDATION", "A justificativa deve ter no mínimo 15 caracteres.", {
          incompleteJustification: ["A justificativa deve ter no mínimo 15 caracteres."],
        });
      }
    }

    // Entrada no ledger por linha, cada uma com chave idempotente própria.
    for (const line of parsed.data.lines) {
      const item = request.items.find((i) => i.id === line.itemId)!;
      const entry = await this.inventory.applyInternal({
        councilId: request.councilId, materialId: item.materialId, type: "entry", quantity: line.received,
        idempotencyKey: `receipt:${parsed.data.receiptKey}:${line.itemId}`, reason: "Recebimento de compra", reference: `request:${request.id}`, actorId: actor.userId,
      });
      if (!entry.ok) return entry;
    }

    const targetStatus = isClosingIncomplete ? "atendida" : outcome.data.requestStatus;
    let current = request;
    if (current.status === "aprovada") current = await this.transition(current, "em_atendimento", actor);
    const updated: PurchaseRequest = {
      ...current,
      items: current.items.map((i) => ({ ...i, receivedTotal: outcome.data.items.find((r) => r.itemId === i.id)!.receivedTotal })),
      receiptKeys: [...current.receiptKeys, parsed.data.receiptKey],
    };
    const finalStatus = changeRequestStatus(updated.status, targetStatus);
    if (!finalStatus.ok) return finalStatus;

    const result = await this.transition(updated, targetStatus, actor, isClosingIncomplete ? parsed.data.incompleteJustification?.trim() : undefined);

    if (isClosingIncomplete) {
      await this.audit.record({
        actorId: actor.userId,
        action: "purchase.receive_incomplete",
        entity: "purchase_request",
        entityId: request.id,
        councilId: request.councilId,
        result: "success",
        details: {
          justification: parsed.data.incompleteJustification?.trim(),
          receiptKey: parsed.data.receiptKey,
        },
      });
    }

    return ok(result);
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

  async listLinkedNotes(actor: Actor) {
    const scope = readableCouncilIds(actor);
    return ok(await this.repository.listLinkedNotesByCouncils(scope));
  }

  async findLinkedByProcess(actor: Actor, processId: string) {
    return ok(await this.repository.findLinkedByProcess(processId, readableCouncilIds(actor)));
  }

  /**
   * Carrega a solicitação para decisão do Warley.
   * Se ainda estiver só enviada, abre a análise automaticamente (um clique aprova/recusa).
   */
  private async loadForDecision(actor: Actor, requestId: string): Promise<Result<PurchaseRequest>> {
    const request = await this.repository.findById(requestId);
    if (!request) return fail("NOT_FOUND", "Solicitação não encontrada.");
    const allowed = await guard(this.audit, actor, "request.decide", request.councilId, "purchase_request", request.id);
    if (!allowed.ok) return allowed;
    if (request.status !== "enviada") return ok(request);
    const opened = changeRequestStatus(request.status, "em_analise");
    if (!opened.ok) return opened;
    return ok(await this.transition(request, "em_analise", actor));
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
