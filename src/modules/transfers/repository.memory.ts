import { MemoryTable } from "@/shared/lib/memory-table";
import type { TransferRepository } from "./repository";
import type { Transfer } from "./schemas";

export class InMemoryTransferRepository implements TransferRepository {
  private table = new MemoryTable<Transfer>();
  async insert(t: Transfer) { return this.table.insert(t); }
  async findById(id: string) { return this.table.get(id); }
  async listByCouncils(ids: readonly string[] | "all") {
    return this.table.all((t) => ids === "all" || ids.includes(t.originCouncilId) || ids.includes(t.destinationCouncilId));
  }
  async save(t: Transfer) { this.table.insert(t); return t; }
}
