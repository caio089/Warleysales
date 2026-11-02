import type { AuditRecorder } from "@/modules/audit/service";
import type { DocumentRepository } from "@/modules/documents/repository";
import { reevaluateCompletion, type CompletionEvent } from "./domain/completion";
import { calculateProgress } from "./domain/progress";
import type { ProcessRepository } from "./repository";

/**
 * Reavalia a completude documental após mudança de anexos e persiste R5.
 * Fonte única da regra: usada por DocumentService e RetentionService (sem duplicação).
 * Processos já limpos (snapshot, R7) ficam congelados: o desaparecimento físico
 * dos anexos não é "perda de documento" e não gera reversão.
 */
export async function refreshCompletion(
  deps: { processes: ProcessRepository; documents: DocumentRepository; audit: AuditRecorder },
  processId: string,
  actorId: string | null,
  now: Date,
): Promise<CompletionEvent> {
  const process = await deps.processes.findById(processId);
  if (!process || process.snapshot) return "none";

  const attachments = await deps.documents.listByProcess(processId);
  const progress = calculateProgress(attachments);
  const transition = reevaluateCompletion({ documentalCompletedAt: process.documentalCompletedAt }, progress, now);

  if (transition.event !== "none") {
    await deps.processes.update(processId, { documentalCompletedAt: transition.state.documentalCompletedAt });
    await deps.audit.record({
      actorId,
      action: transition.event === "completed" ? "process.documental_completed" : "process.documental_reverted",
      entity: "administrative_process",
      entityId: processId,
      councilId: process.councilId,
      result: "success",
      details: { percent: progress.percent, cancelCleanupEligibility: transition.cancelCleanupEligibility },
    });
  }
  return transition.event;
}
