import { Sparkles } from "lucide-react";
import { generateOperationalBriefing } from "@/modules/insights/groq";
import type { BriefingFacts } from "@/modules/insights/briefing";
import { cn } from "@/lib/utils";

const TONE_STYLES = {
  ok: "border-success/50 bg-[linear-gradient(180deg,oklch(0.97_0.02_155)_0%,oklch(1_0.002_250)_55%)]",
  atencao: "border-highlight/40 bg-[linear-gradient(180deg,oklch(0.97_0.03_75)_0%,oklch(1_0.002_250)_55%)]",
  critico: "border-destructive/30 bg-[linear-gradient(180deg,oklch(0.97_0.03_25)_0%,oklch(1_0.002_250)_55%)]",
} as const;

const TONE_LABEL = {
  ok: "Situação estável",
  atencao: "Há pontos de atenção",
  critico: "Há itens críticos",
} as const;

/** Ilha de IA: só narra fatos já carregados; se a Groq falhar, o restante do painel permanece. */
export async function BriefingCard({ facts }: { facts: BriefingFacts }) {
  const result = await generateOperationalBriefing(facts);

  if (!result.ok) {
    return (
      <section className="surface-card p-5" aria-label="Resumo de IA">
        <div className="mb-2 flex items-center gap-2 text-primary">
          <span className="grid size-9 place-items-center rounded-xl bg-secondary">
            <Sparkles className="size-4 text-highlight" aria-hidden />
          </span>
          <h2 className="font-heading text-lg font-medium tracking-tight">Resumo de IA</h2>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{result.message}</p>
      </section>
    );
  }

  const briefing = result.data;
  return (
    <section className={cn("surface-card card-hover p-5", TONE_STYLES[briefing.tone])} aria-label="Resumo de IA">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-primary">
          <span className="grid size-9 place-items-center rounded-xl bg-card/80 shadow-sm">
            <Sparkles className="size-4 text-highlight" aria-hidden />
          </span>
          <p className="text-[0.7rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">Resumo de IA</p>
        </div>
        <span className="rounded-full border border-border/70 bg-card/80 px-2.5 py-0.5 text-[0.7rem] font-semibold tracking-wide text-muted-foreground uppercase">
          {TONE_LABEL[briefing.tone]}
        </span>
      </div>
      <h2 className="font-heading text-xl font-medium tracking-tight text-primary md:text-[1.4rem]">{briefing.headline}</h2>
      <ul className="mt-4 space-y-2 text-sm leading-relaxed text-foreground/80">
        {briefing.bullets.map((bullet, index) => (
          <li key={`${index}-${bullet.slice(0, 24)}`} className="flex gap-2.5">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-highlight" aria-hidden />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[0.7rem] text-muted-foreground">Narrado pela Groq a partir dos números já carregados. Nenhum valor é inventado.</p>
    </section>
  );
}

export function BriefingFallback() {
  return (
    <section className="surface-card p-5" aria-label="Gerando resumo de IA">
      <div className="flex items-center gap-2">
        <span className="grid size-9 place-items-center rounded-xl bg-secondary">
          <Sparkles className="size-4 animate-pulse text-highlight" aria-hidden />
        </span>
        <p className="text-[0.7rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">Resumo de IA</p>
      </div>
      <div className="mt-4 h-6 w-2/3 animate-pulse rounded bg-muted" />
      <div className="mt-3 h-4 w-full animate-pulse rounded bg-muted/80" />
      <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-muted/70" />
    </section>
  );
}
