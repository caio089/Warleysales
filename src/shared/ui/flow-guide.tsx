import Link from "next/link";
import { ArrowRight, CircleCheck, CircleDot, Lightbulb, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FlowStep {
  title: string;
  detail: string;
}

/** Como funciona o fluxo — passos curtos, sem jargão. */
export function FlowGuide({
  title = "Como funciona",
  steps,
  className,
}: {
  title?: string;
  steps: FlowStep[];
  className?: string;
}) {
  return (
    <section aria-label={title} className={cn("surface-card mb-6 overflow-hidden p-5", className)}>
      <p className="mb-4 text-[0.7rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">{title}</p>
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <li key={step.title} className="relative flex gap-3">
            <span
              aria-hidden
              className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
            >
              {index + 1}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-primary">{step.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{step.detail}</p>
            </div>
            {index < steps.length - 1 ? (
              <ArrowRight
                className="pointer-events-none absolute top-2 -right-2 hidden size-3.5 text-border lg:block"
                aria-hidden
              />
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

export interface NextStepProps {
  title: string;
  description: string;
  /** Tom: ação pendente do usuário vs. só informativo. */
  tone?: "action" | "info" | "done";
  className?: string;
}

/** Destaque do próximo passo na tela de detalhe — a pessoa não precisa adivinhar. */
export function NextStepCallout({ title, description, tone = "action", className }: NextStepProps) {
  const Icon: LucideIcon = tone === "done" ? CircleCheck : tone === "info" ? Lightbulb : CircleDot;
  return (
    <aside
      role="status"
      className={cn(
        "mb-6 flex gap-3 rounded-2xl border px-4 py-3.5",
        tone === "action" && "border-highlight/35 bg-highlight/8",
        tone === "info" && "border-border/80 bg-secondary/50",
        tone === "done" && "border-success-foreground/20 bg-success",
        className,
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 size-5 shrink-0",
          tone === "action" && "text-highlight",
          tone === "info" && "text-primary",
          tone === "done" && "text-success-foreground",
        )}
        aria-hidden
      />
      <div className="min-w-0">
        <p
          className={cn(
            "text-sm font-semibold",
            tone === "done" ? "text-success-foreground" : "text-primary",
          )}
        >
          {tone === "action" ? `Próximo passo: ${title}` : title}
        </p>
        <p
          className={cn(
            "mt-0.5 text-sm leading-relaxed",
            tone === "done" ? "text-success-foreground/90" : "text-muted-foreground",
          )}
        >
          {description}
        </p>
      </div>
    </aside>
  );
}

export interface LifecycleStep {
  key: string;
  label: string;
}

/** Trilho simplificado do ciclo (rascunho → fim). Etapas fora do caminho principal ficam de fora. */
export function LifecycleRail({
  steps,
  currentKey,
  className,
}: {
  steps: LifecycleStep[];
  currentKey: string;
  className?: string;
}) {
  const currentIndex = Math.max(
    0,
    steps.findIndex((s) => s.key === currentKey),
  );
  const known = steps.some((s) => s.key === currentKey);

  return (
    <nav aria-label="Andamento do fluxo" className={cn("mb-6", className)}>
      <ol className="flex flex-wrap items-center gap-2">
        {steps.map((step, index) => {
          const done = known && index < currentIndex;
          const current = known && index === currentIndex;
          return (
            <li key={step.key} className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                  done && "bg-primary text-primary-foreground",
                  current && "bg-highlight/15 text-highlight ring-1 ring-highlight/40",
                  !done && !current && "bg-secondary text-muted-foreground",
                )}
              >
                <span aria-hidden className="tabular-nums opacity-70">
                  {index + 1}.
                </span>
                {step.label}
              </span>
              {index < steps.length - 1 ? (
                <ArrowRight className="size-3.5 text-border" aria-hidden />
              ) : null}
            </li>
          );
        })}
      </ol>
      {!known ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Esta solicitação está em um status fora do caminho principal (ex.: correção, rejeição ou cancelamento). Veja o histórico abaixo.
        </p>
      ) : null}
    </nav>
  );
}

/** Atalhos grandes “comece por aqui” no painel. */
export function StartHereCard({
  href,
  step,
  title,
  description,
  cta,
}: {
  href: string;
  step: number;
  title: string;
  description: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="surface-card card-hover group flex flex-col gap-3 p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {step}
        </span>
        <span className="text-[0.7rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">Comece por aqui</span>
      </span>
      <div>
        <p className="font-heading text-lg font-medium tracking-tight text-primary">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-highlight">
        {cta}
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </span>
    </Link>
  );
}
