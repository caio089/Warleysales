import { describe, expect, it } from "vitest";
import {
  applyMovement,
  availableOf,
  dispatchReservedStock,
  physicalFromLedger,
  provisionBlocked,
  releaseBlocked,
  releaseReservation,
  reserve,
  reserveStock,
  unreserveStock,
  type StockMovement,
} from "./stock";
import { classifyStockLevel, reconciliationDifference } from "./levels";

const mv = (type: StockMovement["type"], quantity: number, key = `${type}-${quantity}`): StockMovement => ({ type, quantity, idempotencyKey: key });
const none = new Set<string>();

describe("ledger de estoque (R11)", () => {
  it("entrada aumenta, consumo diminui", () => {
    const afterEntry = applyMovement({ physical: 0, reserved: 0, blocked: 0 }, mv("entry", 10), none);
    expect(afterEntry.ok && afterEntry.data.balance.physical).toBe(10);
    const afterUse = applyMovement({ physical: 10, reserved: 0, blocked: 0 }, mv("consumption", 4), none);
    expect(afterUse.ok && afterUse.data.balance.physical).toBe(6);
  });
  it("nunca permite saldo negativo", () => {
    const r = applyMovement({ physical: 3, reserved: 0, blocked: 0 }, mv("consumption", 3.001), none);
    expect(r.ok).toBe(false);
  });
  it("não consome material reservado", () => {
    expect(applyMovement({ physical: 10, reserved: 8, blocked: 0 }, mv("consumption", 5), none).ok).toBe(false);
  });
  it("idempotência: mesma chave não aplica duas vezes", () => {
    const first = applyMovement({ physical: 0, reserved: 0, blocked: 0 }, mv("entry", 5, "k1"), none);
    if (!first.ok) throw new Error();
    const replay = applyMovement(first.data.balance, mv("entry", 5, "k1"), new Set(["k1"]));
    expect(replay.ok && replay.data.duplicate).toBe(true);
    expect(replay.ok && replay.data.balance.physical).toBe(5);
  });
  it("rejeita quantidade inválida", () => {
    expect(applyMovement({ physical: 1, reserved: 0, blocked: 0 }, mv("entry", 0), none).ok).toBe(false);
    expect(applyMovement({ physical: 1, reserved: 0, blocked: 0 }, mv("entry", NaN), none).ok).toBe(false);
  });
  it("precisão decimal em 3 casas", () => {
    const r = applyMovement({ physical: 0.1, reserved: 0, blocked: 0 }, mv("entry", 0.2), none);
    expect(r.ok && r.data.balance.physical).toBe(0.3);
  });
  it("reconstrói físico a partir do ledger e mede divergência", () => {
    const ledger = [mv("entry", 10, "a"), mv("consumption", 3, "b"), mv("adjustment_in", 1, "c")];
    expect(physicalFromLedger(ledger)).toBe(8);
    expect(reconciliationDifference(9, 8)).toBe(1);
  });
  it("preserva estoque bloqueado ao aplicar movimentações", () => {
    const afterEntry = applyMovement({ physical: 5, reserved: 0, blocked: 15 }, mv("entry", 10), none);
    expect(afterEntry.ok && afterEntry.data.balance.blocked).toBe(15);
    expect(afterEntry.ok && afterEntry.data.balance.physical).toBe(15);
  });
});

describe("reserva e disponibilidade (R12)", () => {
  it("disponível = físico − reservado", () => {
    expect(availableOf({ physical: 10, reserved: 4, blocked: 0 })).toBe(6);
    expect(availableOf({ physical: 10, reserved: 4, blocked: 20 })).toBe(6);
  });
  it("reserva limitada ao disponível", () => {
    expect(reserve({ physical: 10, reserved: 4, blocked: 0 }, 7).ok).toBe(false);
    const ok = reserve({ physical: 10, reserved: 4, blocked: 5 }, 6);
    expect(ok.ok && availableOf(ok.data)).toBe(0);
    expect(ok.ok && ok.data.blocked).toBe(5);
  });
  it("liberação não passa do reservado", () => {
    expect(releaseReservation({ physical: 10, reserved: 2, blocked: 0 }, 3).ok).toBe(false);
    const r = releaseReservation({ physical: 10, reserved: 2, blocked: 8 }, 2);
    expect(r.ok && r.data.reserved).toBe(0);
    expect(r.ok && r.data.blocked).toBe(8);
  });
});

describe("níveis de estoque", () => {
  it.each([
    [0, 10, "sem_disponibilidade"],
    [-1, 10, "sem_disponibilidade"],
    [5, 10, "critico"],
    [6, 10, "atencao"],
    [10, 10, "atencao"],
    [11, 10, "normal"],
  ])("disponível %s / mínimo %s => %s", (available, minimum, level) => {
    expect(classifyStockLevel(available, minimum)).toBe(level);
  });
});

describe("estoque bloqueado (Onda 1)", () => {
  it("provisiona saldo bloqueado sem alterar físico ou disponível", () => {
    const r = provisionBlocked({ physical: 10, reserved: 2, blocked: 5 }, 8);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data.blocked).toBe(13);
    expect(r.data.physical).toBe(10);
    expect(r.data.reserved).toBe(2);
    expect(availableOf(r.data)).toBe(8);
  });

  it("rejeita quantidade inválida ao provisionar bloqueado", () => {
    expect(provisionBlocked({ physical: 0, reserved: 0, blocked: 0 }, 0).ok).toBe(false);
    expect(provisionBlocked({ physical: 0, reserved: 0, blocked: 0 }, -5).ok).toBe(false);
  });

  it("converte saldo bloqueado em físico ao liberar", () => {
    const r = releaseBlocked({ physical: 5, reserved: 2, blocked: 10 }, 8);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data.blocked).toBe(2);
    expect(r.data.physical).toBe(13);
    expect(r.data.reserved).toBe(2);
    expect(availableOf(r.data)).toBe(11); // 13 - 2
  });

  it("rejeita liberar quantidade maior que o saldo bloqueado", () => {
    const r = releaseBlocked({ physical: 5, reserved: 2, blocked: 5 }, 6);
    expect(r.ok).toBe(false);
  });
});

describe("operações de estoque para pedidos de materiais (Onda 2)", () => {
  it("reserveStock incrementa reserved, mantém physical e blocked, decrementa available", () => {
    const initial = { physical: 20, reserved: 5, blocked: 10 };
    expect(availableOf(initial)).toBe(15);

    const r = reserveStock(initial, 7);
    expect(r.ok).toBe(true);
    if (!r.ok) return;

    expect(r.data.physical).toBe(20);
    expect(r.data.reserved).toBe(12);
    expect(r.data.blocked).toBe(10);
    expect(availableOf(r.data)).toBe(8);
  });

  it("reserveStock rejeita quantidade acima do disponível", () => {
    const initial = { physical: 20, reserved: 15, blocked: 5 }; // available = 5
    const r = reserveStock(initial, 5.001);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.code).toBe("INSUFFICIENT_BALANCE");
    }
  });

  it("reserveStock rejeita quantidade zero ou negativa", () => {
    const initial = { physical: 20, reserved: 0, blocked: 0 };
    expect(reserveStock(initial, 0).ok).toBe(false);
    expect(reserveStock(initial, -1).ok).toBe(false);
  });

  it("unreserveStock decrementa reserved, estornando para available", () => {
    const initial = { physical: 20, reserved: 8, blocked: 10 };
    expect(availableOf(initial)).toBe(12);

    const r = unreserveStock(initial, 5);
    expect(r.ok).toBe(true);
    if (!r.ok) return;

    expect(r.data.physical).toBe(20);
    expect(r.data.reserved).toBe(3);
    expect(r.data.blocked).toBe(10);
    expect(availableOf(r.data)).toBe(17);
  });

  it("unreserveStock rejeita quantidade maior que a reserva atual", () => {
    const initial = { physical: 20, reserved: 3, blocked: 0 };
    const r = unreserveStock(initial, 4);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.code).toBe("INVALID_STATE");
    }
  });

  it("unreserveStock rejeita quantidade zero ou inválida", () => {
    const initial = { physical: 20, reserved: 5, blocked: 0 };
    expect(unreserveStock(initial, 0).ok).toBe(false);
    expect(unreserveStock(initial, -2).ok).toBe(false);
  });

  it("dispatchReservedStock decrementa reserved e physical, mantendo blocked e available", () => {
    const initial = { physical: 20, reserved: 8, blocked: 15 };
    const availBefore = availableOf(initial); // 12

    const r = dispatchReservedStock(initial, 5);
    expect(r.ok).toBe(true);
    if (!r.ok) return;

    expect(r.data.physical).toBe(15);
    expect(r.data.reserved).toBe(3);
    expect(r.data.blocked).toBe(15);
    expect(availableOf(r.data)).toBe(availBefore); // 15 - 3 = 12
  });

  it("dispatchReservedStock rejeita despacho maior que reserved", () => {
    const initial = { physical: 20, reserved: 4, blocked: 0 };
    const r = dispatchReservedStock(initial, 5);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.code).toBe("INVALID_STATE");
    }
  });

  it("dispatchReservedStock rejeita quantidade maior que physical", () => {
    const initial = { physical: 3, reserved: 3, blocked: 0 };
    const r = dispatchReservedStock(initial, 4);
    expect(r.ok).toBe(false);
  });

  it("dispatchReservedStock rejeita quantidade zero ou negativa", () => {
    const initial = { physical: 10, reserved: 5, blocked: 0 };
    expect(dispatchReservedStock(initial, 0).ok).toBe(false);
    expect(dispatchReservedStock(initial, -1).ok).toBe(false);
  });
});
