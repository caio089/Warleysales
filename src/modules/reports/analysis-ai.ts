import "server-only";
import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";
import { fallbackReportAnalysis, parseReportAnalysis, type ReportAnalysis, type ReportSource } from "./analysis";

export async function generateReportAnalysis(sources: ReportSource[]): Promise<{ analysis: ReportAnalysis; generatedByAi: boolean }> {
  const fallback = { analysis: fallbackReportAnalysis(sources), generatedByAi: false };
  if (!process.env.GROQ_API_KEY?.trim() || sources.every((source) => source.value === 0)) return fallback;
  try {
    const result = await generateText({
      model: groq("openai/gpt-oss-20b"),
      temperature: 0,
      abortSignal: AbortSignal.timeout(10_000),
      providerOptions: { groq: { reasoningFormat: "hidden", reasoningEffort: "low" } },
      system: [
        "Você analisa indicadores de relatório operacional em português do Brasil.",
        "Use exclusivamente os indicadores fornecidos. Não invente fatos, causas, pessoas ou recomendações sem apoio nos dados.",
        "Faça no máximo três observações práticas. Cada observação deve citar em sourceIds os IDs exatos dos indicadores que a sustentam.",
        "Não escreva números ou valores monetários no texto; a interface exibirá os valores diretamente da fonte.",
        'Responda somente JSON válido: {"headline":"texto","items":[{"text":"texto","sourceIds":["id"]}]}.',
      ].join(" "),
      prompt: JSON.stringify(sources.map(({ id, label, value }) => ({ id, label, value }))),
    });
    const analysis = parseReportAnalysis(result.text, sources);
    return analysis ? { analysis, generatedByAi: true } : fallback;
  } catch {
    return fallback;
  }
}
