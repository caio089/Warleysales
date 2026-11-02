import type { Result } from "@/shared/lib/result";
import type { TransferStatus } from "./domain/transfer";
import type { Transfer } from "./schemas";

export interface AtomicTransferStep {
  transferId: string;
  to: TransferStatus;
  actorId: string;
  at: Date;
  note?: string;
  received?: { materialId: string; quantity: number }[];
}

export interface TransferRepository {
  insert(transfer: Transfer): Promise<Transfer>;
  findById(id: string): Promise<Transfer | null>;
  listByCouncils(councilIds: readonly string[] | "all"): Promise<Transfer[]>;
  save(transfer: Transfer): Promise<Transfer>;
  /**
   * Opcional. Quando implementado (adapter Supabase), aplica o efeito de estoque de TODOS os materiais,
   * muda o status e registra o evento em UMA transação SQL (RPC `advance_transfer`). Sem ele, o serviço
   * usa o caminho genérico com compensação (repositório em memória dos testes).
   */
  advanceAtomically?(step: AtomicTransferStep): Promise<Result<Transfer>>;
}
