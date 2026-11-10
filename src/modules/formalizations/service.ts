import type { AuditRecorder } from "@/modules/audit/service";
import type { InventoryService } from "@/modules/inventory/service";
import type { ProcessService } from "@/modules/processes/service";
import type { PurchaseRequestRepository } from "@/modules/purchases/repository";
import { guard } from "@/shared/lib/authz/guard";
import { can, readableCouncilIds, type Actor } from "@/shared/lib/authz/policy";
import { fail, ok, type Result } from "@/shared/lib/result";
import { parseInput, type RuntimeDeps } from "@/shared/lib/service-support";
import {
  calculateSavings,
  homologateFormalizationSchema,
  rejectFormalizationSchema,
  submitFormalizationSchema,
  type ProcessFormalization,
} from "./domain/formalization";
import type { FormalizationRepository } from "./repository";

export interface SavingsSummary {
  totalEstimated: number;
  totalContracted: number;
  totalSavings: number;
  averageSavingsPercent: number;
  count: number;
}

export class FormalizationService {
  constructor(
    private readonly repository: FormalizationRepository,
    private readonly processes: ProcessService,
    private readonly inventory: InventoryService,
    private readonly audit: AuditRecorder,
    private readonly runtime: RuntimeDeps,
    private readonly purchases?: PurchaseRequestRepository,
  ) {}

  /**
   * Submete a formalização contratual de um processo administrativo.
   * Exige 100% dos documentos obrigatórios anexados e calculada economia em relação ao valor estimado.
   */
  async submit(actor: Actor, input: unknown): Promise<Result<ProcessFormalization>> {
    const parsed = parseInput(submitFormalizationSchema, input);
    if (!parsed.ok) return parsed;
    const data = parsed.data;

    const allowed = await guard(
      this.audit,
      actor,
      "formalization.submit",
      data.councilId,
      "process_formalization",
      data.processId,
    );
    if (!allowed.ok) return allowed;

    const processView = await this.processes.get(actor, data.processId);
    if (!processView.ok) return processView;

    if (processView.data.process.councilId !== data.councilId) {
      return fail("VALIDATION", "O conselho informado não coincide com o conselho do processo.");
    }

    if (!processView.data.progress.isComplete) {
      return fail(
        "VALIDATION",
        "O processo deve possuir 100% dos documentos obrigatórios para formalização.",
      );
    }

    const existing = await this.repository.findByProcessId(data.processId);
    if (existing) {
      return fail("CONFLICT", "Já existe formalização cadastrada para este processo.");
    }

    const { savingsValue, savingsPercent } = calculateSavings(data.estimatedValue, data.contractedValue);

    const formalization: ProcessFormalization = {
      id: this.runtime.newId(),
      processId: data.processId,
      requestId: data.requestId ?? null,
      councilId: data.councilId,
      supplierId: data.supplierId,
      instrumentType: data.instrumentType,
      instrumentNumber: data.instrumentNumber,
      estimatedValue: data.estimatedValue,
      contractedValue: data.contractedValue,
      savingsValue,
      savingsPercent,
      status: "aguardando_homologacao",
      homologatedBy: null,
      homologatedAt: null,
      homologationNote: null,
      createdBy: actor.userId,
      createdAt: this.runtime.now(),
    };

    const saved = await this.repository.insert(formalization);

    await this.audit.record({
      actorId: actor.userId,
      action: "formalization.submit",
      entity: "process_formalization",
      entityId: saved.id,
      councilId: data.councilId,
      result: "success",
      details: {
        processId: data.processId,
        supplierId: data.supplierId,
        estimatedValue: data.estimatedValue,
        contractedValue: data.contractedValue,
        savingsValue,
        savingsPercent,
      },
    });

    return ok(saved);
  }

  /**
   * Homologação exclusiva de Warley (Administrador Central).
   * Converte o estoque bloqueado em saldo físico (Pronto para Uso) e atualiza status para 'homologado'.
   */
  async homologate(actor: Actor, input: unknown): Promise<Result<ProcessFormalization>> {
    const parsed = parseInput(homologateFormalizationSchema, input);
    if (!parsed.ok) return parsed;
    const data = parsed.data;

    const formalization = await this.repository.findByProcessId(data.processId);
    if (!formalization) {
      return fail("NOT_FOUND", "Formalização não encontrada para este processo.");
    }

    const allowed = await guard(
      this.audit,
      actor,
      "formalization.homologate",
      formalization.councilId,
      "process_formalization",
      formalization.id,
    );
    if (!allowed.ok) return allowed;

    if (formalization.status !== "aguardando_homologacao") {
      return fail("INVALID_STATE", `Formalização já está com status '${formalization.status}'.`);
    }

    // Identificar itens para liberação de estoque
    let items: { materialId: string; quantity: number }[] = [];
    if (data.items && data.items.length > 0) {
      items = data.items;
    } else if (formalization.requestId && this.purchases) {
      const req = await this.purchases.findById(formalization.requestId);
      if (req?.items) {
        items = req.items.map((i) => ({ materialId: i.materialId, quantity: i.quantity }));
      }
    } else if (this.purchases) {
      const reqs = await this.purchases.listByCouncils([formalization.councilId]);
      const matched = reqs.find((r) => r.processId === formalization.processId);
      if (matched?.items) {
        items = matched.items.map((i) => ({ materialId: i.materialId, quantity: i.quantity }));
      }
    }

    if (items.length > 0) {
      const released = await this.inventory.releaseBlockedStock(
        formalization.councilId,
        items,
        formalization.id,
      );
      if (!released.ok) return released;
    }

    const updated = await this.repository.update(formalization.id, {
      status: "homologado",
      homologatedBy: actor.userId,
      homologatedAt: this.runtime.now(),
      homologationNote: data.note ?? null,
    });

    await this.audit.record({
      actorId: actor.userId,
      action: "formalization.homologate",
      entity: "process_formalization",
      entityId: formalization.id,
      councilId: formalization.councilId,
      result: "success",
      details: {
        processId: formalization.processId,
        homologatedBy: actor.userId,
        itemsReleased: items.length,
        note: data.note ?? null,
      },
    });

    return ok(updated);
  }

  /**
   * Rejeição por Warley com justificativa obrigatória.
   */
  async reject(actor: Actor, input: unknown): Promise<Result<ProcessFormalization>> {
    const parsed = parseInput(rejectFormalizationSchema, input);
    if (!parsed.ok) return parsed;
    const data = parsed.data;

    const formalization = await this.repository.findByProcessId(data.processId);
    if (!formalization) {
      return fail("NOT_FOUND", "Formalização não encontrada para este processo.");
    }

    const allowed = await guard(
      this.audit,
      actor,
      "formalization.reject",
      formalization.councilId,
      "process_formalization",
      formalization.id,
    );
    if (!allowed.ok) return allowed;

    if (formalization.status !== "aguardando_homologacao") {
      return fail("INVALID_STATE", `Formalização já está com status '${formalization.status}'.`);
    }

    const updated = await this.repository.update(formalization.id, {
      status: "rejeitada",
      homologatedBy: actor.userId,
      homologatedAt: this.runtime.now(),
      homologationNote: data.note,
    });

    await this.audit.record({
      actorId: actor.userId,
      action: "formalization.reject",
      entity: "process_formalization",
      entityId: formalization.id,
      councilId: formalization.councilId,
      result: "success",
      details: {
        processId: formalization.processId,
        reason: data.note,
      },
    });

    return ok(updated);
  }

  /**
   * Consulta a formalização de um processo respeitando o isolamento do conselho.
   */
  async getByProcess(actor: Actor, processId: string): Promise<Result<ProcessFormalization | null>> {
    const formalization = await this.repository.findByProcessId(processId);
    if (!formalization) return ok(null);

    if (!can(actor, "council.read", formalization.councilId)) {
      return fail("NOT_FOUND", "Formalização não encontrada.");
    }

    return ok(formalization);
  }

  /**
   * Fila de formalizações pendentes de homologação para Warley.
   */
  async listPending(actor: Actor): Promise<Result<ProcessFormalization[]>> {
    if (!actor.isCentralAdmin && actor.memberships.length === 0) {
      return fail("FORBIDDEN", "Sem acesso.");
    }

    const scope = readableCouncilIds(actor);
    if (scope !== "all" && scope.length === 0) return ok([]);

    const list = await this.repository.listByCouncils(scope, { status: "aguardando_homologacao" });
    return ok(list);
  }

  /**
   * Consolida a economia gerada (KPI de economia acumulada).
   */
  async getSavingsSummary(actor: Actor, councilId?: string): Promise<Result<SavingsSummary>> {
    if (councilId && !can(actor, "council.read", councilId)) {
      return fail("FORBIDDEN", "Sem acesso a este conselho.");
    }

    const scope = councilId ? [councilId] : readableCouncilIds(actor);
    if (scope !== "all" && scope.length === 0) {
      return ok({
        totalEstimated: 0,
        totalContracted: 0,
        totalSavings: 0,
        averageSavingsPercent: 0,
        count: 0,
      });
    }

    const list = await this.repository.listByCouncils(scope, { status: "homologado" });

    let totalEstimated = 0;
    let totalContracted = 0;

    for (const item of list) {
      totalEstimated += item.estimatedValue;
      totalContracted += item.contractedValue;
    }

    totalEstimated = Math.round(totalEstimated * 100) / 100;
    totalContracted = Math.round(totalContracted * 100) / 100;
    const totalSavings = Math.round((totalEstimated - totalContracted) * 100) / 100;
    const averageSavingsPercent =
      totalEstimated > 0 ? Math.round(((totalSavings / totalEstimated) * 100) * 100) / 100 : 0;

    return ok({
      totalEstimated,
      totalContracted,
      totalSavings,
      averageSavingsPercent,
      count: list.length,
    });
  }

  /**
   * Lista formalizações homologadas (histórico de contratações e economia) respeitando permissões.
   */
  async listHomologated(actor: Actor, councilId?: string): Promise<Result<ProcessFormalization[]>> {
    if (councilId && !can(actor, "council.read", councilId)) {
      return fail("FORBIDDEN", "Sem acesso a este conselho.");
    }

    const scope = councilId ? [councilId] : readableCouncilIds(actor);
    if (scope !== "all" && scope.length === 0) {
      return ok([]);
    }

    const list = await this.repository.listByCouncils(scope, { status: "homologado" });
    return ok(list);
  }
}
