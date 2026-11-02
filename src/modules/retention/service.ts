import type { AuditRecorder } from "@/modules/audit/service";
import type { DocumentRepository, StoragePort } from "@/modules/documents/repository";
import { evaluateCleanupEligibility } from "@/modules/processes/domain/cleanup-eligibility";
import { buildSnapshot } from "@/modules/processes/domain/completion";
import type { ProcessRepository } from "@/modules/processes/repository";
import type { AdministrativeProcess } from "@/modules/processes/schemas";
import { guard } from "@/shared/lib/authz/guard";
import type { Actor } from "@/shared/lib/authz/policy";
import { log } from "@/shared/lib/logger";
import { fail, ok, type Result } from "@/shared/lib/result";
import { parseInput, idSchema, type RuntimeDeps } from "@/shared/lib/service-support";
import { z } from "zod";
import type { RetentionRepository } from "./repository";

export interface CleanupSummary {
  examined: number;
  archived: number;
  disposed: number;
  skipped: number;
}

const authorizationSchema = z.object({ processId: idSchema, reference: z.string().trim().min(3, "Informe a referência do ato.") });
const holdSchema = z.object({ processId: idSchema, reason: z.string().trim().min(3, "Informe o motivo.") });

export class RetentionService {
  constructor(
    private readonly retention: RetentionRepository,
    private readonly processes: ProcessRepository,
    private readonly documents: DocumentRepository,
    private readonly storage: StoragePort,
    private readonly audit: AuditRecorder,
    private readonly runtime: RuntimeDeps,
  ) {}

  /** Registra autorização formal de retenção/descarte (P2). Somente admin central. */
  async authorizeDisposal(actor: Actor, input: unknown): Promise<Result<true>> {
    const parsed = parseInput(authorizationSchema, input);
    if (!parsed.ok) return parsed;
    const process = await this.processes.findById(parsed.data.processId);
    if (!process) return fail("NOT_FOUND", "Processo não encontrado.");
    const allowed = await guard(this.audit, actor, "retention.manage", process.councilId, "retention_authorization", process.id);
    if (!allowed.ok) return allowed;

    await this.retention.addAuthorization({ id: this.runtime.newId(), processId: process.id, authorizedBy: actor.userId, reference: parsed.data.reference, createdAt: this.runtime.now() });
    await this.audit.record({ actorId: actor.userId, action: "retention.authorize", entity: "administrative_process", entityId: process.id, councilId: process.councilId, result: "success", details: { reference: parsed.data.reference } });
    return ok(true);
  }

  async placeHold(actor: Actor, input: unknown): Promise<Result<{ holdId: string }>> {
    const parsed = parseInput(holdSchema, input);
    if (!parsed.ok) return parsed;
    const process = await this.processes.findById(parsed.data.processId);
    if (!process) return fail("NOT_FOUND", "Processo não encontrado.");
    const allowed = await guard(this.audit, actor, "retention.manage", process.councilId, "retention_hold", process.id);
    if (!allowed.ok) return allowed;

    const holdId = this.runtime.newId();
    await this.retention.addHold({ id: holdId, processId: process.id, reason: parsed.data.reason, createdBy: actor.userId, releasedAt: null });
    await this.audit.record({ actorId: actor.userId, action: "retention.hold", entity: "administrative_process", entityId: process.id, councilId: process.councilId, result: "success", details: { reason: parsed.data.reason } });
    return ok({ holdId });
  }

  /**
   * Job de limpeza documental (R6/R7), executado pela identidade técnica (actorId null).
   * Idempotente: cada (processo, conclusão, desfecho) é registrado ao concluir; passos são retomáveis.
   * - archive_only (sem autorização): apenas arquiva; NUNCA elimina fisicamente (P2).
   * - eligible_for_disposal: grava snapshot ANTES, remove binários, marca "disposed".
   */
  async runCleanup(): Promise<CleanupSummary> {
    const summary: CleanupSummary = { examined: 0, archived: 0, disposed: 0, skipped: 0 };
    const now = this.runtime.now();
    const all = await this.processes.listByCouncils("all");

    for (const process of all) {
      if (!process.documentalCompletedAt) continue;
      summary.examined += 1;
      try {
        const decision = evaluateCleanupEligibility({
          documentalCompletedAt: process.documentalCompletedAt,
          hasClosingReport: process.closingReportRegistered,
          activeHoldCount: await this.retention.countActiveHolds(process.id),
          hasRetentionAuthorization: await this.retention.hasAuthorization(process.id),
          now,
        });
        if (decision.action === "archive_only") summary.archived += (await this.archive(process, now)) ? 1 : 0;
        else if (decision.action === "eligible_for_disposal") summary.disposed += (await this.dispose(process, now)) ? 1 : 0;
        else summary.skipped += 1;
      } catch (error) {
        // Falha em um processo não interrompe os demais; será retomada na próxima execução.
        log("error", "retention.process_failed", { processId: process.id, error: String(error) });
        summary.skipped += 1;
      }
    }
    return summary;
  }

  private runKey(process: AdministrativeProcess, outcome: "archived" | "disposed"): string {
    return `${process.id}:${process.documentalCompletedAt!.toISOString()}:${outcome}`;
  }

  private async archive(process: AdministrativeProcess, now: Date): Promise<boolean> {
    const key = this.runKey(process, "archived");
    if (await this.retention.hasRun(key)) return false;
    const attachments = await this.documents.listByProcess(process.id);
    for (const a of attachments.filter((x) => x.retentionState === "retained")) {
      await this.documents.update(a.id, { retentionState: "archived" });
    }
    await this.retention.recordRun({ key, processId: process.id, outcome: "archived", at: now });
    await this.audit.record({ actorId: null, action: "retention.archive", entity: "administrative_process", entityId: process.id, councilId: process.councilId, result: "success", details: { system: "retention-job" } });
    return true;
  }

  private async dispose(process: AdministrativeProcess, now: Date): Promise<boolean> {
    const key = this.runKey(process, "disposed");
    if (await this.retention.hasRun(key)) return false;
    const attachments = await this.documents.listByProcess(process.id);
    // R7: snapshot histórico ANTES de qualquer eliminação (preservado se uma execução anterior já o gravou).
    if (!process.snapshot) await this.processes.update(process.id, { snapshot: buildSnapshot(attachments, now) });
    for (const a of attachments.filter((x) => x.retentionState !== "disposed")) {
      await this.storage.remove(a.storagePath);
      await this.documents.update(a.id, { retentionState: "disposed" });
    }
    // Registro da execução só ao final: se houver falha no meio, a próxima rodada retoma (passos idempotentes).
    await this.retention.recordRun({ key, processId: process.id, outcome: "disposed", at: now });
    await this.audit.record({ actorId: null, action: "retention.dispose", entity: "administrative_process", entityId: process.id, councilId: process.councilId, result: "success", details: { system: "retention-job", files: attachments.length } });
    return true;
  }
}
