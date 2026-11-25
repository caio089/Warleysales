"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { formatCurrencyDraft, parseCurrencyInput, updateCurrencyDraft } from "@/shared/lib/money-input";

type CurrencyInputProps = Omit<ComponentProps<typeof Input>, "type" | "inputMode" | "value" | "defaultValue" | "onChange" | "onPaste" | "min" | "max" | "step" | "ref"> & {
  name: string;
  defaultValue?: number | string | null;
  value?: string;
  onValueChange?: (value: string) => void;
};

export function CurrencyInput({ name, defaultValue, value, onValueChange, disabled, readOnly, className, ...props }: CurrencyInputProps) {
  const initial = defaultValue == null ? "" : String(defaultValue);
  const [draft, setDraft] = useState(initial);
  const inputRef = useRef<HTMLInputElement>(null);
  const current = value ?? draft;
  const commit = (next: string) => {
    if (value === undefined) setDraft(next);
    onValueChange?.(next);
  };

  useEffect(() => {
    const form = inputRef.current?.form;
    if (!form || value !== undefined) return;
    const reset = () => setDraft(initial);
    form.addEventListener("reset", reset);
    return () => form.removeEventListener("reset", reset);
  }, [initial, value]);

  return (
    <div className="relative">
      <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">R$</span>
      <Input
        {...props}
        ref={inputRef}
        type="text"
        inputMode="decimal"
        className={`pl-10 ${className ?? ""}`}
        disabled={disabled}
        readOnly={readOnly}
        pattern={String.raw`\d[\d.]*(,\d{0,2})?`}
        title="Informe um valor em reais maior ou igual a zero, com até duas casas decimais."
        value={formatCurrencyDraft(current)}
        onChange={(event) => {
          const input = event.currentTarget;
          const caret = input.selectionStart ?? input.value.length;
          const { inputType } = event.nativeEvent as InputEvent;
          // Ponto do teclado/numpad vira vírgula de centavos (ex.: 10.000,50).
          const next = updateCurrencyDraft(current, input.value, caret, inputType);
          if (!next) {
            input.value = formatCurrencyDraft(current);
            input.setSelectionRange(Math.max(0, caret - 1), Math.max(0, caret - 1));
            return;
          }
          input.value = next.display;
          input.setSelectionRange(next.caret, next.caret);
          commit(next.value);
        }}
        onPaste={(event) => {
          event.preventDefault();
          const pasted = parseCurrencyInput(event.clipboardData.getData("text"));
          if (pasted == null) return;
          const input = event.currentTarget;
          const start = input.selectionStart ?? input.value.length;
          const end = input.selectionEnd ?? start;
          const inserted = pasted.replace(".", ",");
          const next = updateCurrencyDraft(current, input.value.slice(0, start) + inserted + input.value.slice(end), start + inserted.length);
          if (!next) return;
          input.value = next.display;
          input.setSelectionRange(next.caret, next.caret);
          commit(next.value);
        }}
      />
      <input type="hidden" name={name} value={current.replace(/\.$/, "")} disabled={disabled} form={props.form} />
    </div>
  );
}
