import { z } from "zod";
import type { AuditEntry } from "@/modules/audit/schemas";
import type { SavingsReportData } from "./pdf";
import type { OperationalSummary } from "./service";

export interface ReportSource {
  id: string;
  label: string;
  value: number;
  href: string;
}

const analysisSchema = z.object({
  headline: z.string().trim().min(5).max(140),
  items: z.array(z.object({
    text: z.string().trim().min(8).max(220),
    sourceIds: z.array(z.string()).min(1).max(3),
  })).min(1).max(3),
});

export type ReportAnalysis = z.infer<typeof analysisSchema>;

/** Rejeita afirmações numéricas geradas e referências fora dos indicadores fornecidos. */
export function parseReportAnalysis(raw: string, sources: ReportSource[]): ReportAnalysis | null {
  try {
    const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    const parsed = analysisSchema.safeParse(JSON.parse(cleaned));
    if (!parsed.success) return null;
    const known = new Set(sources.map((source) => source.id));
    if (/\d|R\$/i.test([parsed.data.headline, ...parsed.data.items.map((item) => item.text)].join(" "))) return null;
    if (parsed.data.items.some((item) => item.sourceIds.some((id) => !known.has(id)))) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

export function operationalSources(summary: OperationalSummary, savings: SavingsReportData | null): ReportSource[] {
  const sources: ReportSource[] = [
    { id: "processes.pending", label: "Processos pendentes", value: summary.processes.pending, href: "/processos" },
    { id: "processes.completed", label: "Processos concluídos", value: summary.processes.completed, href: "/processos" },
    { id: "stock.critical", label: "Itens críticos", value: summary.stock.critical, href: "/estoque" },
    { id: "stock.unavailable", label: "Sem disponibilidade", value: summary.stock.withoutAvailability, href: "/estoque" },
    { id: "contracts.expiring", label: "Contratos vencendo em trinta dias", value: summary.contracts.expiring30, href: "/contratos" },
    { id: "contracts.expired", label: "Contratos vencidos", value: summary.contracts.expired, href: "/contratos" },
    { id: "atas.expired", label: "Atas vencidas", value: summary.atas.expired, href: "/atas" },
  ];
  if (savings) {
    sources.push(
      { id: "savings.estimated", label: "Valor global inicial (R$)", value: savings.totalEstimated, href: "/relatorios?tab=indicadores#econ" },
      { id: "savings.contracted", label: "Valor contratado (R$)", value: savings.totalContracted, href: "/relatorios?tab=indicadores#econ" },
      { id: "savings.total", label: "Economia acumulada (R$)", value: savings.totalSavings, href: "/relatorios?tab=indicadores#econ" },
    );
  }
  return sources;
}

export function auditSources(entries: AuditEntry[], filterQuery = ""): ReportSource[] {
  const base = `/relatorios?tab=auditoria${filterQuery ? `&${filterQuery}` : ""}`;
  return [
    { id: "audit.loaded", label: "Eventos carregados no filtro (até mil)", value: entries.length, href: base },
    { id: "audit.denied", label: "Ações negadas", value: entries.filter((entry) => entry.result === "denied").length, href: base },
    { id: "audit.errors", label: "Erros", value: entries.filter((entry) => entry.result === "error").length, href: base },
  ];
}

export function fallbackReportAnalysis(sources: ReportSource[]): ReportAnalysis {
  const priority = [...sources].sort((a, b) => b.value - a.value).slice(0, 3);
  return {
    headline: sources.some((source) => source.value !== 0) ? "Panorama dos indicadores do relatório" : "Nenhum registro nos indicadores consultados",
    items: priority.map((source) => ({ text: `Confira ${source.label.toLowerCase()} na fonte indicada.`, sourceIds: [source.id] })),
  };
}
