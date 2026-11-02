import type { AlertEntityType, AlertMilestone } from "./domain/milestones";

export interface AppNotification {
  id: string;
  recipientId: string;
  /** (tipo, entidade, destinatário, marco) — UNIQUE no banco (H7). */
  dedupKey: string;
  entityType: AlertEntityType;
  entityId: string;
  milestone: AlertMilestone;
  title: string;
  body: string;
  readAt: Date | null;
  createdAt: Date;
}

/** Item monitorado por vencimento, já resolvido para um conselho. */
export interface ExpiringItem {
  entityType: AlertEntityType;
  entityId: string;
  councilId: string;
  label: string;
  endDate: string;
}
