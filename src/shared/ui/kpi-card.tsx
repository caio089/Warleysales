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
  /** Aplica o realce no número (prazos, estoque crítico). */
  accent?: boolean;
}

export function KpiCard({ label, value, hint, icon, href, accent = false }: KpiCardProps) {
  const inner = (
    <>
      <span
        aria-hidden
        className={cn(
          "absolute top-4 left-0 h-6 w-1 rounded-r-full transition-colors",
          accent ? "bg-amber-500 dark:bg-amber-400" : "bg-primary/20 group-hover:bg-primary/40",
        )}
      />
      <div className="relative flex items-center justify-between gap-2 pl-2">
        <p className="text-xs font-medium text-muted-foreground truncate">{label}</p>
        {icon ? (
          <span
            className={cn(
              "grid size-8 shrink-0 place-items-center rounded-lg transition-transform duration-200 group-hover:scale-105",
              accent
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                : "bg-secondary/80 text-muted-foreground group-hover:text-primary",
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <p
        className={cn(
          "relative mt-2 pl-2 font-heading text-2xl sm:text-3xl font-semibold tabular-nums tracking-tight",
          accent ? "text-amber-600 dark:text-amber-400" : "text-primary",
        )}
      >
        {value ?? "—"}
      </p>
      {hint ? <div className="relative mt-1 pl-2 text-xs text-muted-foreground/80 line-clamp-1">{hint}</div> : null}
    </>
  );

  const className = cn(
    "kpi-card surface-card card-hover group relative overflow-hidden p-4 sm:p-5 rounded-2xl border transition-all",
    href && "block focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none hover:border-border/80",
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
