import type { PurchaseRequest } from "./schemas";

export interface PurchaseRequestRepository {
  insert(request: PurchaseRequest): Promise<PurchaseRequest>;
  findById(id: string): Promise<PurchaseRequest | null>;
  listByCouncils(councilIds: readonly string[] | "all"): Promise<PurchaseRequest[]>;
  save(request: PurchaseRequest): Promise<PurchaseRequest>;
}
