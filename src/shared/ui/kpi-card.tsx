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
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 truncate">{label}</span>
        {icon ? (
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105",
              accent
                ? "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
            )}
          >
            {icon}
          </div>
        ) : null}
      </div>
      <div className="flex items-baseline justify-between mt-1">
        <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
          {value ?? "—"}
        </span>
        {hint ? <span className="text-[11px] font-medium text-slate-400 truncate">{hint}</span> : null}
      </div>
    </>
  );

  const className = cn(
    "bg-white dark:bg-card rounded-2xl p-4 border border-slate-200/80 dark:border-border/80 border-l-4 shadow-xs flex flex-col justify-between h-28 transition-all group",
    accent ? "border-l-amber-500" : "border-l-emerald-500",
    href && "hover:border-slate-300 dark:hover:border-border hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F2942]/20",
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
