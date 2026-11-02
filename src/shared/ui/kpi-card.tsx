import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  /** Valor já formatado; null/undefined exibe "—" (nunca inventa número). */
  value: string | number | null | undefined;
  hint?: ReactNode;
  icon?: ReactNode;
  href?: string;
  /** Aplica o laranja de realce no número (prazos, estoque crítico). */
  accent?: boolean;
}

export function KpiCard({ label, value, hint, icon, href, accent = false }: KpiCardProps) {
  const inner = (
    <>
      <span
        aria-hidden
        className={cn("absolute top-5 left-0 h-8 w-0.5 rounded-full", accent ? "bg-highlight" : "bg-primary/25")}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/0 via-transparent to-highlight/8 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div className="relative flex items-start justify-between gap-3 pl-2">
        <p className="text-[0.7rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{label}</p>
        {icon ? (
          <span
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-105",
              accent ? "bg-highlight/12 text-highlight" : "bg-secondary text-primary",
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <p
        className={cn(
          "relative mt-3 pl-2 font-heading text-3xl font-medium tabular-nums tracking-tight",
          accent ? "text-highlight" : "text-primary",
        )}
      >
        {value ?? "—"}
      </p>
      {hint ? <div className="relative mt-2 pl-2 text-xs text-muted-foreground">{hint}</div> : null}
    </>
  );

  const className = cn(
    "kpi-card surface-card card-hover group relative overflow-hidden p-5",
    href && "block focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
  );

  if (href) {
    return (
      <Link href={href} aria-label={label} className={className}>
        {inner}
      </Link>
    );
  }

  return (
    <section aria-label={label} className={className}>
      {inner}
    </section>
  );
}
