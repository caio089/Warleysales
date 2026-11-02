import type { SupabaseClient } from "@supabase/supabase-js";
import type { AlertMilestone } from "@/modules/notifications/domain/milestones";
import type { NotificationRepository } from "@/modules/notifications/repository";
import type { AppNotification } from "@/modules/notifications/schemas";
import { isUniqueViolation, selectAll, toDate, toDateOrNull, toIso, unwrap } from "../db";

interface NotificationRow {
  id: string;
  recipient_id: string;
  dedup_key: string;
  entity_type: AppNotification["entityType"];
  entity_id: string;
  milestone: AlertMilestone;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
}

const toNotification = (row: NotificationRow): AppNotification => ({
  id: row.id, recipientId: row.recipient_id, dedupKey: row.dedup_key, entityType: row.entity_type, entityId: row.entity_id,
  milestone: row.milestone, title: row.title, body: row.body, readAt: toDateOrNull(row.read_at), createdAt: toDate(row.created_at),
});

export class SupabaseNotificationRepository implements NotificationRepository {
  constructor(private readonly db: SupabaseClient) {}

  async existingKeys(keys: readonly string[]) {
    const found = new Set<string>();
    const CHUNK = 200; // evita URLs longas demais no filtro IN
    for (let start = 0; start < keys.length; start += CHUNK) {
      const rows = unwrap("notifications.existing", await this.db.from("notifications").select("dedup_key").in("dedup_key", keys.slice(start, start + CHUNK)).returns<{ dedup_key: string }[]>());
      rows.forEach((r) => found.add(r.dedup_key));
    }
    return found;
  }

  /** A chave única (dedup_key) garante, mesmo sob concorrência, que cada marco gera um único aviso (H7). */
  async insertIfAbsent(n: AppNotification) {
    const { error } = await this.db.from("notifications").insert({
      id: n.id, recipient_id: n.recipientId, dedup_key: n.dedupKey, entity_type: n.entityType, entity_id: n.entityId,
      milestone: n.milestone, title: n.title, body: n.body, read_at: null, created_at: toIso(n.createdAt),
    });
    if (isUniqueViolation(error)) return false;
    unwrap("notifications.insert", { data: null, error });
    return true;
  }

  async listForUser(userId: string) {
    const rows = await selectAll<NotificationRow>("notifications.list", (from, to) =>
      this.db.from("notifications").select().eq("recipient_id", userId).order("created_at", { ascending: false }).range(from, to),
    );
    return rows.map(toNotification);
  }

  async markRead(id: string, userId: string, at: Date) {
    const row = unwrap("notifications.find", await this.db.from("notifications").select("id, read_at").eq("id", id).eq("recipient_id", userId).maybeSingle<{ id: string; read_at: string | null }>());
    if (!row) return false;
    if (row.read_at === null) unwrap("notifications.markRead", await this.db.from("notifications").update({ read_at: toIso(at) }).eq("id", id).is("read_at", null));
    return true;
  }
}
