import { fail, ok, type Result } from "@/shared/lib/result";
import type { CouncilRepository, MembershipRepository } from "./repository";
import type { Council, MembershipRecord } from "./schemas";

export class InMemoryCouncilRepository implements CouncilRepository {
  private rows = new Map<string, Council>();
  async insert(c: Council): Promise<Result<Council>> {
    if ([...this.rows.values()].some((o) => o.acronym.toLowerCase() === c.acronym.toLowerCase())) return fail("CONFLICT", "Já existe uma organização com esta sigla.");
    this.rows.set(c.id, c);
    return ok(c);
  }
  async update(c: Council): Promise<Result<Council>> { this.rows.set(c.id, c); return ok(c); }
  async findById(id: string) { return this.rows.get(id) ?? null; }
  async list(ids: readonly string[] | "all") { return [...this.rows.values()].filter((c) => ids === "all" || ids.includes(c.id)); }
}

export class InMemoryMembershipRepository implements MembershipRepository {
  constructor(private readonly records: MembershipRecord[] = [], private readonly profiles: { id: string; fullName: string; active: boolean; staffCategory?: "unclassified" | "collaborator" | "intern" }[] = []) {}
  async listByCouncil(councilId: string) { return this.records.filter((r) => r.councilId === councilId); }
  async listAll() { return [...this.records]; }
  async listProfiles() { return [...this.profiles]; }
  async setStaffCategory(userId: string, category: "unclassified" | "collaborator" | "intern") {
    const profile = this.profiles.find((p) => p.id === userId);
    if (!profile) return false;
    profile.staffCategory = category;
    return true;
  }
  async upsert(record: MembershipRecord) {
    const i = this.records.findIndex((r) => r.userId === record.userId && r.councilId === record.councilId);
    if (i >= 0) this.records[i] = record;
    else this.records.push(record);
  }
  async remove(userId: string, councilId: string) {
    const i = this.records.findIndex((r) => r.userId === userId && r.councilId === councilId);
    if (i < 0) return false;
    this.records.splice(i, 1);
    return true;
  }
  async managerIds(councilId: string) { return this.records.filter((r) => r.councilId === councilId && r.role === "council_manager").map((r) => r.userId); }
}
