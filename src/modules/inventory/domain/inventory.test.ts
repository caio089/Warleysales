import { describe, expect, it } from "vitest";
import { applyMovement, availableOf, physicalFromLedger, releaseReservation, reserve, type StockMovement } from "./stock";
import { classifyStockLevel, reconciliationDifference } from "./levels";

const mv = (type: StockMovement["type"], quantity: number, key = `${type}-${quantity}`): StockMovement => ({ type, quantity, idempotencyKey: key });
const none = new Set<string>();

describe("ledger de estoque (R11)", () => {
  it("entrada aumenta, consumo diminui", () => {
    const afterEntry = applyMovement({ physical: 0, reserved: 0 }, mv("entry", 10), none);
    expect(afterEntry.ok && afterEntry.data.balance.physical).toBe(10);
    const afterUse = applyMovement({ physical: 10, reserved: 0 }, mv("consumption", 4), none);
    expect(afterUse.ok && afterUse.data.balance.physical).toBe(6);
  });
  it("nunca permite saldo negativo", () => {
    const r = applyMovement({ physical: 3, reserved: 0 }, mv("consumption", 3.001), none);
    expect(r.ok).toBe(false);
  });
  it("não consome material reservado", () => {
    expect(applyMovement({ physical: 10, reserved: 8 }, mv("consumption", 5), none).ok).toBe(false);
  });
  it("idempotência: mesma chave não aplica duas vezes", () => {
    const first = applyMovement({ physical: 0, reserved: 0 }, mv("entry", 5, "k1"), none);
    if (!first.ok) throw new Error();
    const replay = applyMovement(first.data.balance, mv("entry", 5, "k1"), new Set(["k1"]));
    expect(replay.ok && replay.data.duplicate).toBe(true);
    expect(replay.ok && replay.data.balance.physical).toBe(5);
  });
  it("rejeita quantidade inválida", () => {
    expect(applyMovement({ physical: 1, reserved: 0 }, mv("entry", 0), none).ok).toBe(false);
    expect(applyMovement({ physical: 1, reserved: 0 }, mv("entry", NaN), none).ok).toBe(false);
  });
  it("precisão decimal em 3 casas", () => {
    const r = applyMovement({ physical: 0.1, reserved: 0 }, mv("entry", 0.2), none);
    expect(r.ok && r.data.balance.physical).toBe(0.3);
  });
  it("reconstrói físico a partir do ledger e mede divergência", () => {
    const ledger = [mv("entry", 10, "a"), mv("consumption", 3, "b"), mv("adjustment_in", 1, "c")];
    expect(physicalFromLedger(ledger)).toBe(8);
    expect(reconciliationDifference(9, 8)).toBe(1);
  });
});

describe("reserva e disponibilidade (R12)", () => {
  it("disponível = físico − reservado", () => {
    expect(availableOf({ physical: 10, reserved: 4 })).toBe(6);
  });
  it("reserva limitada ao disponível", () => {
    expect(reserve({ physical: 10, reserved: 4 }, 7).ok).toBe(false);
    const ok = reserve({ physical: 10, reserved: 4 }, 6);
    expect(ok.ok && availableOf(ok.data)).toBe(0);
  });
  it("liberação não passa do reservado", () => {
    expect(releaseReservation({ physical: 10, reserved: 2 }, 3).ok).toBe(false);
    const r = releaseReservation({ physical: 10, reserved: 2 }, 2);
    expect(r.ok && r.data.reserved).toBe(0);
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
