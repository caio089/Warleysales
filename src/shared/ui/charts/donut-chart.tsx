import { cn } from "@/lib/utils";

export interface DonutSlice {
  id: string;
  label: string;
  value: number;
  color: string;
}

function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

/** Donut SVG simples (sem lib externa) para visão geral do Início. */
export function DonutChart({
  slices,
  centerLabel,
  centerValue,
  className,
  size = 168,
}: {
  slices: DonutSlice[];
  centerLabel: string;
  centerValue: string | number;
  className?: string;
  size?: number;
}) {
  const total = slices.reduce((sum, slice) => sum + Math.max(0, slice.value), 0);
  const radius = size * 0.36;
  const stroke = size * 0.14;
  const cx = size / 2;
  const cy = size / 2;

  let angle = 0;
  const arcs =
    total <= 0
      ? []
      : slices
          .filter((slice) => slice.value > 0)
          .map((slice) => {
            const sweep = (slice.value / total) * 360;
            const start = angle;
            const end = angle + sweep;
            angle = end;
            // Fatia quase completa: desenha círculo cheio
            if (sweep >= 359.9) {
              return { ...slice, path: null as string | null, full: true };
            }
            return {
              ...slice,
              path: describeArc(cx, cy, radius, start, end),
              full: false,
            };
          });

  return (
    <div className={cn("flex flex-col items-center gap-4 sm:flex-row sm:items-center", className)}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden className="overflow-visible">
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-muted/40" />
          {total <= 0 ? null : arcs.map((arc) =>
            arc.full ? (
              <circle
                key={arc.id}
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke={arc.color}
                strokeWidth={stroke}
                className="transition-[stroke-dashoffset] duration-700"
              />
            ) : (
              <path
                key={arc.id}
                d={arc.path ?? undefined}
                fill="none"
                stroke={arc.color}
                strokeWidth={stroke}
                strokeLinecap="round"
                className="origin-center animate-in fade-in duration-700"
              />
            ),
          )}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-2xl font-semibold tabular-nums tracking-tight text-primary">{centerValue}</p>
          <p className="text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground">{centerLabel}</p>
        </div>
      </div>
      <ul className="min-w-0 flex-1 space-y-2" aria-label={centerLabel}>
        {slices.map((slice) => (
          <li key={slice.id} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: slice.color }} aria-hidden />
              <span className="truncate text-muted-foreground">{slice.label}</span>
            </span>
            <span className="shrink-0 font-semibold tabular-nums text-foreground">{slice.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
