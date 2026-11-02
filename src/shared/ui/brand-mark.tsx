import { cn } from "@/lib/utils";

interface BrandMarkProps {
  /** Versão para fundo escuro (sidebar e painel de login). */
  inverted?: boolean;
  compact?: boolean;
}

/** Marca institucional: colunas (conselhos) + traço laranja de realce. */
export function BrandMark({ inverted = false, compact = false }: BrandMarkProps) {
  return (
    <div className={cn("flex items-center gap-3", compact && "gap-2.5")}>
      <span
        aria-hidden
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-lg",
          inverted ? "bg-white/10" : "bg-primary",
        )}
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none">
          <rect x="4" y="8" width="4.5" height="12" rx="1" className={inverted ? "fill-white" : "fill-primary-foreground"} />
          <rect x="10" y="4" width="4.5" height="16" rx="1" className="fill-highlight" />
          <rect x="16" y="10" width="4.5" height="10" rx="1" className={inverted ? "fill-white/70" : "fill-primary-foreground/70"} />
        </svg>
      </span>
      {compact ? null : (
        <div className="min-w-0 leading-tight">
          <p className={cn("font-heading text-[1.05rem] font-semibold tracking-tight", inverted ? "text-white" : "text-primary")}>
            Conselhos
          </p>
          <p className={cn("text-[0.7rem] tracking-[0.14em] uppercase", inverted ? "text-white/55" : "text-muted-foreground")}>
            Gestão central
          </p>
        </div>
      )}
    </div>
  );
}
