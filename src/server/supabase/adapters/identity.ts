import type { SupabaseClient } from "@supabase/supabase-js";
import type { CouncilRepository, MembershipRepository } from "@/modules/identity/repository";
import type { Council, MembershipRecord } from "@/modules/identity/schemas";
import type { CouncilRole } from "@/shared/lib/authz/navigation";
import { fail, ok } from "@/shared/lib/result";
import { isUniqueViolation, selectAll, unwrap } from "../db";

interface CouncilRow {
  id: string;
  name: string;
  acronym: string;
  responsible_user_id: string | null;
  institutional_info: string | null;
  active: boolean;
}

const toCouncil = (row: CouncilRow): Council => ({
  id: row.id,
  name: row.name,
  acronym: row.acronym,
  responsibleUserId: row.responsible_user_id,
  institutionalInfo: row.institutional_info,
  active: row.active,
});

const toRow = (council: Council): CouncilRow => ({
  id: council.id,
  name: council.name,
  acronym: council.acronym,
  responsible_user_id: council.responsibleUserId,
  institutional_info: council.institutionalInfo,
  active: council.active,
});

export class SupabaseCouncilRepository implements CouncilRepository {
  constructor(private readonly db: SupabaseClient) {}

  async insert(council: Council) {
    const { data, error } = await this.db.from("councils").insert(toRow(council)).select().single<CouncilRow>();
    if (isUniqueViolation(error)) return fail("CONFLICT", "Já existe um conselho com esta sigla.");
    return ok(toCouncil(unwrap("councils.insert", { data, error })));
  }

  async update(council: Council) {
    const { data, error } = await this.db.from("councils").update(toRow(council)).eq("id", council.id).select().maybeSingle<CouncilRow>();
    if (isUniqueViolation(error)) return fail("CONFLICT", "Já existe um conselho com esta sigla.");
    const row = unwrap("councils.update", { data, error });
    return row ? ok(toCouncil(row)) : fail("NOT_FOUND", "Conselho não encontrado.");
  }

  async findById(id: string) {
    const row = unwrap("councils.find", await this.db.from("councils").select().eq("id", id).maybeSingle<CouncilRow>());
    return row ? toCouncil(row) : null;
  }

  async list(councilIds: readonly string[] | "all") {
    if (councilIds !== "all" && councilIds.length === 0) return [];
    const rows = await selectAll<CouncilRow>("councils.list", (from, to) => {
      const query = this.db.from("councils").select().order("acronym").range(from, to);
      return councilIds === "all" ? query : query.in("id", [...councilIds]);
    });
    return rows.map(toCouncil);
  }
}

interface MembershipRow {
  user_id: string;
  council_id: string;
  role: CouncilRole;
}

export class SupabaseMembershipRepository implements MembershipRepository {
  constructor(private readonly db: SupabaseClient) {}

  async listByCouncil(councilId: string): Promise<MembershipRecord[]> {
    const rows = unwrap("memberships.list", await this.db.from("council_memberships").select("user_id, council_id, role").eq("council_id", councilId).returns<MembershipRow[]>());
    return rows.map((r) => ({ userId: r.user_id, councilId: r.council_id, role: r.role }));
  }

  async managerIds(councilId: string): Promise<string[]> {
    // Apenas perfis ativos recebem alertas.
    const rows = unwrap(
      "memberships.managers",
      await this.db.from("council_memberships").select("user_id, profiles!inner(active)").eq("council_id", councilId).eq("role", "council_manager").eq("profiles.active", true).returns<{ user_id: string }[]>(),
    );
    return rows.map((r) => r.user_id);
  }
}
