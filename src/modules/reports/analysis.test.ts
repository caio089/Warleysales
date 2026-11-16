import { describe, expect, it } from "vitest";
import { auditSources, operationalSources, parseReportAnalysis, type ReportSource } from "./analysis";

const sources: ReportSource[] = [
  { id: "stock.critical", label: "Itens críticos", value: 4, href: "/estoque" },
];

describe("análise rastreável de relatórios", () => {
  it("aceita observação com referência conhecida e sem números criados pela IA", () => {
    const result = parseReportAnalysis(JSON.stringify({
      headline: "Estoque exige atenção",
      items: [{ text: "Revise os itens críticos do estoque.", sourceIds: ["stock.critical"] }],
    }), sources);
    expect(result?.items[0]?.sourceIds).toEqual(["stock.critical"]);
  });

  it("recusa fonte inexistente e números narrados pelo modelo", () => {
    expect(parseReportAnalysis(JSON.stringify({
      headline: "Estoque exige atenção",
      items: [{ text: "Revise os itens críticos do estoque.", sourceIds: ["stock.fake"] }],
    }), sources)).toBeNull();
    expect(parseReportAnalysis(JSON.stringify({
      headline: "Estoque exige atenção",
      items: [{ text: "Há 99 itens críticos no estoque.", sourceIds: ["stock.critical"] }],
    }), sources)).toBeNull();
  });

  it("mantém o recorte de auditoria no link de origem", () => {
    const result = auditSources([], "councilId=abc&result=denied");
    expect(result.every((source) => source.href.includes("councilId=abc&result=denied"))).toBe(true);
  });

  it("mostra valores de economia somente quando a fonte existe", () => {
    const summary = {
      processes: { total: 1, completed: 0, pending: 1, averageProgress: 50, byStatus: {} },
      stock: { items: 1, critical: 0, withoutAvailability: 0 },
      contracts: { total: 0, expired: 0, expiring30: 0 },
      atas: { total: 0, expired: 0 },
    };
    expect(operationalSources(summary, null).some((source) => source.id === "savings.total")).toBe(false);
    expect(operationalSources(summary, { totalEstimated: 100, totalContracted: 80, totalSavings: 20, averageSavingsPercent: 20, count: 1 })
      .find((source) => source.id === "savings.total")?.value).toBe(20);
  });
});
