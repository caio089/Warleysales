import { z } from "zod";
import type { OperationalSummary } from "@/modules/reports/service";

/** Fatos já calculados no servidor — a IA só narra, nunca inventa quantidade. */
export interface BriefingFacts {
  councilLabel: string | null;
  processes: OperationalSummary["processes"];
  stock: OperationalSummary["stock"];
  contracts: OperationalSummary["contracts"];
  atas: OperationalSummary["atas"];
  totalCompanies?: number;
  requestsSummary?: {
    pending: number;
    inProgress: number;
    completed: number;
  };
  stockAttention?: {
    company: string;
    material: string;
    available: number;
    minimum: number;
    level: string;
  }[];
  upcomingMeetings?: {
    company: string;
    title: string;
    scheduledAt: string;
  }[];
  pendingDeliveriesCount?: number;
  unreadAlerts: number;
  alertTitles: string[];
}

export const briefingSchema = z.object({
  headline: z.string().min(1).max(140),
  bullets: z.array(z.string().min(1).max(200)).min(1).max(4),
  tone: z.enum(["ok", "atencao", "critico"]),
});

export type OperationalBriefing = z.infer<typeof briefingSchema>;

/** Extrai o JSON do briefing mesmo se o modelo misturar raciocínio ou markdown. */
export function parseBriefingText(text: string): OperationalBriefing | null {
  const stripped = text.replace(/```(?:json)?/gi, "").trim();
  const candidates = [stripped, ...extractJsonObjects(stripped)];
  for (let index = candidates.length - 1; index >= 0; index -= 1) {
    const briefing = coerceBriefing(candidates[index]);
    if (briefing) return briefing;
  }
  return null;
}

function coerceBriefing(raw: string): OperationalBriefing | null {
  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    if (!value || typeof value !== "object") return null;
    const bullets = Array.isArray(value.bullets)
      ? value.bullets
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim().slice(0, 200))
          .filter(Boolean)
          .slice(0, 4)
      : [];
    const parsed = briefingSchema.safeParse({
      headline: typeof value.headline === "string" ? value.headline.trim().slice(0, 140) : "",
      bullets,
      tone: value.tone,
    });
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

function extractJsonObjects(text: string): string[] {
  const objects: string[] = [];
  for (let start = 0; start < text.length; start += 1) {
    if (text[start] !== "{") continue;
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let cursor = start; cursor < text.length; cursor += 1) {
      const char = text[cursor];
      if (inString) {
        if (escaped) escaped = false;
        else if (char === "\\") escaped = true;
        else if (char === '"') inString = false;
        continue;
      }
      if (char === '"') inString = true;
      else if (char === "{") depth += 1;
      else if (char === "}") {
        depth -= 1;
        if (depth === 0) {
          objects.push(text.slice(start, cursor + 1));
          break;
        }
      }
    }
  }
  return objects;
}

export function buildBriefingFacts(input: {
  summary: OperationalSummary;
  councilLabel?: string | null;
  unreadAlerts: number;
  alertTitles: string[];
  totalCompanies?: number;
  requestsSummary?: {
    pending: number;
    inProgress: number;
    completed: number;
  };
  stockAttention?: {
    company: string;
    material: string;
    available: number;
    minimum: number;
    level: string;
  }[];
  upcomingMeetings?: {
    company: string;
    title: string;
    scheduledAt: string;
  }[];
  pendingDeliveriesCount?: number;
}): BriefingFacts {
  return {
    councilLabel: input.councilLabel ?? null,
    processes: input.summary.processes,
    stock: input.summary.stock,
    contracts: input.summary.contracts,
    atas: input.summary.atas,
    totalCompanies: input.totalCompanies,
    requestsSummary: input.requestsSummary,
    stockAttention: input.stockAttention,
    upcomingMeetings: input.upcomingMeetings,
    pendingDeliveriesCount: input.pendingDeliveriesCount,
    unreadAlerts: input.unreadAlerts,
    alertTitles: input.alertTitles.slice(0, 5),
  };
}

export const BRIEFING_SYSTEM_PROMPT = [
  "Você redige um briefing operacional executivo em português do Brasil para a central de operações do Warley com as empresas clientes.",
  "Analise as prioridades operacionais a partir do JSON fornecido: solicitações aguardando atendimento, empresas com necessidade de reposição de estoque, entregas pendentes e reuniões agendadas.",
  "Use SOMENTE os dados, nomes de empresas, produtos e números do JSON. Nunca invente valores, prazos ou empresas fictícias.",
  "Se tudo estiver normal e sem alertas ou pendências, destaque a estabilidade operacional.",
  "Não use markdown no texto gerado. headline curta e direta (máx 140 chars); até 4 bullets objetivos com contexto e recomendação prática; tone = ok | atencao | critico.",
].join(" ");
