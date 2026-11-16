import { describe, expect, it } from "vitest";
import type { Council } from "@/modules/identity/schemas";
import type { ProcessFormalization } from "@/modules/formalizations/domain/formalization";
import { demoCouncilIds, savingsForExport } from "./export-data";

describe("dados oficiais de exportação", () => {
  it("identifica apenas órgãos marcados como demonstração", () => {
    const base: Council = { id: "real", organizationType: "public_body", name: "Órgão", acronym: "ORG", responsibleUserId: null, institutionalInfo: null, whatsappE164: null, active: true };
    expect(demoCouncilIds([base, { ...base, id: "demo", institutionalInfo: "Dados de demonstração para visualizar o painel." }])).toEqual(["demo"]);
  });
  it("calcula a economia a partir do conjunto filtrado de formalizações", () => {
    const item = { estimatedValue: 1000, contractedValue: 800 } as ProcessFormalization;
    expect(savingsForExport([item])).toMatchObject({ totalEstimated: 1000, totalContracted: 800, totalSavings: 200, averageSavingsPercent: 20, count: 1 });
    expect(savingsForExport([])).toMatchObject({ totalSavings: 0, count: 0 });
  });
});
