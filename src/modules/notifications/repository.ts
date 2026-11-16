import type { AppNotification, ExpiringItem } from "./schemas";

export interface NotificationRepository {
  existingKeys(keys: readonly string[]): Promise<Set<string>>;
  /** Insere ignorando duplicatas pela chave única; retorna false quando já existia. */
  insertIfAbsent(notification: AppNotification): Promise<boolean>;
  listForUser(userId: string): Promise<AppNotification[]>;
  markRead(id: string, userId: string, at: Date): Promise<boolean>;
  listPendingEmails(limit: number): Promise<AppNotification[]>;
  markEmailSent(ids: readonly string[], at: Date): Promise<void>;
  markEmailFailed(ids: readonly string[], at: Date, reason: string): Promise<void>;
}

/** Fonte dos itens com vencimento (atas vigentes + contratos) e destinatários. */
export interface AlertSource {
  listExpiring(): Promise<ExpiringItem[]>;
  recipientsFor(councilId: string): Promise<string[]>;
}
