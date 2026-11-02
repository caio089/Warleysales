import type { NotificationRepository } from "./repository";
import type { AppNotification } from "./schemas";

export class InMemoryNotificationRepository implements NotificationRepository {
  private rows = new Map<string, AppNotification>();
  async existingKeys(keys: readonly string[]) { return new Set([...this.rows.values()].map((n) => n.dedupKey).filter((k) => keys.includes(k))); }
  async insertIfAbsent(n: AppNotification) {
    if ([...this.rows.values()].some((o) => o.dedupKey === n.dedupKey)) return false;
    this.rows.set(n.id, n);
    return true;
  }
  async listForUser(userId: string) { return [...this.rows.values()].filter((n) => n.recipientId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); }
  async markRead(id: string, userId: string, at: Date) {
    const n = this.rows.get(id);
    if (!n || n.recipientId !== userId) return false;
    n.readAt = n.readAt ?? at;
    return true;
  }
}
