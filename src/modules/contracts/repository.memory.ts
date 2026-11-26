import { MemoryTable } from "@/shared/lib/memory-table";
import type { ContractRepository } from "./repository";
import type { Contract } from "./schemas";

export class InMemoryContractRepository implements ContractRepository {
  private table = new MemoryTable<Contract>();
  async listReceiptLines() { return []; }
  async insert(c: Contract) { return this.table.insert(c); }
  async findById(id: string) { return this.table.get(id); }
  async listByCouncils(ids: readonly string[] | "all", process?: { id: string; councilId: string }) {
    return this.table.all((c) =>
      (ids === "all" || ids.includes(c.councilId))
      && (!process || c.processId === process.id || (!c.processId && c.councilId === process.councilId)),
    );
  }
  async save(c: Contract) { this.table.insert(c); return c; }
  async close(id: string, actorId: string, at: Date) {
    const existing = this.table.get(id);
    return existing && !existing.closedAt ? this.table.update(id, { closedAt: at, closedBy: actorId }) : null;
  }
}
