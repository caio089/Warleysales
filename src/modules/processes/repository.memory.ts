import { fail, ok, type Result } from "@/shared/lib/result";
import { MemoryTable } from "@/shared/lib/memory-table";
import type { ProcessRepository } from "./repository";
import type { AdministrativeProcess } from "./schemas";

export class InMemoryProcessRepository implements ProcessRepository {
  private table = new MemoryTable<AdministrativeProcess>();

  async insert(process: AdministrativeProcess): Promise<Result<AdministrativeProcess>> {
    const duplicate = this.table.all((p) => p.councilId === process.councilId && p.number === process.number);
    if (duplicate.length > 0) return fail("CONFLICT", "Já existe um processo com este número neste conselho.");
    return ok(this.table.insert(process));
  }
  async findById(id: string) { return this.table.get(id); }
  async listByCouncils(councilIds: readonly string[] | "all") {
    return this.table.all((p) => councilIds === "all" || councilIds.includes(p.councilId));
  }
  async update(id: string, changes: Partial<AdministrativeProcess>) { return this.table.update(id, changes); }
  async nextSequence(councilId: string, year: number): Promise<number> {
    const matches = this.table.all((p) => p.councilId === councilId && p.year === year);
    if (matches.length === 0) return 1;
    const max = Math.max(...matches.map((p) => p.sequence));
    return max + 1;
  }
}
