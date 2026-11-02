import type { ReactNode } from "react";

interface KpiCardProps {
  label: string;
  /** Valor já formatado; null/undefined exibe "—" (nunca inventa número). */
  value: string | number | null | undefined;
  hint?: ReactNode;
}

export function KpiCard({ label, value, hint }: KpiCardProps) {
  return (
    <section aria-label={label} className="rounded-lg border bg-card p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value ?? "—"}</p>
      {hint ? <div className="mt-1 text-xs text-muted-foreground">{hint}</div> : null}
    </section>
  );
}
