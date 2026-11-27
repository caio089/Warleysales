import type { Transfer } from "./schemas";

export interface TransferRepository {
  findById(id: string): Promise<Transfer | null>;
  listByCouncils(councilIds: readonly string[] | "all"): Promise<Transfer[]>;
}
