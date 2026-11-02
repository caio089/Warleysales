import { cn } from "@/lib/utils";
import { formatPercent } from "@/shared/lib/format";

interface ProgressBarProps {
  /** 0–100. */
  value: number;
  /** Rótulo acessível (ex.: "Progresso documental"). */
  label: string;
  showValue?: boolean;
  className?: string;
}

/** Barra de progresso com semântica ARIA; apenas exibe valores já derivados (R3). */
export function ProgressBar({ value, label, showValue = true, className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        className="h-2 flex-1 overflow-hidden rounded-full bg-muted"
      >
        <div
          className={cn("h-full rounded-full transition-[width]", clamped >= 100 ? "bg-success-foreground" : "bg-primary")}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showValue ? <span className="w-14 text-right text-xs tabular-nums">{formatPercent(clamped)}</span> : null}
    </div>
  );
}
