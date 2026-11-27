import { calculateSavings } from "@/modules/formalizations/domain/formalization";
import { formatCurrency, formatPercent } from "@/shared/lib/format";

export function SavingsPanel({ estimatedNum, contractedNum, live = false }: {
  estimatedNum: number;
  contractedNum: number;
  live?: boolean;
}) {
  const hasValues = estimatedNum > 0 && contractedNum >= 0;
  const { savingsValue, savingsPercent } = hasValues
    ? calculateSavings(estimatedNum, contractedNum)
    : { savingsValue: 0, savingsPercent: 0 };

  return (
    <div
      className={`rounded-xl border p-4 sm:p-5 transition-all ${
        savingsValue > 0
          ? "border-emerald-500/40 bg-emerald-500/10 dark:border-emerald-500/30 dark:bg-emerald-950/20"
          : savingsValue < 0
            ? "border-destructive/30 bg-destructive/5"
            : "border-border/80 bg-secondary/30"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
          {live ? "Cálculo de Economia em Tempo Real" : "Cálculo da economia gerada"}
        </span>
        {hasValues ? (
          savingsValue > 0 ? (
            <span className="inline-flex items-center rounded-full border border-emerald-600/30 bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
              +{formatPercent(savingsPercent)} de economia
            </span>
          ) : savingsValue < 0 ? (
            <span className="inline-flex items-center rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-0.5 text-xs font-bold text-destructive">
              Acréscimo de {formatPercent(Math.abs(savingsPercent))}
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              0,00% (Sem variação)
            </span>
          )
        ) : (
          <span className="text-xs text-muted-foreground">Aguardando valores</span>
        )}
      </div>

      {hasValues ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-1">
          <div className="rounded-lg bg-background/60 p-2.5 border border-border/40">
            <p className="text-[0.7rem] text-muted-foreground uppercase font-medium">Valor Estimado</p>
            <p className="text-base font-semibold text-foreground mt-0.5">
              {formatCurrency(estimatedNum)}
            </p>
          </div>
          <div className="rounded-lg bg-background/60 p-2.5 border border-border/40">
            <p className="text-[0.7rem] text-muted-foreground uppercase font-medium">Valor Contratado</p>
            <p className="text-base font-semibold text-foreground mt-0.5">
              {formatCurrency(contractedNum)}
            </p>
          </div>
          <div
            className={`rounded-lg p-2.5 border ${
              savingsValue > 0
                ? "border-emerald-500/40 bg-emerald-500/15"
                : savingsValue < 0
                  ? "border-destructive/30 bg-destructive/10"
                  : "border-border/40 bg-background/60"
            }`}
          >
            <p
              className={`text-[0.7rem] uppercase font-semibold ${
                savingsValue > 0
                  ? "text-emerald-800 dark:text-emerald-300"
                  : savingsValue < 0
                    ? "text-destructive"
                    : "text-muted-foreground"
              }`}
            >
              Economia Gerada
            </p>
            <p
              className={`text-base font-bold mt-0.5 ${
                savingsValue > 0
                  ? "text-emerald-700 dark:text-emerald-400"
                  : savingsValue < 0
                    ? "text-destructive"
                    : "text-foreground"
              }`}
            >
              {formatCurrency(savingsValue)}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          {live ? "Informe o valor estimado e o valor contratado." : "Valor de referência indisponível para calcular a economia."}
        </p>
      )}

      {savingsValue < 0 ? (
        <p className="mt-2 text-xs font-medium text-destructive">
          Atenção: O valor contratado é superior ao valor estimado inicialmente.
        </p>
      ) : null}
    </div>
  );
}
