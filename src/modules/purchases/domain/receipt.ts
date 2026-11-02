import { addQuantity, subtractQuantity } from "@/shared/lib/decimal";
import { fail, ok, type Result } from "@/shared/lib/result";
import type { PurchaseRequestStatus } from "./request-status";

export interface ReceiptItemState {
  itemId: string;
  expected: number;
  /** Total já recebido em recebimentos anteriores. */
  receivedBefore: number;
}

export interface ReceiptLine {
  itemId: string;
  received: number;
}

export interface ReceiptItemResult {
  itemId: string;
  expected: number;
  receivedTotal: number;
  pending: number;
}

export interface ReceiptOutcome {
  items: ReceiptItemResult[];
  fullyReceived: boolean;
  /** Status resultante da solicitação: parcial enquanto houver pendência. */
  requestStatus: Extract<PurchaseRequestStatus, "parcialmente_atendida" | "atendida">;
}

/**
 * Recebimento parcial: soma ao já recebido, rejeita excesso (nunca recebe mais que o esperado)
 * e calcula pendências. Só o recebimento gera entrada de estoque (R11) — a quantidade
 * efetivamente recebida em cada linha é o que o chamador lança no ledger.
 */
export function applyReceipt(
  items: readonly ReceiptItemState[],
  lines: readonly ReceiptLine[],
): Result<ReceiptOutcome> {
  if (lines.length === 0) return fail("VALIDATION", "Informe ao menos um item recebido.");

  const received = new Map<string, number>();
  for (const line of lines) {
    if (!(line.received > 0)) return fail("VALIDATION", "A quantidade recebida deve ser maior que zero.");
    received.set(line.itemId, addQuantity(received.get(line.itemId) ?? 0, line.received));
  }
  const known = new Set(items.map((i) => i.itemId));
  for (const id of received.keys()) {
    if (!known.has(id)) return fail("NOT_FOUND", "Item de recebimento não pertence à solicitação.");
  }

  const results: ReceiptItemResult[] = [];
  for (const item of items) {
    const receivedTotal = addQuantity(item.receivedBefore, received.get(item.itemId) ?? 0);
    if (receivedTotal > item.expected) {
      return fail("VALIDATION", "A quantidade recebida excede a quantidade esperada do item.");
    }
    results.push({ itemId: item.itemId, expected: item.expected, receivedTotal, pending: subtractQuantity(item.expected, receivedTotal) });
  }

  const fullyReceived = results.every((r) => r.pending === 0);
  return ok({ items: results, fullyReceived, requestStatus: fullyReceived ? "atendida" : "parcialmente_atendida" });
}
