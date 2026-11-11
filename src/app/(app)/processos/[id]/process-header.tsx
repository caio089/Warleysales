import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatCurrency } from "@/shared/lib/format";
import { StatusBadge, type StatusTone } from "@/shared/ui/status-badge";

export interface ProcessHeaderProps {
  processNumber: string;
  productName: string;
  description: string;
  statusLabel: string;
  statusTone: StatusTone;
  completionLabel: string;
  completionTone: StatusTone;
  initialValue: number | null;
  quantity: number;
  validTypesCount: number;
  totalTypesCount: number;
  displayPercent: number;
  releaseStatusText: string;
}

export function ProcessHeader({
  processNumber,
  productName,
  description,
  statusLabel,
  statusTone,
  completionLabel,
  completionTone,
  initialValue,
  quantity,
  validTypesCount,
  totalTypesCount,
  displayPercent,
  releaseStatusText,
}: ProcessHeaderProps) {
  const clampedPercent = Math.min(100, Math.max(0, displayPercent));

  return (
    <header className="mb-6 space-y-4">
      {/* Navegação de retorno */}
      <div>
        <Link
          href="/processos"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          <span>Voltar para Processos</span>
        </Link>
      </div>

      {/* Topo Executivo: Eyebrow, Título, Descrição e Badges */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[0.7rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Processo {processNumber}
          </p>
          <h1 className="mt-1 font-heading text-2xl font-medium tracking-tight text-primary sm:text-3xl">
            {productName}
          </h1>
          {description ? (
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 pt-1 sm:justify-end">
          <StatusBadge label={statusLabel} tone={statusTone} />
          <StatusBadge label={completionLabel} tone={completionTone} />
        </div>
      </div>

      {/* Régua de 4 Métricas Rápidas */}
      <section
        aria-label="Régua de métricas do processo"
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        {/* Card 1: Valor Estimado */}
        <div className="surface-card flex flex-col justify-between p-3.5 sm:p-4">
          <p className="text-xs font-medium text-muted-foreground">Valor Estimado</p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-foreground">
            {initialValue != null ? formatCurrency(initialValue) : "A definir"}
          </p>
        </div>

        {/* Card 2: Quantidade */}
        <div className="surface-card flex flex-col justify-between p-3.5 sm:p-4">
          <p className="text-xs font-medium text-muted-foreground">Quantidade</p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-foreground">
            {quantity > 0 ? quantity : "—"}
          </p>
        </div>

        {/* Card 3: Conformidade Documental */}
        <div className="surface-card flex flex-col justify-between p-3.5 sm:p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Conformidade Documental</p>
          </div>
          <div>
            <p className="mt-1 text-lg font-semibold tracking-tight text-foreground">
              {validTypesCount}/{totalTypesCount} ({displayPercent}%)
            </p>
            <div
              role="progressbar"
              aria-valuenow={clampedPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progresso documental"
              className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted"
            >
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${clampedPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Status de Liberação */}
        <div className="surface-card flex flex-col justify-between p-3.5 sm:p-4">
          <p className="text-xs font-medium text-muted-foreground">Status de Liberação</p>
          <div className="mt-1">
            <span className="inline-flex items-center rounded-full border border-border/80 bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-foreground">
              {releaseStatusText}
            </span>
          </div>
        </div>
      </section>
    </header>
  );
}
