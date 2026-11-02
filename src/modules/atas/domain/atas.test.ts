import { describe, expect, it } from "vitest";
import { computeAtaBalance, validateAllocations, validateCommitment, type CommitmentEvent } from "./balance";
import { ataValidityStatus, computeInitialEndDate, currentEndDate, requestExtension } from "./validity";

const commit = (quantity: number, councilId = "c1"): CommitmentEvent => ({ type: "commit", quantity, councilId });

describe("Cenário E — saldo da ata (R9)", () => {
  it("saldo = registrada − comprometida", () => {
    expect(computeAtaBalance(100, [commit(30), commit(20)])).toEqual({ registered: 100, committed: 50, balance: 50 });
  });
  it("liberação devolve saldo", () => {
    const events: CommitmentEvent[] = [commit(30), { type: "release", quantity: 10, councilId: "c1", legalBasis: "cancelamento" }];
    expect(computeAtaBalance(100, events).balance).toBe(80);
  });
  it("sem eventos (rascunho não consome) o saldo é integral", () => {
    expect(computeAtaBalance(100, []).balance).toBe(100);
  });
  it("bloqueia comprometimento acima do saldo", () => {
    const r = validateCommitment({ registered: 100, events: [commit(90)], allocations: [], councilId: "c1", quantity: 11 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("INSUFFICIENT_BALANCE");
  });
  it("permite consumir exatamente o saldo", () => {
    const r = validateCommitment({ registered: 100, events: [commit(90)], allocations: [], councilId: "c1", quantity: 10 });
    expect(r.ok && r.data.balance).toBe(0);
  });
  it("evita erro de ponto flutuante", () => {
    expect(computeAtaBalance(0.3, [commit(0.1), commit(0.2)]).balance).toBe(0);
  });
  it("rejeita quantidade zero ou negativa", () => {
    expect(validateCommitment({ registered: 10, events: [], allocations: [], councilId: "c1", quantity: 0 }).ok).toBe(false);
  });
  it("alocação é opcional; quando existe, limita o conselho", () => {
    const allocations = [{ councilId: "c1", quantity: 20 }];
    const over = validateCommitment({ registered: 100, events: [commit(15)], allocations, councilId: "c1", quantity: 6 });
    expect(over.ok).toBe(false);
    const otherCouncil = validateCommitment({ registered: 100, events: [commit(15)], allocations, councilId: "c2", quantity: 50 });
    expect(otherCouncil.ok).toBe(true);
  });
  it("soma de alocações não excede a registrada", () => {
    expect(validateAllocations(10, [{ councilId: "a", quantity: 6 }, { councilId: "b", quantity: 5 }]).ok).toBe(false);
    expect(validateAllocations(10, [{ councilId: "a", quantity: 6 }]).ok).toBe(true);
  });
});

describe("Vigência e prorrogação (R10)", () => {
  it("vigência inicial de 1 ano", () => {
    expect(computeInitialEndDate("2026-03-01")).toBe("2027-02-28");
  });
  it("prorroga uma vez por mais 1 ano com base legal", () => {
    const r = requestExtension({ startDate: "2026-03-01", extensions: [], requestedBy: "u1", today: "2027-01-10" });
    expect(r.ok && r.data.newEndDate).toBe("2028-02-28");
    expect(r.ok && r.data.legalBasis).toContain("Lei 14.133");
  });
  it("não prorroga duas vezes (nunca 10 anos)", () => {
    const first = requestExtension({ startDate: "2026-03-01", extensions: [], requestedBy: "u1", today: "2027-01-10" });
    if (!first.ok) throw new Error("esperado ok");
    const second = requestExtension({ startDate: "2026-03-01", extensions: [first.data], requestedBy: "u1", today: "2027-06-01" });
    expect(second.ok).toBe(false);
    expect(currentEndDate("2026-03-01", [first.data])).toBe("2028-02-28");
  });
  it("sem solicitante não há prorrogação automática", () => {
    expect(requestExtension({ startDate: "2026-03-01", extensions: [], requestedBy: null, today: "2027-01-10" }).ok).toBe(false);
  });
  it("não prorroga ata já vencida", () => {
    expect(requestExtension({ startDate: "2026-03-01", extensions: [], requestedBy: "u1", today: "2027-03-01" }).ok).toBe(false);
  });
  it("status de vigência", () => {
    expect(ataValidityStatus("2027-02-28", "2027-02-28")).toBe("vigente");
    expect(ataValidityStatus("2027-02-28", "2027-03-01")).toBe("vencida");
  });
});
