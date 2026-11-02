import { describe, expect, it } from "vitest";
import { changeTransferStatus, stockEffectFor, TRANSFER_TRANSITIONS, type TransferStatus } from "./transfer";

describe("máquina de estados de transferência", () => {
  it("percorre o fluxo feliz", () => {
    const path: TransferStatus[] = ["solicitada", "em_analise", "aprovada", "separada", "em_transito", "recebida"];
    for (let i = 0; i < path.length - 1; i++) expect(changeTransferStatus(path[i]!, path[i + 1]!).ok).toBe(true);
  });
  it.each([
    ["solicitada", "recebida"],
    ["em_analise", "em_transito"],
    ["em_transito", "cancelada"],
    ["recebida", "cancelada"],
    ["rejeitada", "aprovada"],
    ["cancelada", "solicitada"],
  ] as const)("rejeita %s -> %s", (from, to) => {
    const r = changeTransferStatus(from, to);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("INVALID_STATE");
  });
  it("estados finais não têm saída", () => {
    for (const s of ["recebida", "rejeitada", "cancelada"] as const) expect(TRANSFER_TRANSITIONS[s]).toEqual([]);
  });
});

describe("efeitos de estoque (R12)", () => {
  it("aprovar reserva na origem; cancelar após aprovação libera", () => {
    expect(stockEffectFor("em_analise", "aprovada")).toEqual({ ok: true, data: { kind: "reserve_origin" } });
    expect(stockEffectFor("separada", "cancelada")).toEqual({ ok: true, data: { kind: "release_reservation_origin" } });
    expect(stockEffectFor("solicitada", "cancelada")).toEqual({ ok: true, data: { kind: "none" } });
  });
  it("saída baixa a origem (em trânsito não está disponível em nenhum conselho)", () => {
    expect(stockEffectFor("separada", "em_transito")).toEqual({ ok: true, data: { kind: "dispatch_from_origin" } });
  });
  it("recebimento registra divergência e rejeita excesso", () => {
    expect(stockEffectFor("em_transito", "recebida", { sent: 10, received: 8 })).toEqual({
      ok: true,
      data: { kind: "receive_at_destination", receivedQuantity: 8, divergence: 2 },
    });
    expect(stockEffectFor("em_transito", "recebida", { sent: 10, received: 11 }).ok).toBe(false);
    expect(stockEffectFor("em_transito", "recebida").ok).toBe(false);
  });
});
