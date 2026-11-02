import { describe, expect, it } from "vitest";
import { changeRequestStatus, reopenRejected, REQUEST_TRANSITIONS } from "./request-status";
import { applyReceipt } from "./receipt";

describe("máquina de estados da solicitação", () => {
  it("fluxo completo válido", () => {
    const flow = ["rascunho", "enviada", "em_analise", "aguardando_correcao", "em_analise", "aprovada", "em_atendimento", "parcialmente_atendida", "atendida"] as const;
    for (let i = 0; i < flow.length - 1; i++) expect(changeRequestStatus(flow[i]!, flow[i + 1]!).ok).toBe(true);
  });
  it.each([
    ["rascunho", "aprovada"],
    ["enviada", "aprovada"],
    ["aprovada", "atendida"],
    ["rejeitada", "em_analise"],
    ["atendida", "cancelada"],
    ["em_atendimento", "cancelada"],
  ] as const)("rejeita %s -> %s", (a, b) => {
    expect(changeRequestStatus(a, b).ok).toBe(false);
  });
  it("cancelamento só a partir de rascunho/enviada/em_analise/aprovada", () => {
    const cancellable = Object.entries(REQUEST_TRANSITIONS).filter(([, t]) => t.includes("cancelada")).map(([s]) => s);
    expect(cancellable.sort()).toEqual(["aprovada", "em_analise", "enviada", "rascunho"]);
  });
  it("reabertura de rejeitada exige autorização e justificativa", () => {
    expect(reopenRejected("rejeitada", { canReopen: false }, "motivo").ok).toBe(false);
    expect(reopenRejected("rejeitada", { canReopen: true }, " ").ok).toBe(false);
    expect(reopenRejected("aprovada", { canReopen: true }, "motivo").ok).toBe(false);
    expect(reopenRejected("rejeitada", { canReopen: true }, "erro de análise")).toEqual({ ok: true, data: "em_analise" });
  });
});

describe("recebimento parcial", () => {
  const items = [
    { itemId: "a", expected: 10, receivedBefore: 0 },
    { itemId: "b", expected: 5, receivedBefore: 2 },
  ];
  it("parcial mantém pendências e status parcialmente_atendida", () => {
    const r = applyReceipt(items, [{ itemId: "a", received: 4 }]);
    expect(r.ok && r.data.requestStatus).toBe("parcialmente_atendida");
    expect(r.ok && r.data.items.map((i) => i.pending)).toEqual([6, 3]);
  });
  it("total quando tudo foi recebido", () => {
    const r = applyReceipt(items, [{ itemId: "a", received: 10 }, { itemId: "b", received: 3 }]);
    expect(r.ok && r.data.fullyReceived).toBe(true);
    expect(r.ok && r.data.requestStatus).toBe("atendida");
  });
  it("rejeita excesso, item desconhecido, linha vazia e quantidade inválida", () => {
    expect(applyReceipt(items, [{ itemId: "a", received: 10.001 }]).ok).toBe(false);
    expect(applyReceipt(items, [{ itemId: "x", received: 1 }]).ok).toBe(false);
    expect(applyReceipt(items, []).ok).toBe(false);
    expect(applyReceipt(items, [{ itemId: "a", received: 0 }]).ok).toBe(false);
  });
  it("soma linhas repetidas do mesmo item antes de validar o excesso", () => {
    expect(applyReceipt(items, [{ itemId: "a", received: 6 }, { itemId: "a", received: 5 }]).ok).toBe(false);
  });
});
