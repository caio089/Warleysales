import { checkTransition, type TransitionMap } from "@/shared/lib/state-machine";
import { subtractQuantity } from "@/shared/lib/decimal";
import { fail, ok, type Result } from "@/shared/lib/result";

export type TransferStatus =
  | "solicitada"
  | "em_analise"
  | "aprovada"
  | "separada"
  | "em_transito"
  | "recebida"
  | "rejeitada"
  | "cancelada";

/** §7: rejeição/cancelamento liberam a reserva; recebida/rejeitada/cancelada são finais. */
export const TRANSFER_TRANSITIONS: TransitionMap<TransferStatus> = {
  solicitada: ["em_analise", "cancelada"],
  em_analise: ["aprovada", "rejeitada", "cancelada"],
  aprovada: ["separada", "cancelada"],
  separada: ["em_transito", "cancelada"],
  em_transito: ["recebida"],
  recebida: [],
  rejeitada: [],
  cancelada: [],
};

export const changeTransferStatus = (from: TransferStatus, to: TransferStatus) =>
  checkTransition(TRANSFER_TRANSITIONS, from, to, "transferência");

/** Estados em que há reserva ativa no conselho de origem. */
export const HOLDS_RESERVATION: ReadonlySet<TransferStatus> = new Set(["aprovada", "separada"]);

/** Efeito de estoque de cada transição, aplicado atomicamente pelo repositório. */
export type TransferStockEffect =
  | { kind: "none" }
  | { kind: "reserve_origin" }
  | { kind: "release_reservation_origin" }
  /** Saída: libera reserva e baixa o físico da origem; material fica em trânsito. */
  | { kind: "dispatch_from_origin" }
  | { kind: "receive_at_destination"; receivedQuantity: number; divergence: number };

export function stockEffectFor(
  from: TransferStatus,
  to: TransferStatus,
  quantities?: { sent: number; received: number },
): Result<TransferStockEffect> {
  const valid = changeTransferStatus(from, to);
  if (!valid.ok) return valid;

  if (to === "aprovada") return ok({ kind: "reserve_origin" });
  if (to === "rejeitada" || to === "cancelada") {
    return ok(HOLDS_RESERVATION.has(from) ? { kind: "release_reservation_origin" } : { kind: "none" });
  }
  if (to === "em_transito") return ok({ kind: "dispatch_from_origin" });
  if (to === "recebida") {
    if (!quantities) return fail("VALIDATION", "Informe as quantidades enviada e recebida.");
    return receiveEffect(quantities.sent, quantities.received);
  }
  return ok({ kind: "none" });
}

/** Recebimento: não pode exceder o enviado; a diferença é divergência registrada. */
function receiveEffect(sent: number, received: number): Result<TransferStockEffect> {
  if (received < 0) return fail("VALIDATION", "Quantidade recebida inválida.");
  if (received > sent) return fail("VALIDATION", "Recebido não pode exceder o enviado.");
  return ok({ kind: "receive_at_destination", receivedQuantity: received, divergence: subtractQuantity(sent, received) });
}
