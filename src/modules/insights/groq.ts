import "server-only";
import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";
import { connection } from "next/server";
import { fail, ok, type Result } from "@/shared/lib/result";
import { BRIEFING_SYSTEM_PROMPT, parseBriefingText, type BriefingFacts, type OperationalBriefing } from "./briefing";

const GROQ_MODEL = "openai/gpt-oss-20b";

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
    const result = await generateText({
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
    });
    const briefing = parseBriefingText(collectModelText(result));
    if (!briefing) return fail("INTERNAL", "Não foi possível gerar o resumo agora.");
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
