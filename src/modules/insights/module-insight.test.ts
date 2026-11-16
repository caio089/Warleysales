import { afterEach, describe, expect, it, vi } from "vitest";
import { ok } from "@/shared/lib/result";
import { generateModuleInsight } from "./module-insight";

vi.mock("./groq", () => ({
  generateModuleBriefing: vi.fn(async () => ok({
    headline: "Priorize os contratos próximos do vencimento",
    bullets: ["Revise as renovações pendentes."],
    tone: "atencao",
  })),
}));

const oldKey = process.env.GROQ_API_KEY;
afterEach(() => {
  if (oldKey === undefined) delete process.env.GROQ_API_KEY;
  else process.env.GROQ_API_KEY = oldKey;
});

describe("insight por módulo", () => {
  it("mostra resumo calculado quando IA não está configurada", async () => {
    delete process.env.GROQ_API_KEY;
    expect(await generateModuleInsight("Contratos", [{ label: "Vencem em 30 dias", value: 2 }])).toEqual({
      headline: "Panorama de contratos",
      bullets: ["Vencem em 30 dias: 2"],
      generatedByAi: false,
    });
  });

  it("usa a IA apenas com fatos agregados e informa a origem da narrativa", async () => {
    process.env.GROQ_API_KEY = "test-key";
    const insight = await generateModuleInsight("Contratos", [{ label: "Vencem em 30 dias", value: 2 }]);
    expect(insight).toEqual({
      headline: "Priorize os contratos próximos do vencimento",
      bullets: ["Revise as renovações pendentes."],
      generatedByAi: true,
    });
  });
});
