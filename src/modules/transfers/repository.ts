import type { Transfer } from "./schemas";

export interface TransferRepository {
  insert(transfer: Transfer): Promise<Transfer>;
  findById(id: string): Promise<Transfer | null>;
  listByCouncils(councilIds: readonly string[] | "all"): Promise<Transfer[]>;
  save(transfer: Transfer): Promise<Transfer>;
}
