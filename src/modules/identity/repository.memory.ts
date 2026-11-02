import { fail, ok, type Result } from "@/shared/lib/result";
import type { CouncilRepository, MembershipRepository } from "./repository";
import type { Council, MembershipRecord } from "./schemas";

export class InMemoryCouncilRepository implements CouncilRepository {
  private rows = new Map<string, Council>();
  async insert(c: Council): Promise<Result<Council>> {
    if ([...this.rows.values()].some((o) => o.acronym.toLowerCase() === c.acronym.toLowerCase())) return fail("CONFLICT", "Já existe conselho com esta sigla.");
    this.rows.set(c.id, c);
    return ok(c);
  }
  async update(c: Council): Promise<Result<Council>> { this.rows.set(c.id, c); return ok(c); }
  async findById(id: string) { return this.rows.get(id) ?? null; }
  async list(ids: readonly string[] | "all") { return [...this.rows.values()].filter((c) => ids === "all" || ids.includes(c.id)); }
}

export class InMemoryMembershipRepository implements MembershipRepository {
  constructor(private readonly records: MembershipRecord[] = []) {}
  async listByCouncil(councilId: string) { return this.records.filter((r) => r.councilId === councilId); }
  async managerIds(councilId: string) { return this.records.filter((r) => r.councilId === councilId && r.role === "council_manager").map((r) => r.userId); }
}
