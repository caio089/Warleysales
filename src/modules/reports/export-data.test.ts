import { describe, expect, it } from "vitest";
import type { Council } from "@/modules/identity/schemas";
import type { ProcessFormalization } from "@/modules/formalizations/domain/formalization";
import { demoCouncilIds, hasOperationalData, savingsForExport } from "./export-data";

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
  it("distingue relatório oficial vazio de relatório com registros", () => {
    const empty = { processes: { total: 0 }, stock: { items: 0 }, contracts: { total: 0 }, atas: { total: 0 } } as Parameters<typeof hasOperationalData>[0];
    expect(hasOperationalData(empty, 0)).toBe(false);
    expect(hasOperationalData({ ...empty, processes: { ...empty.processes, total: 2 } }, 0)).toBe(true);
    expect(hasOperationalData(empty, 1)).toBe(true);
  });
});
