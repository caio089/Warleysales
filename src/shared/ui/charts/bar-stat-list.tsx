import { cn } from "@/lib/utils";

export interface BarStatItem {
  id: string;
  label: string;
  value: number;
  /** Cor da barra (classe Tailwind bg-*). */
  barClassName?: string;
}

/** Lista de barras horizontais para indicadores do Início. */
export function BarStatList({
  items,
  className,
  emptyLabel = "Nada para mostrar agora.",
}: {
  items: BarStatItem[];
  className?: string;
  emptyLabel?: string;
}) {
  const max = Math.max(...items.map((item) => item.value), 0);
  if (items.length === 0 || max <= 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <ul className={cn("space-y-3", className)} aria-label="Indicadores">
      {items.map((item) => {
        const pct = Math.max(6, Math.round((item.value / max) * 100));
        return (
          <li key={item.id} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 truncate text-muted-foreground">{item.label}</span>
              <span className="shrink-0 font-semibold tabular-nums text-foreground">{item.value}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted/60">
              <div
                className={cn(
                  "h-full rounded-full transition-[width] duration-700 ease-out",
                  item.barClassName ?? "bg-primary",
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
