import { describe, expect, it } from "vitest";
import { addAmendment, currentTerms, elapsedPercent, remainingDays, type ContractTerms } from "./terms";

const original: ContractTerms = { startDate: "2026-01-01", endDate: "2026-12-31", value: 1000 };

describe("Cenário F — contratos e aditivos (R16)", () => {
  it("calcula dias restantes e vigência decorrida", () => {
    expect(remainingDays(original, "2026-12-01")).toBe(30);
    expect(remainingDays(original, "2027-01-05")).toBe(-5);
    expect(elapsedPercent(original, "2026-07-02")).toBe(50);
    expect(elapsedPercent(original, "2027-06-01")).toBe(100);
    expect(elapsedPercent(original, "2025-06-01")).toBe(0);
  });
  it("aditivo preserva histórico sem sobrescrever o original", () => {
    const r = addAmendment(original, [], { reason: "Prorrogação", endDate: "2027-06-30", signedAt: "2026-11-01" });
    if (!r.ok) throw new Error("esperado ok");
    expect(r.data[0]!.previous).toEqual(original);
    expect(original.endDate).toBe("2026-12-31");
    expect(currentTerms(original, r.data).endDate).toBe("2027-06-30");
  });
  it("encadeia aditivos (prazo e valor) mantendo todo o histórico", () => {
    const a1 = addAmendment(original, [], { reason: "Prazo", endDate: "2027-06-30", signedAt: "2026-11-01" });
    if (!a1.ok) throw new Error();
    const a2 = addAmendment(original, a1.data, { reason: "Reajuste", value: 1200.5, signedAt: "2027-01-10" });
    if (!a2.ok) throw new Error();
    expect(a2.data).toHaveLength(2);
    expect(a2.data[1]!.previous.endDate).toBe("2027-06-30");
    expect(currentTerms(original, a2.data)).toMatchObject({ endDate: "2027-06-30", value: 1200.5 });
  });
  it("rejeita aditivo sem mudança, sem justificativa ou com data inválida", () => {
    expect(addAmendment(original, [], { reason: "x", signedAt: "2026-11-01" }).ok).toBe(false);
    expect(addAmendment(original, [], { reason: " ", endDate: "2027-01-01", signedAt: "2026-11-01" }).ok).toBe(false);
    expect(addAmendment(original, [], { reason: "x", endDate: "2025-01-01", signedAt: "2026-11-01" }).ok).toBe(false);
  });
});
