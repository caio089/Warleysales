import type { Result } from "@/shared/lib/result";
import type { Contract } from "./schemas";

export interface ContractRepository {
  listReceiptLines?(councilIds: readonly string[] | "all"): Promise<{ requestId: string; receiptKey: string; requestItemId: string; contractId: string; ataItemId: string | null; quantity: number }[]>;
  insert(contract: Contract): Promise<Contract>;
  /** Persiste contrato e compromissos da ata na mesma transação, quando disponível. */
  insertAtomically?(contract: Contract): Promise<Result<Contract>>;
  findById(id: string): Promise<Contract | null>;
  listByCouncils(councilIds: readonly string[] | "all", process?: { id: string; councilId: string }): Promise<Contract[]>;
  /** Persiste o contrato; o histórico de aditivos é append-only (adapter SQL grava só novos). */
  save(contract: Contract): Promise<Contract>;
  close?(id: string, actorId: string, at: Date): Promise<Contract | null>;
}
