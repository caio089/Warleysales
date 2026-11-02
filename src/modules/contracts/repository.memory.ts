import { MemoryTable } from "@/shared/lib/memory-table";
import type { ContractRepository } from "./repository";
import type { Contract } from "./schemas";

export class InMemoryContractRepository implements ContractRepository {
  private table = new MemoryTable<Contract>();
  async insert(c: Contract) { return this.table.insert(c); }
  async findById(id: string) { return this.table.get(id); }
  async listByCouncils(ids: readonly string[] | "all") { return this.table.all((c) => ids === "all" || ids.includes(c.councilId)); }
  async save(c: Contract) { this.table.insert(c); return c; }
}
