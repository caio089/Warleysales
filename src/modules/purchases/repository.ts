import type { Result } from "@/shared/lib/result";
import type { PurchaseRequest } from "./schemas";

/** Dados de uma decisão que deve ser gravada junto com seus efeitos em uma única transação. */
export interface AtomicDecision {
  requestId: string;
  actorId: string;
  at: Date;
  note?: string;
}

export interface PurchaseRequestRepository {
  insert(request: PurchaseRequest): Promise<PurchaseRequest>;
  findById(id: string): Promise<PurchaseRequest | null>;
  listByCouncils(councilIds: readonly string[] | "all"): Promise<PurchaseRequest[]>;
  save(request: PurchaseRequest): Promise<PurchaseRequest>;
  /**
   * Opcional. Quando implementado (adapter Supabase), aprova comprometendo o saldo de TODAS as linhas de ata,
   * mudando o status e registrando o evento em UMA transação SQL (tudo ou nada). Sem ele, o serviço usa
   * o caminho genérico com compensação (repositório em memória dos testes).
   */
  approveAtomically?(decision: AtomicDecision): Promise<Result<PurchaseRequest>>;
  /** Opcional. Cancela devolvendo o saldo comprometido (se aprovada) na mesma transação. */
  cancelAtomically?(decision: AtomicDecision): Promise<Result<PurchaseRequest>>;
}
