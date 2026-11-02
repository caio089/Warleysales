import { addQuantity, roundQuantity, subtractQuantity } from "@/shared/lib/decimal";
import { fail, ok, type Result } from "@/shared/lib/result";

/**
 * Ledger de comprometimento (H3). Rascunho NÃO é evento: só entra no ledger
 * quando a solicitação é efetivada, logo não consome saldo (R9).
 */
export type CommitmentEventType = "commit" | "release";

export interface CommitmentEvent {
  type: CommitmentEventType;
  quantity: number;
  councilId: string;
  /** Base legal/justificativa (obrigatória em liberações). */
  legalBasis?: string;
}

export interface AtaBalance {
  registered: number;
  committed: number;
  /** R9: saldo = registrada − comprometida. */
  balance: number;
}

/** Calcula o saldo a partir do ledger (fonte da verdade). */
export function computeAtaBalance(registered: number, events: readonly CommitmentEvent[]): AtaBalance {
  const committed = events.reduce(
    (sum, e) => (e.type === "commit" ? addQuantity(sum, e.quantity) : subtractQuantity(sum, e.quantity)),
    0,
  );
  return { registered: roundQuantity(registered), committed, balance: subtractQuantity(registered, committed) };
}

/** Alocação opcional por conselho (P5). Sem alocação, vale apenas o saldo comum. */
export interface CouncilAllocation {
  councilId: string;
  quantity: number;
}

export interface CommitRequest {
  registered: number;
  events: readonly CommitmentEvent[];
  allocations: readonly CouncilAllocation[];
  councilId: string;
  quantity: number;
}

/** Valida se um novo comprometimento cabe no saldo (e na alocação do conselho, se houver). */
export function validateCommitment(request: CommitRequest): Result<AtaBalance> {
  if (!(request.quantity > 0)) return fail("VALIDATION", "A quantidade deve ser maior que zero.");

  const current = computeAtaBalance(request.registered, request.events);
  if (request.quantity > current.balance) {
    return fail(
      "INSUFFICIENT_BALANCE",
      `Quantidade excede o saldo da ata (disponível: ${current.balance}).`,
    );
  }

  const allocation = request.allocations.find((a) => a.councilId === request.councilId);
  if (allocation) {
    const councilEvents = request.events.filter((e) => e.councilId === request.councilId);
    const councilBalance = computeAtaBalance(allocation.quantity, councilEvents).balance;
    if (request.quantity > councilBalance) {
      return fail(
        "INSUFFICIENT_BALANCE",
        `Quantidade excede a alocação do conselho (disponível: ${councilBalance}).`,
      );
    }
  }

  return ok(computeAtaBalance(request.registered, [...request.events, { type: "commit", quantity: request.quantity, councilId: request.councilId }]));
}

/** Soma das alocações não pode ultrapassar a quantidade registrada. */
export function validateAllocations(registered: number, allocations: readonly CouncilAllocation[]): Result<true> {
  const total = allocations.reduce((s, a) => addQuantity(s, a.quantity), 0);
  if (allocations.some((a) => !(a.quantity > 0))) return fail("VALIDATION", "Alocações devem ser maiores que zero.");
  if (total > registered) return fail("VALIDATION", "A soma das alocações excede a quantidade registrada.");
  return ok(true);
}
