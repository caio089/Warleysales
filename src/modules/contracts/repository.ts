import type { Contract } from "./schemas";

export interface ContractRepository {
  insert(contract: Contract): Promise<Contract>;
  findById(id: string): Promise<Contract | null>;
  listByCouncils(councilIds: readonly string[] | "all"): Promise<Contract[]>;
  /** Persiste o contrato; o histórico de aditivos é append-only (adapter SQL grava só novos). */
  save(contract: Contract): Promise<Contract>;
}
