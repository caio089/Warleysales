"use client";

import { useMemo, useState } from "react";
import { formatCurrency } from "@/shared/lib/format";
import { parseCurrencyInput } from "@/shared/lib/money-input";
import { FormField } from "@/shared/ui/form-field";
import { CurrencyInput } from "@/shared/ui/forms/currency-input";

export type AtaMaterialLine = {
  materialId: string;
  name: string;
  quantity: number;
};

function parseMoney(draft: string): number {
  const parsed = parseCurrencyInput(draft);
  if (parsed == null || parsed === "") return 0;
  const value = Number(parsed);
  return Number.isFinite(value) ? value : 0;
}

/** Materiais da ata com valor total por item e unitário (total ÷ qtd) ao vivo. */
export function AtaMaterialsValues({
  lines,
  councilLabel,
  processLabel,
  defaultTotal,
  errors = {},
}: {
  lines: AtaMaterialLine[];
  councilLabel: string;
  processLabel: string;
  defaultTotal?: number | null;
  errors?: Record<string, string[]>;
}) {
  const [drafts, setDrafts] = useState(() =>
    lines.map((line, index) => {
      if (lines.length === 1 && defaultTotal != null) return defaultTotal.toFixed(2);
      if (defaultTotal != null && lines.length > 1) {
        const sumQty = lines.reduce((total, item) => total + item.quantity, 0);
        if (sumQty <= 0) return "";
        const share = (defaultTotal * line.quantity) / sumQty;
        return share.toFixed(2);
      }
      return index === 0 && defaultTotal != null ? defaultTotal.toFixed(2) : "";
    }),
  );

  const computed = useMemo(
    () =>
      lines.map((line, index) => {
        const lineTotal = parseMoney(drafts[index] ?? "");
        const unit = line.quantity > 0 ? lineTotal / line.quantity : 0;
        return {
          lineTotal,
          unit: Math.round(unit * 100) / 100,
        };
      }),
    [drafts, lines],
  );

  const grandTotal = Math.round(computed.reduce((sum, row) => sum + row.lineTotal, 0) * 100) / 100;

  return (
    <div className="space-y-3 rounded-xl border border-border/70 bg-card p-4">
      <div>
        <p className="text-sm font-semibold text-foreground">2. Materiais e valores</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Informe o valor total de cada item. O unitário é total ÷ quantidade.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {councilLabel} · {processLabel}
        </p>
      </div>

      <ul className="space-y-3">
        {lines.map((line, index) => {
          const row = computed[index]!;
          return (
            <li
              key={`${line.materialId}-${line.name}-${index}`}
              className="overflow-hidden rounded-2xl border border-border/60 bg-muted/20"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 px-3.5 py-2.5">
                <p className="min-w-0 text-sm font-medium text-foreground">{line.name}</p>
                <span className="inline-flex items-center rounded-full bg-background px-2.5 py-0.5 text-xs font-semibold tabular-nums text-muted-foreground ring-1 ring-border/70">
                  Qtd {line.quantity}
                </span>
              </div>

              <div className="grid gap-3 p-3.5 sm:grid-cols-2">
                <FormField
                  label="Valor total do item"
                  required
                  errors={errors[`items.${index}.lineTotal`] ?? errors[`items.${index}.unitPrice`]}
                >
                  {(props) => (
                    <CurrencyInput
                      {...props}
                      name={`items.${index}.lineTotal`}
                      value={drafts[index] ?? ""}
                      onValueChange={(next) => {
                        setDrafts((current) => {
                          const copy = [...current];
                          copy[index] = next;
                          return copy;
                        });
                      }}
                    />
                  )}
                </FormField>

                <div className="flex flex-col justify-end rounded-xl border border-primary/15 bg-primary/5 px-3 py-2.5">
                  <p className="text-[0.68rem] font-medium uppercase tracking-wide text-muted-foreground">
                    Valor unitário
                  </p>
                  <p className="mt-0.5 text-lg font-semibold tabular-nums text-primary">
                    {formatCurrency(row.unit)}
                  </p>
                  <p className="text-[0.7rem] text-muted-foreground">
                    {formatCurrency(row.lineTotal)} ÷ {line.quantity}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-3">
        <span className="text-sm font-medium text-foreground">Total da ata</span>
        <span className="text-base font-semibold tabular-nums text-primary">
          {formatCurrency(grandTotal)}
        </span>
      </div>
    </div>
  );
}
