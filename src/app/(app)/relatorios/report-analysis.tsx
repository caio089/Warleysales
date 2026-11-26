import Link from "next/link";
import { Sparkles } from "lucide-react";
import { generateReportAnalysis } from "@/modules/reports/analysis-ai";
import type { ReportSource } from "@/modules/reports/analysis";
import { formatCurrency } from "@/shared/lib/format";

export async function ReportAnalysisPanel({ sources }: { sources: ReportSource[] }) {
  const { analysis, generatedByAi } = await generateReportAnalysis(sources);
  const byId = new Map(sources.map((source) => [source.id, source]));
  return (
    <section className="surface-card space-y-3 p-5" aria-label="Análise rastreável do relatório">
      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
        <Sparkles className="size-4 text-highlight" aria-hidden />
        {generatedByAi ? "Análise dos indicadores com IA" : "Resumo dos indicadores"}
      </div>
      <p className="text-sm font-medium">{analysis.headline}</p>
      <ul className="space-y-3">
        {analysis.items.map((item, index) => (
          <li key={index} className="rounded-lg border border-border/70 p-3 text-sm">
            <p>{item.text}</p>
            <div className="mt-2 flex flex-wrap gap-2" aria-label="Fontes desta observação">
              {item.sourceIds.map((id) => {
                const source = byId.get(id);
                if (!source) return null;
                return <Link key={id} href={source.href} className="rounded-full border border-border px-2.5 py-1 text-xs text-primary underline-offset-2 hover:underline">
                  Fonte: {source.label}: {id.startsWith("savings.") ? formatCurrency(source.value) : source.value}
                </Link>;
              })}
            </div>
          </li>
        ))}
      </ul>
      {generatedByAi ? <p className="text-xs text-muted-foreground">Texto gerado a partir dos indicadores do relatório. Os valores e links vêm do sistema; esta análise não consulta documentos.</p> : null}
    </section>
  );
}
