"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { registerMovementFormAction } from "@/modules/inventory/actions";
import { cn } from "@/lib/utils";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { SelectField, TextField } from "@/shared/ui/forms/fields";

const MOVE_TYPES = [
  { value: "entry", label: "Entrada", hint: "Soma no pronto para uso" },
  { value: "consumption", label: "Saída", hint: "Consome o saldo disponível" },
] as const;

const ADJUST_TYPES = [
  { value: "adjustment_in", label: "Ajuste +", hint: "Correção para cima" },
  { value: "adjustment_out", label: "Ajuste −", hint: "Correção para baixo" },
] as const;

type MovementType = (typeof MOVE_TYPES)[number]["value"] | (typeof ADJUST_TYPES)[number]["value"];

interface MovementFormProps {
  councils: { value: string; label: string }[];
  materials: { value: string; label: string }[];
  defaultType?: MovementType;
  allowAdjust?: boolean;
}

const SUBMIT_LABEL: Record<MovementType, string> = {
  entry: "Registrar entrada",
  consumption: "Registrar saída",
  adjustment_in: "Registrar ajuste",
  adjustment_out: "Registrar ajuste",
};

export function MovementForm({ councils, materials, defaultType = "entry", allowAdjust = false }: MovementFormProps) {
  const params = useSearchParams();
  const presetCouncil = params.get("council") ?? "";
  const presetMaterial = params.get("material") ?? "";
  const presetType = params.get("type");
  const initialType = (presetType && isMovementType(presetType) ? presetType : defaultType) as MovementType;
  const [type, setType] = useState<MovementType>(initialType);
  const councilId = presetCouncil || (councils.length === 1 ? councils[0]!.value : "");
  const materialId = presetMaterial || (materials.length === 1 ? materials[0]!.value : "");
  const choices = allowAdjust ? [...MOVE_TYPES, ...ADJUST_TYPES] : [...MOVE_TYPES];

  return (
    <ActionForm action={registerMovementFormAction} submitLabel={SUBMIT_LABEL[type]} idempotencyField="idempotencyKey">
      {(errors) => (
        <div className="space-y-4">
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-foreground">O que você quer lançar?</legend>
            <div className={cn("grid gap-2", allowAdjust ? "sm:grid-cols-4" : "sm:grid-cols-2")}>
              {choices.map((choice) => {
                const selected = type === choice.value;
                return (
                  <button
                    key={choice.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setType(choice.value)}
                    className={cn(
                      "rounded-xl border px-3 py-3 text-left transition-colors",
                      selected
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                    )}
                  >
                    <span className="block text-sm font-semibold">{choice.label}</span>
                    <span className="mt-0.5 block text-xs">{choice.hint}</span>
                  </button>
                );
              })}
            </div>
            <input type="hidden" name="type" value={type} />
            {errors.type?.[0] ? <p className="mt-1 text-xs text-destructive">{errors.type[0]}</p> : null}
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              key={`council-${councilId}`}
              name="councilId"
              label="Órgão"
              required
              options={councils}
              defaultValue={councilId}
              errors={errors.councilId}
            />
            <SelectField
              key={`material-${materialId}`}
              name="materialId"
              label="Produto"
              required
              options={materials}
              defaultValue={materialId}
              errors={errors.materialId}
            />
            <TextField
              name="quantity"
              label="Quantidade"
              type="text"
              inputMode="decimal"
              placeholder="Ex.: 10"
              required
              hint="Maior que zero. Vírgula ou ponto."
              errors={errors.quantity}
            />
            <TextField
              name="reason"
              label="Motivo"
              required
              placeholder="Ex.: compra, consumo da semana, inventário"
              errors={errors.reason}
            />
          </div>
        </div>
      )}
    </ActionForm>
  );
}

function isMovementType(value: string): value is MovementType {
  return (
    value === "entry" ||
    value === "consumption" ||
    value === "adjustment_in" ||
    value === "adjustment_out"
  );
}
