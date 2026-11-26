import "server-only";
import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";
import { connection } from "next/server";
import { log } from "@/shared/lib/logger";
import { fail, ok, type Result } from "@/shared/lib/result";
import { BRIEFING_SYSTEM_PROMPT, briefingUsesOnlyKnownNumbers, parseBriefingText, type BriefingFacts, type OperationalBriefing } from "./briefing";
import type { ModuleFact } from "./module-insight";

const GROQ_MODEL = "openai/gpt-oss-20b";

async function timedGeneration<T>(kind: "dashboard" | "module", generate: () => Promise<T>): Promise<T> {
  const started = performance.now();
  let outcome = "error";
  try {
    const result = await generate();
    outcome = "success";
    return result;
  } finally {
    log("info", "insights.generation", { kind, outcome, durationMs: Math.round(performance.now() - started) });
  }
}
export function isGroqConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY?.trim());
}

/** Narra o consolidado já autorizado. Sem chave: estado honesto, sem texto simulado. */
export async function generateOperationalBriefing(facts: BriefingFacts): Promise<Result<OperationalBriefing>> {
  await connection();
  if (!isGroqConfigured()) {
    return fail("UNAVAILABLE", "Resumo de IA não configurado. Defina GROQ_API_KEY no servidor.");
  }
  try {
    const result = await timedGeneration("dashboard", () => generateText({
      model: groq(GROQ_MODEL),
      temperature: 0,
      providerOptions: {
        groq: {
          reasoningFormat: "hidden",
          reasoningEffort: "low",
        },
      },
      system: `${BRIEFING_SYSTEM_PROMPT} Responda somente JSON válido: {"headline": string, "bullets": string[], "tone": "ok"|"atencao"|"critico"}.`,
      prompt: JSON.stringify(facts),
    }));
    const briefing = parseBriefingText(collectModelText(result));
    if (!briefing || !briefingUsesOnlyKnownNumbers(briefing, facts)) return fail("INTERNAL", "Não foi possível gerar o resumo agora.");
    return ok(briefing);
  } catch {
    return fail("UNAVAILABLE", "O resumo de IA está temporariamente indisponível.");
  }
}

/** Interpreta somente indicadores agregados já autorizados para a visão do módulo. */
export async function generateModuleBriefing(moduleName: string, facts: ModuleFact[]): Promise<Result<OperationalBriefing>> {
  await connection();
  if (!isGroqConfigured()) return fail("UNAVAILABLE", "Resumo de IA não configurado.");
  try {
    const result = await timedGeneration("module", () => generateText({
      model: groq(GROQ_MODEL),
      temperature: 0,
      abortSignal: AbortSignal.timeout(8_000),
      providerOptions: { groq: { reasoningFormat: "hidden", reasoningEffort: "low" } },
      system: [
        "Você analisa indicadores de um módulo do sistema Warley em português do Brasil.",
        "Use somente os fatos fornecidos. Não invente quantidades, prazos ou eventos.",
        "Dê uma prioridade operacional prática. Não inclua números no texto gerado; os números serão exibidos à parte a partir da fonte.",
        'Responda apenas JSON válido: {"headline": string, "bullets": string[], "tone": "ok"|"atencao"|"critico"}.',
        "Título com até 140 caracteres, no máximo 3 tópicos, cada um com até 200 caracteres.",
      ].join(" "),
      prompt: JSON.stringify({ module: moduleName, facts }),
    }));
    const briefing = parseBriefingText(collectModelText(result));
    if (!briefing || /\d/.test([briefing.headline, ...briefing.bullets].join(" "))) {
      return fail("INTERNAL", "Resumo inválido.");
    }
    return ok(briefing);
  } catch {
    return fail("UNAVAILABLE", "O resumo de IA está temporariamente indisponível.");
  }
}

function collectModelText(result: { text: string; reasoning?: unknown }): string {
  const extra = Array.isArray(result.reasoning)
    ? result.reasoning
        .map((part) => (part && typeof part === "object" && "text" in part ? String(part.text ?? "") : ""))
        .join("\n")
    : typeof result.reasoning === "string"
      ? result.reasoning
      : "";
  return [result.text, extra].filter(Boolean).join("\n");
}
