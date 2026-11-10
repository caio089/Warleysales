import { addQuantity, roundQuantity, subtractQuantity } from "@/shared/lib/decimal";
import { fail, ok, type Result } from "@/shared/lib/result";

/**
 * R11: o estoque só muda por movimentações do ledger (append-only).
 * Aprovar uma solicitação NÃO gera movimentação; só o recebimento gera "entry".
 */
export type MovementType =
  | "entry" // entrada por recebimento
  | "consumption" // consumo/saída definitiva
  | "adjustment_in"
  | "adjustment_out"
  | "transfer_out" // saída por transferência (material entra em trânsito)
  | "transfer_in"; // entrada no destino

const INCREASING: ReadonlySet<MovementType> = new Set(["entry", "adjustment_in", "transfer_in"]);

export interface StockMovement {
  type: MovementType;
  quantity: number;
  /** Chave única que torna a operação idempotente (reenvio/duplo clique). */
  idempotencyKey: string;
}

export interface StockBalance {
  physical: number;
  reserved: number;
  blocked: number;
}

/** Disponível = físico − reservado (R12: reservado e em trânsito não estão disponíveis). */
export const availableOf = (balance: StockBalance): number => subtractQuantity(balance.physical, balance.reserved);

export const signedQuantity = (movement: StockMovement): number =>
  INCREASING.has(movement.type) ? movement.quantity : -movement.quantity;

function validateQuantity(quantity: number): Result<number> {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return fail("VALIDATION", "A quantidade deve ser maior que zero.");
  }
  return ok(roundQuantity(quantity));
}

export interface MovementOutcome {
  balance: StockBalance;
  /** true quando a chave já tinha sido processada: nada é aplicado novamente. */
  duplicate: boolean;
}

/**
 * Aplica uma movimentação ao saldo. Rejeita saldo físico negativo e
 * saída que consumiria material reservado para outro fim.
 */
export function applyMovement(
  balance: StockBalance,
  movement: StockMovement,
  processedKeys: ReadonlySet<string>,
): Result<MovementOutcome> {
  if (processedKeys.has(movement.idempotencyKey)) return ok({ balance, duplicate: true });

  const quantity = validateQuantity(movement.quantity);
  if (!quantity.ok) return quantity;

  const delta = signedQuantity({ ...movement, quantity: quantity.data });
  const physical = addQuantity(balance.physical, delta);
  if (physical < 0) {
    return fail("INSUFFICIENT_BALANCE", "Saldo físico insuficiente: o estoque não pode ficar negativo.");
  }
  if (physical < balance.reserved) {
    return fail("INSUFFICIENT_BALANCE", "A saída consumiria material reservado para outra operação.");
  }
  return ok({ balance: { physical, reserved: balance.reserved, blocked: balance.blocked ?? 0 }, duplicate: false });
}

/** Reserva material disponível (ex.: transferência aprovada). */
export function reserve(balance: StockBalance, quantity: number): Result<StockBalance> {
  const q = validateQuantity(quantity);
  if (!q.ok) return q;
  if (q.data > availableOf(balance)) {
    return fail("INSUFFICIENT_BALANCE", "Quantidade disponível insuficiente para reserva.");
  }
  return ok({ physical: balance.physical, reserved: addQuantity(balance.reserved, q.data), blocked: balance.blocked ?? 0 });
}

/** Libera reserva (rejeição/cancelamento ou conversão em saída). */
export function releaseReservation(balance: StockBalance, quantity: number): Result<StockBalance> {
  const q = validateQuantity(quantity);
  if (!q.ok) return q;
  if (q.data > balance.reserved) return fail("INVALID_STATE", "Reserva menor que a quantidade a liberar.");
  return ok({ physical: balance.physical, reserved: subtractQuantity(balance.reserved, q.data), blocked: balance.blocked ?? 0 });
}

/** Reserva material para pedido contra saldo liberado. */
export function reserveStock(balance: StockBalance, quantity: number): Result<StockBalance> {
  return reserve(balance, quantity);
}

/** Libera/estorna reserva de pedido rejeitado ou cancelado. */
export function unreserveStock(balance: StockBalance, quantity: number): Result<StockBalance> {
  return releaseReservation(balance, quantity);
}

/**
 * Despacha material reservado (aprovação do pedido):
 * decrementa tanto o saldo reservado quanto o saldo físico.
 */
export function dispatchReservedStock(balance: StockBalance, quantity: number): Result<StockBalance> {
  const q = validateQuantity(quantity);
  if (!q.ok) return q;
  if (q.data > balance.reserved) {
    return fail("INVALID_STATE", "Reserva menor que a quantidade a despachar.");
  }
  if (q.data > balance.physical) {
    return fail("INSUFFICIENT_BALANCE", "Saldo físico insuficiente para despacho.");
  }
  return ok({
    physical: subtractQuantity(balance.physical, q.data),
    reserved: subtractQuantity(balance.reserved, q.data),
    blocked: balance.blocked ?? 0,
  });
}

/** Provisiona saldo bloqueado (ex.: criação de solicitação de compra). */
export function provisionBlocked(balance: StockBalance, quantity: number): Result<StockBalance> {
  const q = validateQuantity(quantity);
  if (!q.ok) return q;
  return ok({
    physical: balance.physical,
    reserved: balance.reserved,
    blocked: addQuantity(balance.blocked ?? 0, q.data),
  });
}

/**
 * Converte saldo bloqueado em saldo físico (Pronto para Uso) após homologação.
 * Debita `blocked` e credita `physical`.
 */
export function releaseBlocked(balance: StockBalance, quantity: number): Result<StockBalance> {
  const q = validateQuantity(quantity);
  if (!q.ok) return q;
  const currentBlocked = balance.blocked ?? 0;
  if (q.data > currentBlocked) {
    return fail("INSUFFICIENT_BALANCE", "Saldo bloqueado menor que a quantidade a liberar.");
  }
  return ok({
    physical: addQuantity(balance.physical, q.data),
    reserved: balance.reserved,
    blocked: subtractQuantity(currentBlocked, q.data),
  });
}

/** Reconstrói o saldo físico a partir do ledger (usado na reconciliação, H2). */
export function physicalFromLedger(movements: readonly StockMovement[]): number {
  return movements.reduce((sum, m) => addQuantity(sum, signedQuantity(m)), 0);
}
