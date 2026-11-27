"use client";

import { useMemo, useState } from "react";
import { formatCurrency } from "@/shared/lib/format";
import { parseCurrencyInput } from "@/shared/lib/money-input";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/components/ui/input";

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

function buildDrafts(
  lines: AtaMaterialLine[],
  defaultTotal?: number | null,
  defaultLineTotals?: Array<number | null | undefined>,
): string[] {
  return lines.map((line, index) => {
    const fromPdf = defaultLineTotals?.[index];
    if (fromPdf != null && Number.isFinite(fromPdf) && line.quantity > 0) return (Number(fromPdf) / line.quantity).toFixed(2).replace(".", ",");
    if (lines.length === 1 && defaultTotal != null && line.quantity > 0) return (defaultTotal / line.quantity).toFixed(2).replace(".", ",");
    if (defaultTotal != null && lines.length > 1) {
      const sumQty = lines.reduce((total, item) => total + item.quantity, 0);
      if (sumQty <= 0) return "";
      return (defaultTotal / sumQty).toFixed(2).replace(".", ",");
    }
    return "";
  });
}

/** Valor unitário por material e valor total da ata calculado ao vivo. */
export function AtaMaterialsValues({
  lines,
  councilLabel,
  processLabel,
  defaultTotal,
  defaultLineTotals,
  editableQuantity = false,
  errors = {},
}: {
  lines: AtaMaterialLine[];
  councilLabel: string;
  processLabel: string;
  defaultTotal?: number | null;
  /** Totais por linha (ex.: lidos do PDF). Tem prioridade sobre rateio do defaultTotal. */
  defaultLineTotals?: Array<number | null | undefined>;
  editableQuantity?: boolean;
  errors?: Record<string, string[]>;
}) {
  const [drafts, setDrafts] = useState(() => buildDrafts(lines, defaultTotal, defaultLineTotals));

  const [quantities, setQuantities] = useState(() => lines.map((line) => String(line.quantity).replace(".", ",")));
  const computed = useMemo(
    () =>
      lines.map((line, index) => {
        const unit = parseMoney(drafts[index] ?? "");
        const quantity = editableQuantity ? Number(quantities[index]?.replace(",", ".")) || 0 : line.quantity;
        const lineTotal = Math.round(unit * quantity * 100) / 100;
        return {
          lineTotal,
          unit, quantity,
        };
      }),
    [drafts, lines, editableQuantity, quantities],
  );

  const grandTotal = Math.round(computed.reduce((sum, row) => sum + row.lineTotal, 0) * 100) / 100;

  return (
    <div className="space-y-3 rounded-xl border border-border/70 bg-card p-4">
      <div>
        <p className="text-sm font-semibold text-foreground">2. Materiais e valores</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Informe o valor unitário de cada material. O valor total da ata é calculado automaticamente.
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
                  Qtd {row.quantity}
                </span>
              </div>

              <div className="grid gap-3 p-3.5 sm:grid-cols-2">
                {editableQuantity && <Input name={`items.${index}.description`} aria-label="Descrição do item" defaultValue={line.name} required />}
                {editableQuantity && <FormField label="Quantidade registrada" required>
                  {(props) => <Input {...props} name={`items.${index}.registeredQuantity`} inputMode="decimal" required value={quantities[index] ?? ""}
                    onChange={(event) => {
                      const next = event.currentTarget.value;
                      setQuantities((values) => values.map((value, i) => i === index ? next : value));
                    }} />}
                </FormField>}
                <FormField
                  label="Valor unitário"
                  required
                  errors={errors[`items.${index}.unitPrice`]}
                >
                  {(props) => (
                    <Input
                      {...props}
                      name={`items.${index}.unitPrice`}
                      placeholder="0,00"
                      required
                      type="text" inputMode="decimal"
                      value={drafts[index] ?? ""}
                      onChange={(event) => {
                        const next = event.currentTarget.value;
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
                    Subtotal
                  </p>
                  <p className="mt-0.5 text-lg font-semibold tabular-nums text-primary">
                    {formatCurrency(row.lineTotal)}
                  </p>
                  <p className="text-[0.7rem] text-muted-foreground">
                    {formatCurrency(row.unit)} × {row.quantity}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-3">
        <span className="text-sm font-medium text-foreground">Valor total da ata</span>
        <span className="text-base font-semibold tabular-nums text-primary">
          {formatCurrency(grandTotal)}
        </span>
      </div>
    </div>
  );
}
