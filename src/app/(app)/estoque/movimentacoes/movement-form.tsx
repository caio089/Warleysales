"use client";

import { registerMovementFormAction } from "@/modules/inventory/actions";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { SelectField, TextField } from "@/shared/ui/forms/fields";

const MOVE_TYPES = [
  { value: "entry", label: "Entrada" },
  { value: "consumption", label: "Consumo" },
];
const ADJUST_TYPES = [
  { value: "adjustment_in", label: "Ajuste positivo (gestor)" },
  { value: "adjustment_out", label: "Ajuste negativo (gestor)" },
];

interface MovementFormProps {
  councils: { value: string; label: string }[];
  materials: { value: string; label: string }[];
  /** Na tela de estoque o padrão é entrada, para informar quantidade no saldo. */
  defaultType?: "entry" | "consumption" | "adjustment_in" | "adjustment_out";
  allowAdjust?: boolean;
}

export function MovementForm({ councils, materials, defaultType, allowAdjust = false }: MovementFormProps) {
  const defaultCouncilId = councils.length === 1 ? councils[0]!.value : "";
  const defaultMaterialId = materials.length === 1 ? materials[0]!.value : "";
  const types = allowAdjust ? [...MOVE_TYPES, ...ADJUST_TYPES] : MOVE_TYPES;

  return (
    <ActionForm action={registerMovementFormAction} submitLabel="Registrar quantidade" idempotencyField="idempotencyKey">
      {(e) => (
        <>
          <SelectField name="councilId" label="Conselho" required options={councils} defaultValue={defaultCouncilId} errors={e.councilId} />
          <SelectField name="materialId" label="Material" required options={materials} defaultValue={defaultMaterialId} errors={e.materialId} />
          <SelectField name="type" label="Tipo" required options={types} defaultValue={defaultType ?? ""} errors={e.type} />
          <TextField
            name="quantity"
            label="Quantidade"
            type="text"
            inputMode="decimal"
            placeholder="Ex.: 10"
            required
            hint="Use vírgula ou ponto. Precisa ser maior que zero."
            errors={e.quantity}
          />
          <TextField name="reason" label="Motivo" required placeholder="Ex.: entrada inicial, compra, inventário" errors={e.reason} />
        </>
      )}
    </ActionForm>
  );
}
