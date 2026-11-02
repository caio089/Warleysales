import { addDaysToInstant } from "@/shared/lib/time";

/** Janela corrida, em dias, após a última aquisição de 100% (R6). */
export const CLEANUP_WAIT_DAYS = 30;

export interface CleanupInput {
  documentalCompletedAt: Date | null;
  hasClosingReport: boolean;
  /** Bloqueios ativos (retention_holds): auditoria, litígio, etc. */
  activeHoldCount: number;
  hasRetentionAuthorization: boolean;
  now: Date;
}

/**
 * - not_eligible: condição temporal ou documental não atendida (nada a fazer).
 * - blocked: bloqueio ativo ou falta de relatório de encerramento (mantém).
 * - archive_only: tudo pronto, mas sem autorização de retenção => só arquivar (padrão seguro P2).
 * - eligible_for_disposal: todas as condições do R6 atendidas.
 */
export type CleanupDecision =
  | { action: "not_eligible"; reasons: string[] }
  | { action: "blocked"; reasons: string[] }
  | { action: "archive_only"; reasons: string[] }
  | { action: "eligible_for_disposal"; reasons: [] };

export function evaluateCleanupEligibility(input: CleanupInput): CleanupDecision {
  if (!input.documentalCompletedAt) {
    return { action: "not_eligible", reasons: ["Processo não está com 100% documental."] };
  }

  const eligibleAt = addDaysToInstant(input.documentalCompletedAt, CLEANUP_WAIT_DAYS);
  if (input.now.getTime() < eligibleAt.getTime()) {
    return {
      action: "not_eligible",
      reasons: [`Aguardando ${CLEANUP_WAIT_DAYS} dias corridos desde a última conclusão documental.`],
    };
  }

  const blockers: string[] = [];
  if (!input.hasClosingReport) blockers.push("Relatório de encerramento ausente.");
  if (input.activeHoldCount > 0) blockers.push("Existe bloqueio de retenção ativo.");
  if (blockers.length > 0) return { action: "blocked", reasons: blockers };

  if (!input.hasRetentionAuthorization) {
    return { action: "archive_only", reasons: ["Sem autorização de retenção: apenas arquivar, sem eliminação física."] };
  }
  return { action: "eligible_for_disposal", reasons: [] };
}
