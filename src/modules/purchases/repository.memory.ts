import { MemoryTable } from "@/shared/lib/memory-table";
import type { PurchaseRequestRepository } from "./repository";
import type { PurchaseRequest } from "./schemas";

export class InMemoryPurchaseRequestRepository implements PurchaseRequestRepository {
  private table = new MemoryTable<PurchaseRequest>();
  async insert(r: PurchaseRequest) { return this.table.insert(r); }
  async findById(id: string) { return this.table.get(id); }
  async listByCouncils(ids: readonly string[] | "all") { return this.table.all((r) => ids === "all" || ids.includes(r.councilId)); }
  async save(r: PurchaseRequest) { this.table.insert(r); return r; }
}
