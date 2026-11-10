import type { AuditRecorder } from "@/modules/audit/service";
import type { DocumentRepository } from "@/modules/documents/repository";
import { guard } from "@/shared/lib/authz/guard";
import { can, readableCouncilIds, type Actor } from "@/shared/lib/authz/policy";
import { fail, ok, type Result } from "@/shared/lib/result";
import { internalError, parseInput, type RuntimeDeps } from "@/shared/lib/service-support";
import { effectiveProgressPercent } from "./domain/completion";
import { calculateProgress, type DocumentalProgress } from "./domain/progress";
import { changeProcessStatus } from "./domain/process-status";
import { formatProcessNumber, parseProcessNumber } from "./domain/process-number";
import type { ProcessRepository } from "./repository";
import { changeProcessStatusSchema, createProcessSchema, type AdministrativeProcess } from "./schemas";

/** Visão de leitura: processo + progresso derivado (nunca editável, R3). */
export interface ProcessView {
  process: AdministrativeProcess;
  progress: DocumentalProgress;
  /** Percentual exibido; usa snapshot após limpeza (R7). */
  displayPercent: number;
  completion: "completa" | "pendente";
}

export class ProcessService {
  constructor(
    private readonly processes: ProcessRepository,
    private readonly documents: DocumentRepository,
    private readonly audit: AuditRecorder,
    private readonly runtime: RuntimeDeps,
  ) {}

  async getNextNumber(councilId: string, year?: number): Promise<string> {
    const targetYear = year ?? this.runtime.now().getFullYear();
    const seq = await this.processes.nextSequence(councilId, targetYear);
    return formatProcessNumber(seq, targetYear);
  }

  async create(actor: Actor, input: unknown): Promise<Result<AdministrativeProcess>> {
    const parsed = parseInput(createProcessSchema, input);
    if (!parsed.ok) return parsed;
    const { councilId, number, title } = parsed.data;

    const allowed = await guard(this.audit, actor, "process.create", councilId, "administrative_process");
    if (!allowed.ok) return allowed;

    const parsedNumber = parseProcessNumber(number);
    if (!parsedNumber.ok) return parsedNumber;

    try {
      const saved = await this.processes.insert({
        id: this.runtime.newId(),
        councilId,
        sequence: parsedNumber.data.sequence,
        year: parsedNumber.data.year,
        number: formatProcessNumber(parsedNumber.data.sequence, parsedNumber.data.year),
        title,
        status: "em_andamento",
        documentalCompletedAt: null,
        snapshot: null,
        closingReportRegistered: false,
        createdBy: actor.userId,
        createdAt: this.runtime.now(),
      });
      if (!saved.ok) return saved;
      await this.audit.record({ actorId: actor.userId, action: "process.create", entity: "administrative_process", entityId: saved.data.id, councilId, result: "success", details: { number } });
      return saved;
    } catch {
      return internalError();
    }
  }

  async get(actor: Actor, processId: string): Promise<Result<ProcessView>> {
    const process = await this.processes.findById(processId);
    if (!process) return fail("NOT_FOUND", "Processo não encontrado.");
    // Sem permissão de leitura, não revelamos a existência do processo.
    if (!can(actor, "council.read", process.councilId)) return fail("NOT_FOUND", "Processo não encontrado.");
    return ok(await this.toView(process));
  }

  async list(actor: Actor): Promise<Result<ProcessView[]>> {
    const scope = readableCouncilIds(actor);
    if (scope !== "all" && scope.length === 0) return ok([]);
    const rows = await this.processes.listByCouncils(scope);
    return ok(await Promise.all(rows.map((p) => this.toView(p))));
  }

  /** Alteração da situação administrativa (independe da completude documental, R4). */
  async changeStatus(actor: Actor, input: unknown): Promise<Result<AdministrativeProcess>> {
    const parsed = parseInput(changeProcessStatusSchema, input);
    if (!parsed.ok) return parsed;
    const process = await this.processes.findById(parsed.data.processId);
    if (!process) return fail("NOT_FOUND", "Processo não encontrado.");

    const allowed = await guard(this.audit, actor, "process.create", process.councilId, "administrative_process", process.id);
    if (!allowed.ok) return allowed;

    const transition = changeProcessStatus(process.status, parsed.data.status);
    if (!transition.ok) return transition;

    const updated = await this.processes.update(process.id, { status: parsed.data.status });
    if (!updated) return fail("NOT_FOUND", "Processo não encontrado.");
    await this.audit.record({ actorId: actor.userId, action: "process.status_change", entity: "administrative_process", entityId: process.id, councilId: process.councilId, result: "success", details: { from: process.status, to: parsed.data.status } });
    return ok(updated);
  }

  /** Registra o relatório de encerramento, pré-requisito da limpeza (R6). */
  async registerClosingReport(actor: Actor, processId: string): Promise<Result<AdministrativeProcess>> {
    const process = await this.processes.findById(processId);
    if (!process) return fail("NOT_FOUND", "Processo não encontrado.");
    const allowed = await guard(this.audit, actor, "retention.manage", process.councilId, "administrative_process", processId);
    if (!allowed.ok) return allowed;
    const updated = await this.processes.update(processId, { closingReportRegistered: true });
    await this.audit.record({ actorId: actor.userId, action: "process.closing_report", entity: "administrative_process", entityId: processId, councilId: process.councilId, result: "success", details: {} });
    return ok(updated!);
  }

  private async toView(process: AdministrativeProcess): Promise<ProcessView> {
    const attachments = await this.documents.listByProcess(process.id);
    const progress = calculateProgress(attachments);
    return {
      process,
      progress,
      displayPercent: effectiveProgressPercent(attachments, process.snapshot),
      completion: process.documentalCompletedAt ? "completa" : "pendente",
    };
  }
}
