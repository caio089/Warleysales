import { diffInDays, type DateOnly } from "@/shared/lib/time";

/** Marcos de alerta de vencimento, em dias restantes (0 = no dia/vencido). */
export const ALERT_MILESTONES = [90, 60, 30, 15, 7, 0] as const;
export type AlertMilestone = (typeof ALERT_MILESTONES)[number];

export type AlertEntityType = "ata" | "contract";

export interface AlertCandidate {
  entityType: AlertEntityType;
  entityId: string;
  endDate: DateOnly;
  recipientId: string;
}

/** Chave única de deduplicação (H7): (tipo, entidade, destinatário, marco). */
export const dedupKey = (c: Pick<AlertCandidate, "entityType" | "entityId" | "recipientId">, m: AlertMilestone): string =>
  `${c.entityType}:${c.entityId}:${c.recipientId}:${m}`;

/**
 * Retorna o marco mais próximo já atingido (menor marco ≥ dias restantes), ou null se
 * ainda não chegou ao primeiro marco. Se um marco anterior foi perdido (job parado),
 * emite apenas o mais urgente, sem rajada de alertas atrasados.
 */
export function reachedMilestone(endDate: DateOnly, today: DateOnly): AlertMilestone | null {
  const remaining = diffInDays(today, endDate);
  const reached = ALERT_MILESTONES.filter((m) => remaining <= m);
  return reached.length > 0 ? reached[reached.length - 1]! : null;
}

export interface DueAlert {
  candidate: AlertCandidate;
  milestone: AlertMilestone;
  key: string;
  daysRemaining: number;
}

/** Seleciona os alertas a emitir, ignorando os já enviados (idempotente entre execuções). */
export function selectDueAlerts(
  candidates: readonly AlertCandidate[],
  today: DateOnly,
  alreadySentKeys: ReadonlySet<string>,
): DueAlert[] {
  const emitted = new Set(alreadySentKeys);
  const due: DueAlert[] = [];
  for (const candidate of candidates) {
    const milestone = reachedMilestone(candidate.endDate, today);
    if (milestone === null) continue;
    const key = dedupKey(candidate, milestone);
    if (emitted.has(key)) continue;
    emitted.add(key);
    due.push({ candidate, milestone, key, daysRemaining: diffInDays(today, candidate.endDate) });
  }
  return due;
}
