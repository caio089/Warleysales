import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuditRepository } from "@/modules/audit/repository";
import type { AuditEntry, NewAuditEntry } from "@/modules/audit/schemas";
import { toDate, unwrap } from "../db";

const AUDIT_LIST_LIMIT = 1000;

interface AuditRow {
  id: number;
  actor_id: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  council_id: string | null;
  result: AuditEntry["result"];
  details: Record<string, unknown>;
  created_at: string;
}

const toEntry = (row: AuditRow): AuditEntry => ({
  id: String(row.id),
  actorId: row.actor_id,
  action: row.action,
  entity: row.entity,
  entityId: row.entity_id,
  councilId: row.council_id,
  result: row.result,
  details: row.details,
  createdAt: toDate(row.created_at),
});

/** Auditoria append-only: o banco também bloqueia UPDATE/DELETE (trigger forbid_mutation). */
export class SupabaseAuditRepository implements AuditRepository {
  constructor(private readonly db: SupabaseClient) {}

  async append(entry: NewAuditEntry): Promise<AuditEntry> {
    const row = unwrap(
      "audit.append",
      await this.db.from("audit_logs").insert({
        actor_id: entry.actorId, action: entry.action, entity: entry.entity, entity_id: entry.entityId,
        council_id: entry.councilId, result: entry.result, details: entry.details,
      }).select().single<AuditRow>(),
    );
    return toEntry(row);
  }

  async list(filter: { councilIds: readonly string[] | "all"; entity?: string; entityId?: string }): Promise<AuditEntry[]> {
    if (filter.councilIds !== "all" && filter.councilIds.length === 0) return [];
    // Mais recentes primeiro, limitado para não carregar a trilha inteira (consulta paginada fica como evolução).
    let query = this.db.from("audit_logs").select().order("id", { ascending: false }).limit(AUDIT_LIST_LIMIT);
    if (filter.councilIds !== "all") query = query.in("council_id", [...filter.councilIds]);
    if (filter.entity) query = query.eq("entity", filter.entity);
    if (filter.entityId) query = query.eq("entity_id", filter.entityId);
    const rows = unwrap("audit.list", await query.returns<AuditRow[]>());
    return rows.map(toEntry);
  }
}
