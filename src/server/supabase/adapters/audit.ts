import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuditRepository } from "@/modules/audit/repository";
import type { AuditEntry, AuditFilter, NewAuditEntry } from "@/modules/audit/schemas";
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

const parseDateRange = (startDate?: string | Date, endDate?: string | Date) => {
  const start = startDate
    ? typeof startDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(startDate)
      ? new Date(`${startDate}T00:00:00.000Z`)
      : new Date(startDate)
    : null;
  const end = endDate
    ? typeof endDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(endDate)
      ? new Date(`${endDate}T23:59:59.999Z`)
      : new Date(endDate)
    : null;
  return { start, end };
};

/** Auditoria append-only: o banco também bloqueia UPDATE/DELETE (trigger forbid_mutation). */
export class SupabaseAuditRepository implements AuditRepository {
  constructor(private readonly db: SupabaseClient) {}

  async append(entry: NewAuditEntry): Promise<AuditEntry> {
    const row = unwrap(
      "audit.append",
      await this.db.from("audit_logs").insert({
        actor_id: entry.actorId,
        action: entry.action,
        entity: entry.entity,
        entity_id: entry.entityId,
        council_id: entry.councilId,
        result: entry.result,
        details: entry.details,
      }).select().single<AuditRow>(),
    );
    return toEntry(row);
  }

  async list(filter: AuditFilter = {}): Promise<AuditEntry[]> {
    if (filter.councilIds !== undefined && filter.councilIds !== "all" && filter.councilIds.length === 0) {
      return [];
    }
    // Mais recentes primeiro, limitado para não carregar a trilha inteira (consulta paginada fica como evolução).
    let query = this.db.from("audit_logs").select().order("id", { ascending: false }).limit(AUDIT_LIST_LIMIT);
    if (filter.councilIds !== undefined && filter.councilIds !== "all") {
      query = query.in("council_id", [...filter.councilIds]);
    } else if (filter.councilId) {
      query = query.eq("council_id", filter.councilId);
    }
    if (filter.entity) query = query.eq("entity", filter.entity);
    if (filter.entityId) query = query.eq("entity_id", filter.entityId);
    if (filter.actorId) query = query.eq("actor_id", filter.actorId);
    if (filter.action) query = query.eq("action", filter.action);
    if (filter.result) query = query.eq("result", filter.result);

    const { start, end } = parseDateRange(filter.startDate, filter.endDate);
    if (start) query = query.gte("created_at", start.toISOString());
    if (end) query = query.lte("created_at", end.toISOString());

    const rows = unwrap("audit.list", await query.returns<AuditRow[]>());
    return rows.map(toEntry);
  }
}
