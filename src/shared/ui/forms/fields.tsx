"use client";

import { Input } from "@/components/ui/input";
import { FormField, SelectControl, TextareaControl } from "@/shared/ui/form-field";

interface BaseFieldProps {
  name: string;
  label: string;
  errors?: string[];
  hint?: string;
  required?: boolean;
}

export function TextField({
  name,
  label,
  errors,
  hint,
  required,
  type = "text",
  defaultValue,
  placeholder,
  step,
  min,
  inputMode,
}: BaseFieldProps & { type?: string; defaultValue?: string; placeholder?: string; step?: string; min?: string; inputMode?: "decimal" | "numeric" | "text" | "tel" | "email" }) {
  return (
    <FormField label={label} errors={errors} hint={hint} required={required}>
      {(p) => (
        <Input
          {...p}
          name={name}
          type={type}
          required={required}
          defaultValue={defaultValue}
          placeholder={placeholder}
          step={step}
          min={min}
          inputMode={inputMode}
        />
      )}
    </FormField>
  );
}

export function SelectField({
  name,
  label,
  errors,
  hint,
  required,
  options,
  placeholder = "Selecione…",
  defaultValue = "",
  optional = false,
}: BaseFieldProps & { options: { value: string; label: string }[]; placeholder?: string; defaultValue?: string; optional?: boolean }) {
  return (
    <FormField label={label} errors={errors} hint={hint} required={required}>
      {(p) => (
        <SelectControl {...p} name={name} required={required} defaultValue={defaultValue}>
          <option value="" disabled={!optional}>{placeholder}</option>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </SelectControl>
      )}
    </FormField>
  );
}

export function TextAreaField({ name, label, errors, hint, required, defaultValue }: BaseFieldProps & { defaultValue?: string }) {
  return (
    <FormField label={label} errors={errors} hint={hint} required={required}>
      {(p) => <TextareaControl {...p} name={name} required={required} defaultValue={defaultValue} />}
    </FormField>
  );
}
