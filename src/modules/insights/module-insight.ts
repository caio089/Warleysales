export interface ModuleFact {
  label: string;
  value: number;
}

export interface ModuleInsightResult {
  headline: string;
  bullets: string[];
  generatedByAi: boolean;
}

export async function generateModuleInsight(moduleName: string, facts: ModuleFact[]): Promise<ModuleInsightResult> {
  const safeFacts = facts.slice(0, 10).map(({ label, value }) => ({
    label: label.slice(0, 80),
    value: Number.isFinite(value) ? value : 0,
  }));
  if (process.env.GROQ_API_KEY?.trim() && safeFacts.some((fact) => fact.value !== 0)) {
    try {
      const { generateModuleBriefing } = await import("./groq");
      const result = await generateModuleBriefing(moduleName, safeFacts);
      if (result.ok) {
        return { headline: result.data.headline, bullets: result.data.bullets, generatedByAi: true };
      }
    } catch {
      // Disponibilidade da IA não bloqueia as visões gerais.
    }
  }
  return {
    headline: safeFacts.some((fact) => fact.value !== 0)
      ? `Panorama de ${moduleName.toLowerCase()}`
      : "Não há registros nos indicadores desta visão geral",
    bullets: safeFacts.slice(0, 4).map((fact) => `${fact.label}: ${fact.value}`),
    generatedByAi: false,
  };
}
