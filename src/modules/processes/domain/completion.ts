import type { DocumentalProgress, ProcessAttachment } from "./progress";
import { calculateProgress } from "./progress";
import type { DocumentTypeCode } from "./document-types";

export type CompletionEvent = "completed" | "reverted" | "none";

export interface CompletionState {
  /** Instante (UTC) da última aquisição de 100%; null quando incompleto. */
  documentalCompletedAt: Date | null;
}

export interface CompletionTransition {
  state: CompletionState;
  event: CompletionEvent;
  /** R5: ao reverter, a elegibilidade à limpeza é cancelada. */
  cancelCleanupEligibility: boolean;
}

/**
 * R4/R5: reavalia a completude após qualquer mudança de anexos.
 * - Atingiu 100% e não estava completo: grava `documentalCompletedAt = now`.
 * - Perdeu 100%: zera o instante e registra reversão.
 * - Caso contrário: nada muda (o instante original é preservado).
 * Completude documental não altera a situação administrativa (R4).
 */
export function reevaluateCompletion(
  previous: CompletionState,
  progress: DocumentalProgress,
  now: Date,
): CompletionTransition {
  const wasComplete = previous.documentalCompletedAt !== null;

  if (progress.isComplete && !wasComplete) {
    return { state: { documentalCompletedAt: now }, event: "completed", cancelCleanupEligibility: false };
  }
  if (!progress.isComplete && wasComplete) {
    return { state: { documentalCompletedAt: null }, event: "reverted", cancelCleanupEligibility: true };
  }
  return { state: previous, event: "none", cancelCleanupEligibility: false };
}

/** Snapshot histórico dos 7 tipos (R7), gravado antes de qualquer limpeza autorizada. */
export interface DocumentalSnapshot {
  takenAt: Date;
  types: Record<DocumentTypeCode, boolean>;
  percent: number;
}

export function buildSnapshot(attachments: readonly ProcessAttachment[], takenAt: Date): DocumentalSnapshot {
  const progress = calculateProgress(attachments);
  const types = Object.fromEntries(
    [...progress.validTypes.map((c) => [c, true]), ...progress.missingTypes.map((c) => [c, false])],
  ) as Record<DocumentTypeCode, boolean>;
  return { takenAt, types, percent: progress.percent };
}

/**
 * R7: após a limpeza, os anexos físicos somem, mas o progresso exibido deriva do snapshot,
 * então o processo nunca volta a 0%. Sem snapshot, usa o cálculo ao vivo.
 */
export function effectiveProgressPercent(
  attachments: readonly ProcessAttachment[],
  snapshot: DocumentalSnapshot | null,
): number {
  const live = calculateProgress(attachments).percent;
  return snapshot ? Math.max(live, snapshot.percent) : live;
}
