import { cn } from "@/lib/utils";

export type StatusTone = "neutral" | "info" | "success" | "warning" | "danger";

const TONE_CLASSES: Record<StatusTone, string> = {
  neutral: "bg-muted text-muted-foreground",
  info: "bg-info text-info-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  danger: "bg-destructive/10 text-destructive dark:bg-destructive/20",
};

interface StatusBadgeProps {
  label: string;
  tone?: StatusTone;
  className?: string;
}

/** Selo de status. O texto sempre acompanha a cor (não depende só de cor para comunicar). */
export function StatusBadge({ label, tone = "neutral", className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}
