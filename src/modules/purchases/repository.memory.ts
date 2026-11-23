import { MemoryTable } from "@/shared/lib/memory-table";
import type { PurchaseRequestRepository } from "./repository";
import type { PurchaseRequest } from "./schemas";

export class InMemoryPurchaseRequestRepository implements PurchaseRequestRepository {
  private table = new MemoryTable<PurchaseRequest>();
  async insert(r: PurchaseRequest) {
    const entity: PurchaseRequest = { ...r, processId: r.processId ?? null, estimatedValue: r.estimatedValue ?? null };
    return this.table.insert(entity);
  }
  async findById(id: string) {
    const item = this.table.get(id);
    return item ? { ...item, processId: item.processId ?? null, estimatedValue: item.estimatedValue ?? null } : null;
  }
  async listByCouncils(ids: readonly string[] | "all") {
    const items = this.table.all((r) => ids === "all" || ids.includes(r.councilId));
    return items.map((r) => ({ ...r, processId: r.processId ?? null, estimatedValue: r.estimatedValue ?? null }));
  }
  async findLinkedByProcess(processId: string, ids: readonly string[] | "all") {
    return this.table.all((request) =>
      request.processId === processId && (ids === "all" || ids.includes(request.councilId)),
    )[0] ?? null;
  }
  async save(r: PurchaseRequest) {
    const entity: PurchaseRequest = { ...r, processId: r.processId ?? null, estimatedValue: r.estimatedValue ?? null };
    this.table.insert(entity);
    return entity;
  }
  async listLinkedNotesByCouncils(ids: readonly string[] | "all") {
    return this.table.all((request) => ids === "all" || ids.includes(request.councilId))
      .flatMap((request) => request.processId
        ? [{ processId: request.processId, notes: request.events.map((event) => event.note) }]
        : []);
  }
}
