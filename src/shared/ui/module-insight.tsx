import Link from "next/link";
import { Sparkles } from "lucide-react";
import { generateModuleInsight, type ModuleFact } from "@/modules/insights/module-insight";

export async function ModuleInsight({ moduleName, facts, sourceHref }: {
  moduleName: string;
  facts: ModuleFact[];
  sourceHref: string;
}) {
  const insight = await generateModuleInsight(moduleName, facts);
  return (
    <section aria-label={`Resumo de ${moduleName}`} className="surface-card mb-6 space-y-3 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Sparkles className="size-4 text-highlight" aria-hidden />
        <h2 className="text-sm font-semibold text-primary">{insight.generatedByAi ? "Insight de IA" : "Resumo operacional"}</h2>
        <span className="text-xs text-muted-foreground">· {moduleName}</span>
      </div>
      <p className="text-sm font-medium text-foreground">{insight.headline}</p>
      {insight.generatedByAi && insight.bullets.length > 0 ? (
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {insight.bullets.map((bullet, index) => <li key={index}>{bullet}</li>)}
        </ul>
      ) : null}
      <div className="flex flex-wrap gap-2" aria-label="Indicadores usados no resumo">
        {facts.map((fact) => (
          <span key={fact.label} className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
            {fact.label}: <strong className="text-foreground">{fact.value}</strong>
          </span>
        ))}
      </div>
      <Link href={sourceHref} className="text-xs font-medium text-primary underline-offset-2 hover:underline">
        Fonte: dados desta visão geral
      </Link>
    </section>
  );
}

export function ModuleInsightFallback() {
  return <div className="surface-card h-28 animate-pulse" aria-label="Carregando resumo operacional" />;
}
