"use client";

import { useMemo, useState } from "react";
import { saveProcessPriceResearch } from "@/modules/processes/price-research-action";
import {
  sumPriceResearchLines,
  type PriceResearchItemInput,
  type PriceResearchLine,
} from "@/modules/processes/price-research";
import { formatCurrency } from "@/shared/lib/format";
import { parseCurrencyInput } from "@/shared/lib/money-input";
import { FormField } from "@/shared/ui/form-field";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { CurrencyInput } from "@/shared/ui/forms/currency-input";

function buildInitialDrafts(
  items: PriceResearchItemInput[],
  savedLines: PriceResearchLine[] | null | undefined,
  estimatedValue: number | null | undefined,
): string[] {
  return items.map((item) => {
    const saved = savedLines?.find((line) => line.materialId === item.materialId);
    if (saved != null) return saved.lineTotal.toFixed(2);
    if (items.length === 1 && estimatedValue != null) return estimatedValue.toFixed(2);
    return "";
  });
}

/** Pesquisa de preços: valor de referência por item e soma automática do total. */
export function PriceResearchForm({
  processId,
  items,
  savedLines,
  estimatedValue,
}: {
  processId: string;
  items: PriceResearchItemInput[];
  savedLines?: PriceResearchLine[] | null;
  estimatedValue?: number | null;
}) {
  const [drafts, setDrafts] = useState(() => buildInitialDrafts(items, savedLines, estimatedValue));

  const grandTotal = useMemo(() => {
    const lines = drafts.map((draft) => {
      const parsed = parseCurrencyInput(draft);
      if (parsed == null || parsed === "") return 0;
      const value = Number(parsed);
      return Number.isFinite(value) ? value : 0;
    });
    return sumPriceResearchLines(lines.map((lineTotal) => ({ lineTotal })));
  }, [drafts]);

  return (
    <ActionForm
      action={saveProcessPriceResearch}
      submitLabel="Salvar pesquisa de preços"
      hiddenFields={{
        processId,
        itemCount: String(items.length),
        ...Object.fromEntries(
          items.flatMap((item, index) => [
            [`lines.${index}.materialId`, item.materialId],
            [`lines.${index}.name`, item.name],
            [`lines.${index}.quantity`, String(item.quantity)],
          ]),
        ),
      }}
      resetOnSuccess={false}
      submitVariant="outline"
    >
      {(errors) => (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Informe o valor total de referência de cada item (já com a quantidade). O sistema soma o total estimado.
          </p>
          <ul className="space-y-3">
            {items.map((item, index) => (
              <li
                key={`${item.materialId}-${index}`}
                className="rounded-xl border border-border/70 bg-muted/15 px-3 py-3"
              >
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                  <p className="text-xs tabular-nums text-muted-foreground">
                    Quantidade: {item.quantity}
                  </p>
                </div>
                <FormField
                  label="Valor de referência do item (R$)"
                  required
                  errors={errors[`lines.${index}.lineTotal`]}
                >
                  {(props) => (
                    <CurrencyInput
                      {...props}
                      name={`lines.${index}.lineTotal`}
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
              </li>
            ))}
          </ul>

          <p className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 text-sm text-foreground">
            Valor total estimado:{" "}
            <strong className="tabular-nums text-primary">{formatCurrency(grandTotal)}</strong>
          </p>
        </div>
      )}
    </ActionForm>
  );
}

/** Somente leitura: lista os itens e o total já gravado. */
export function PriceResearchSummary({
  items,
  savedLines,
  estimatedValue,
}: {
  items: PriceResearchItemInput[];
  savedLines?: PriceResearchLine[] | null;
  estimatedValue?: number | null;
}) {
  const lines =
    savedLines && savedLines.length > 0
      ? savedLines
      : items.length === 1 && estimatedValue != null
        ? [{ ...items[0]!, lineTotal: estimatedValue }]
        : [];

  if (lines.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Valor estimado: {estimatedValue == null ? "A definir" : formatCurrency(estimatedValue)}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <ul className="space-y-1.5 text-sm">
        {lines.map((line) => (
          <li key={`${line.materialId}-${line.name}`} className="flex justify-between gap-3">
            <span className="min-w-0 truncate text-foreground">
              {line.name}{" "}
              <span className="text-muted-foreground">· qtd {line.quantity}</span>
            </span>
            <span className="shrink-0 tabular-nums font-medium">{formatCurrency(line.lineTotal)}</span>
          </li>
        ))}
      </ul>
      <p className="text-sm font-medium text-foreground">
        Total:{" "}
        <span className="tabular-nums text-primary">
          {formatCurrency(estimatedValue ?? sumPriceResearchLines(lines))}
        </span>
      </p>
    </div>
  );
}
