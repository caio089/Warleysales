import type { NotificationRepository } from "./repository";
import type { AppNotification } from "./schemas";

export class InMemoryNotificationRepository implements NotificationRepository {
  private rows = new Map<string, AppNotification>();
  private emailState = new Map<string, { sentAt: Date | null; attempts: number; error: string | null }>();
  async existingKeys(keys: readonly string[]) { return new Set([...this.rows.values()].map((n) => n.dedupKey).filter((k) => keys.includes(k))); }
  async insertIfAbsent(n: AppNotification) {
    if ([...this.rows.values()].some((o) => o.dedupKey === n.dedupKey)) return false;
    this.rows.set(n.id, n);
    this.emailState.set(n.id, { sentAt: null, attempts: 0, error: null });
    return true;
  }
  async listForUser(userId: string) { return [...this.rows.values()].filter((n) => n.recipientId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); }
  async markRead(id: string, userId: string, at: Date) {
    const n = this.rows.get(id);
    if (!n || n.recipientId !== userId) return false;
    n.readAt = n.readAt ?? at;
    return true;
  }
  async listPendingEmails(limit: number) {
    return [...this.rows.values()]
      .filter((n) => !this.emailState.get(n.id)?.sentAt)
      .sort((a, b) =>
        (this.emailState.get(a.id)?.attempts ?? 0) - (this.emailState.get(b.id)?.attempts ?? 0)
        || a.createdAt.getTime() - b.createdAt.getTime(),
      )
      .slice(0, limit);
  }
  async markEmailSent(ids: readonly string[], at: Date) {
    for (const id of ids) {
      const state = this.emailState.get(id);
      if (state) this.emailState.set(id, { sentAt: at, attempts: state.attempts, error: null });
    }
  }
  async markEmailFailed(ids: readonly string[], _at: Date, reason: string) {
    for (const id of ids) {
      const state = this.emailState.get(id);
      if (state) this.emailState.set(id, { sentAt: null, attempts: state.attempts + 1, error: reason });
    }
  }
}
