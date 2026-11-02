import type { SupabaseClient } from "@supabase/supabase-js";
import type { RetentionRepository } from "@/modules/retention/repository";
import type { CleanupRun, RetentionAuthorization, RetentionHold } from "@/modules/retention/schemas";
import { isUniqueViolation, toIso, toIsoOrNull, unwrap } from "../db";

interface HoldRow {
  id: string;
  process_id: string;
  reason: string;
  created_by: string;
  released_at: string | null;
}

export class SupabaseRetentionRepository implements RetentionRepository {
  constructor(private readonly db: SupabaseClient) {}

  async addAuthorization(a: RetentionAuthorization) {
    unwrap("retention.addAuthorization", await this.db.from("retention_authorizations").insert({
      id: a.id, process_id: a.processId, authorized_by: a.authorizedBy, reference: a.reference, created_at: toIso(a.createdAt),
    }));
    return a;
  }

  async hasAuthorization(processId: string) {
    const { count, error } = await this.db.from("retention_authorizations").select("id", { count: "exact", head: true }).eq("process_id", processId);
    return unwrap("retention.hasAuthorization", { data: count, error }) > 0;
  }

  async addHold(hold: RetentionHold) {
    unwrap("retention.addHold", await this.db.from("retention_holds").insert({
      id: hold.id, process_id: hold.processId, reason: hold.reason, created_by: hold.createdBy, released_at: toIsoOrNull(hold.releasedAt),
    }));
    return hold;
  }

  async releaseHold(holdId: string, at: Date) {
    // Só libera bloqueios ainda ativos; retorna false se não existir ou já liberado.
    const rows = unwrap("retention.releaseHold", await this.db.from("retention_holds").update({ released_at: toIso(at) }).eq("id", holdId).is("released_at", null).select("id").returns<HoldRow[]>());
    return rows.length > 0;
  }

  async countActiveHolds(processId: string) {
    const { count, error } = await this.db.from("retention_holds").select("id", { count: "exact", head: true }).eq("process_id", processId).is("released_at", null);
    return unwrap("retention.countActiveHolds", { data: count, error });
  }

  async hasRun(key: string) {
    const { count, error } = await this.db.from("document_cleanup_runs").select("key", { count: "exact", head: true }).eq("key", key);
    return unwrap("retention.hasRun", { data: count, error }) > 0;
  }

  async recordRun(run: CleanupRun) {
    const { error } = await this.db.from("document_cleanup_runs").insert({ key: run.key, process_id: run.processId, outcome: run.outcome, at: toIso(run.at) });
    if (isUniqueViolation(error)) return; // idempotente: execução já registrada
    unwrap("retention.recordRun", { data: null, error });
  }
}

