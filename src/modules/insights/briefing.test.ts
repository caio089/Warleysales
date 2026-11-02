import { describe, expect, it } from "vitest";
import { parseDashboardQuery } from "@/modules/reports/dashboard-query";
import { buildBriefingFacts, parseBriefingText } from "./briefing";

const emptySummary = {
  processes: { total: 0, completed: 0, pending: 0, averageProgress: null, byStatus: {} },
  stock: { items: 0, critical: 0, withoutAvailability: 0 },
  contracts: { total: 0, expired: 0, expiring30: 0 },
  atas: { total: 0, expired: 0 },
};

describe("briefing e query do dashboard", () => {
  it("fatos do briefing não inventam números além do consolidado", () => {
    const facts = buildBriefingFacts({
      summary: emptySummary,
      unreadAlerts: 0,
      alertTitles: ["a", "b", "c", "d", "e", "f"],
    });
    expect(facts.processes.averageProgress).toBeNull();
    expect(facts.alertTitles).toEqual(["a", "b", "c", "d", "e"]);
    expect(facts.unreadAlerts).toBe(0);
  });
  it("query inválida é ignorada", () => {
    expect(parseDashboardQuery({ councilId: "nao-e-uuid", focus: "xyz" })).toEqual({
      councilId: undefined,
      focus: "todos",
    });
  });
  it("query válida preserva conselho e foco", () => {
    const councilId = "11111111-1111-4111-8111-111111111111";
    expect(parseDashboardQuery({ councilId, focus: "atencao" })).toEqual({ councilId, focus: "atencao" });
  });
  it("parser ignora raciocínio e pega o JSON válido", () => {
    const briefing = parseBriefingText(
      'Pensando em { "processes": { "total": 0 } }\n{"headline":"Base vazia","bullets":["Nada a monitorar ainda."],"tone":"ok"}',
    );
    expect(briefing).toEqual({
      headline: "Base vazia",
      bullets: ["Nada a monitorar ainda."],
      tone: "ok",
    });
  });
});
