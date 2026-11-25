"use client";

import { useState } from "react";
import { computeInitialEndDate } from "@/modules/atas/domain/validity";
import {
  formatDateOnly,
  maskBrDateInput,
  parseBrDateOnly,
  toFortalezaDate,
} from "@/shared/lib/time";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function firstDayOfMonth(date: string): string {
  return `${date.slice(0, 8)}01`;
}

/** Campo único de início da vigência; o fim (+1 ano) é só leitura. */
export function AtaValidityField({
  errors,
  defaultStartDate,
  fieldName = "startDate",
  endFieldName,
  label = "Início da vigência",
  hint = "Um campo só. O fim de 1 ano aparece abaixo automaticamente (art. 84, Lei 14.133/2021).",
  showEndPreview = true,
}: {
  errors?: string[];
  defaultStartDate?: string;
  fieldName?: string;
  /** Se informado, envia também o fim (início + 1 ano) no formulário. */
  endFieldName?: string;
  label?: string;
  hint?: string;
  showEndPreview?: boolean;
}) {
  const today = toFortalezaDate(new Date());
  const initial =
    defaultStartDate && /^\d{4}-\d{2}-\d{2}$/.test(defaultStartDate) ? defaultStartDate : today;
  const [startDate, setStartDate] = useState(initial);
  const [brValue, setBrValue] = useState(formatDateOnly(initial));
  const endDate = computeInitialEndDate(startDate);

  function applyStart(next: string) {
    setStartDate(next);
    setBrValue(formatDateOnly(next));
  }

  function onBrChange(raw: string) {
    const masked = maskBrDateInput(raw);
    setBrValue(masked);
    const parsed = parseBrDateOnly(masked);
    if (parsed) setStartDate(parsed);
  }

  return (
    <div className="space-y-3 rounded-xl border border-border/70 bg-muted/10 p-4">
      <FormField label={label} required errors={errors} hint={hint}>
        {(props) => (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Atalhos de vigência">
              <QuickDateButton
                label="Padrão 1 ano (hoje)"
                active={startDate === today}
                onClick={() => applyStart(today)}
              />
              <QuickDateButton
                label="1º deste mês"
                active={startDate === firstDayOfMonth(today)}
                onClick={() => applyStart(firstDayOfMonth(today))}
              />
            </div>
            <Input
              {...props}
              inputMode="numeric"
              autoComplete="off"
              placeholder="DD/MM/AAAA"
              value={brValue}
              onChange={(event) => onBrChange(event.target.value)}
              aria-label="Início da vigência"
              className="max-w-xs"
            />
            <input type="hidden" name={fieldName} value={startDate} />
            {endFieldName ? <input type="hidden" name={endFieldName} value={endDate} /> : null}
          </div>
        )}
      </FormField>

      {showEndPreview ? (
        <p className="rounded-lg border border-primary/15 bg-primary/5 px-3 py-2.5 text-sm text-foreground">
          Vigência:{" "}
          <strong className="tabular-nums">{formatDateOnly(startDate)}</strong>
          {" → "}
          <strong className="tabular-nums text-primary">{formatDateOnly(endDate)}</strong>
          <span className="text-muted-foreground"> · 1 ano (calculado)</span>
        </p>
      ) : null}
    </div>
  );
}

function QuickDateButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted/40",
      )}
    >
      {label}
    </button>
  );
}
