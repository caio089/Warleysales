import { Sparkles, AlertTriangle, CheckCircle2 } from "lucide-react";
import { generateBriefing } from "@/modules/insights/service";
import type { BriefingFacts } from "@/modules/insights/briefing";

export async function BriefingCard({ facts }: { facts: BriefingFacts }) {
  const insight = await generateBriefing(facts);

  return (
    <section
      aria-label="Briefing Operacional de IA"
      className="relative overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-r from-card via-card to-amber-500/5 p-4 sm:p-5 shadow-xs"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Sparkles className="size-4" aria-hidden />
          </span>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Briefing Operacional
          </h2>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.68rem] font-semibold ${
              insight.hasBlockers
                ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            }`}
          >
            {insight.hasBlockers ? (
              <>
                <AlertTriangle className="size-3 text-amber-600 dark:text-amber-400" />
                Pontos de atenção
              </>
            ) : (
              <>
                <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
                Operação estável
              </>
            )}
          </span>
        </div>
        <p className="text-xs font-semibold text-primary">{insight.headline}</p>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {insight.bullets.map((bullet, index) => (
          <div
            key={index}
            className="flex items-start gap-2 rounded-xl bg-background/60 p-2.5 text-xs text-foreground/90 border border-border/40"
          >
            <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-amber-500" />
            <span className="leading-snug">{bullet}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function BriefingFallback() {
  return (
    <div
      aria-label="Carregando Briefing Operacional"
      className="flex items-center gap-2 rounded-2xl border border-border/40 bg-card p-4 text-xs text-muted-foreground"
    >
      <Sparkles className="size-4 animate-spin text-amber-500" />
      <span>Carregando Briefing Operacional...</span>
    </div>
  );
}
