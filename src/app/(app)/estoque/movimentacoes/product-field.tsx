"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FormField } from "@/shared/ui/form-field";
import { exactProduct, filterProducts, type ProductOption } from "./product-search";

interface ProductFieldProps {
  options: ProductOption[];
  defaultValue?: string;
  errors?: string[];
  /** Nome do hidden com o id do material (suporta várias linhas: items.0.materialId). */
  name?: string;
  label?: string;
  required?: boolean;
}

/** Campo de produto: o usuário digita e escolhe um item da lista. */
export function ProductField({
  options,
  defaultValue = "",
  errors,
  name = "materialId",
  label = "Produto",
  required = true,
}: ProductFieldProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedIdRef = useRef(defaultValue);
  const initial = options.find((option) => option.value === defaultValue);
  const [query, setQuery] = useState(initial?.label ?? "");
  const [selectedId, setSelectedId] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);

  const matches = filterProducts(options, query);
  const shownErrors = localError ? [localError] : errors;

  function choose(option: ProductOption) {
    selectedIdRef.current = option.value;
    setSelectedId(option.value);
    setQuery(option.label);
    setOpen(false);
    setLocalError(null);
  }

  useEffect(() => {
    const form = rootRef.current?.closest("form");
    if (!form) return;

    const onReset = () => {
      selectedIdRef.current = defaultValue;
      setSelectedId(defaultValue);
      setQuery(initial?.label ?? "");
      setOpen(false);
      setLocalError(null);
    };
    const onSubmit = (event: Event) => {
      const input = rootRef.current?.querySelector("input[role='combobox']") as HTMLInputElement | null;
      const hidden = rootRef.current?.querySelector(`input[name="${name}"]`) as HTMLInputElement | null;
      const typed = exactProduct(options, input?.value ?? "");
      const materialId = selectedIdRef.current || typed?.value || "";
      if (materialId && hidden) {
        hidden.value = materialId;
        selectedIdRef.current = materialId;
        setSelectedId(materialId);
        if (typed) setQuery(typed.label);
        return;
      }
      if (!required && !(input?.value ?? "").trim()) {
        if (hidden) hidden.value = "";
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      setLocalError("Escolha um produto da lista.");
      setOpen(true);
    };

    form.addEventListener("reset", onReset);
    form.addEventListener("submit", onSubmit, true);
    return () => {
      form.removeEventListener("reset", onReset);
      form.removeEventListener("submit", onSubmit, true);
    };
  }, [defaultValue, initial?.label, name, options, required]);

  return (
    <div ref={rootRef}>
      <FormField
        label={label}
        required={required}
        errors={shownErrors}
        hint={shownErrors?.length ? undefined : "Digite o nome ou o código e escolha na lista."}
      >
        {(control) => (
          <div className="relative">
            <Input
              {...control}
              role="combobox"
              aria-expanded={open}
              aria-controls={listId}
              aria-autocomplete="list"
              autoComplete="off"
              placeholder="Digite para buscar…"
              value={query}
              onChange={(event) => {
                const next = event.target.value;
                setQuery(next);
                setOpen(true);
                setActiveIndex(0);
                const exact = exactProduct(options, next);
                selectedIdRef.current = exact?.value ?? "";
                setSelectedId(exact?.value ?? "");
                if (localError) setLocalError(null);
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => {
                window.setTimeout(() => setOpen(false), 120);
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setOpen(true);
                  setActiveIndex((index) => Math.min(index + 1, Math.max(matches.length - 1, 0)));
                }
                if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setActiveIndex((index) => Math.max(index - 1, 0));
                }
                if (event.key === "Enter" && open && matches[activeIndex]) {
                  event.preventDefault();
                  choose(matches[activeIndex]!);
                }
                if (event.key === "Escape") setOpen(false);
              }}
            />
            <input type="hidden" name={name} value={selectedId} />
            {open ? (
              <ul id={listId} role="listbox" className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-card py-1 shadow-md">
                {matches.length === 0 ? (
                  <li className="px-3 py-2 text-sm text-muted-foreground">Nenhum produto com esse texto.</li>
                ) : (
                  matches.map((option, index) => (
                    <li key={option.value} role="option" aria-selected={option.value === selectedId}>
                      <button
                        type="button"
                        className={cn(
                          "w-full px-3 py-2 text-left text-sm",
                          index === activeIndex ? "bg-secondary text-foreground" : "hover:bg-muted",
                        )}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => choose(option)}
                      >
                        {option.label}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            ) : null}
          </div>
        )}
      </FormField>
    </div>
  );
}
