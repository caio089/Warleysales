import { cn } from "@/lib/utils";

export type StatusTone = "neutral" | "info" | "success" | "warning" | "danger";

const TONE_CLASSES: Record<StatusTone, string> = {
  neutral: "bg-muted text-muted-foreground border-border/60",
  info: "bg-info text-info-foreground border-info-foreground/15",
  success: "bg-success text-success-foreground border-success-foreground/15",
  warning: "bg-warning text-warning-foreground border-warning-foreground/15",
  danger: "bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/20",
};

interface StatusBadgeProps {
  label: string;
  tone?: StatusTone;
  className?: string;
}

/** Selo de status com borda semântica sutil e texto em caixa alta. */
export function StatusBadge({ label, tone = "neutral", className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.68rem] font-semibold tracking-[0.08em] uppercase whitespace-nowrap shadow-xs",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}
