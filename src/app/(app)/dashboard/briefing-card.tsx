import { AlertTriangle, CalendarClock, CheckCircle2, ChevronDown, Package, ShoppingCart, Sparkles } from "lucide-react";
import { generateBriefing } from "@/modules/insights/service";
import type { BriefingFacts } from "@/modules/insights/briefing";
import { cn } from "@/lib/utils";

const surface = "rounded-2xl border border-highlight/30 bg-linear-to-br from-highlight/10 via-card to-card p-5 shadow-xs sm:p-6";

export async function BriefingCard({ facts }: { facts: BriefingFacts }) {
  const insight = await generateBriefing(facts);
  const StatusIcon = insight.hasBlockers ? AlertTriangle : CheckCircle2;
  const highlights = [
    { icon: ShoppingCart, label: "Solicitações pendentes", value: facts.requestsSummary?.pending },
    { icon: Package, label: "Itens com estoque crítico", value: facts.stock.critical },
    { icon: CalendarClock, label: "Contratos a vencer em 30 dias", value: facts.contracts.expiring30 },
  ];

  return (
    <section aria-labelledby="briefing-heading" className={surface}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-highlight/20 text-highlight-foreground">
            <Sparkles className="size-5" aria-hidden />
          </span>
          <h2 id="briefing-heading" className="font-heading text-xl font-semibold text-primary">Resumo inteligente da operação</h2>
          <span className="rounded-full bg-highlight/15 px-2.5 py-1 text-xs font-semibold text-highlight-foreground">
            {insight.source === "alternativo" ? "Resumo alternativo" : "IA"}
          </span>
        </div>
        <span className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
          insight.hasBlockers ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-900",
        )}>
          <StatusIcon className="size-3.5" aria-hidden />
          {insight.hasBlockers ? "Pontos de atenção" : "Operação estável"}
        </span>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        {facts.councilLabel ? `Órgão: ${facts.councilLabel}` : "Visão consolidada"}
        {insight.source === "alternativo" ? " · IA indisponível nesta consulta" : null}
      </p>
      <p className="mt-1 max-w-3xl text-base font-semibold leading-relaxed text-foreground">{insight.headline}</p>
      {insight.bullets[0] ? <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">{insight.bullets[0]}</p> : null}

      <dl className="mt-4 grid gap-2 sm:grid-cols-3">
        {highlights.filter(({ value }) => value !== undefined).map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-2.5 rounded-xl border border-border bg-card/80 px-3 py-2.5">
            <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <div>
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="text-sm font-semibold tabular-nums text-primary">{value}</dd>
            </div>
          </div>
        ))}
      </dl>

      <details className="group mt-4">
        <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
          Ver análise completa <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden />
        </summary>
        <ul className="mt-4 space-y-2 border-t border-border pt-4 text-sm leading-relaxed text-foreground">
          {(insight.bullets.length ? insight.bullets : [insight.headline]).map((bullet, index) => (
            <li key={index} className="flex gap-2.5">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-highlight" aria-hidden />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}

export function BriefingFallback() {
  return (
    <div role="status" className={cn(surface, "flex items-center gap-3 text-sm text-muted-foreground")}>
      <Sparkles className="size-5 text-highlight motion-safe:animate-pulse" aria-hidden />
      <span>Carregando resumo inteligente da operação...</span>
    </div>
  );
}
