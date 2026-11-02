"use client";

import { registerMovementFormAction } from "@/modules/inventory/actions";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { SelectField, TextField } from "@/shared/ui/forms/fields";

const TYPES = [
  { value: "entry", label: "Entrada" }, { value: "consumption", label: "Consumo" },
  { value: "adjustment_in", label: "Ajuste positivo (gestor)" }, { value: "adjustment_out", label: "Ajuste negativo (gestor)" },
];

export function MovementForm({ councils, materials }: { councils: { value: string; label: string }[]; materials: { value: string; label: string }[] }) {
  return (
    <ActionForm action={registerMovementFormAction} submitLabel="Registrar" idempotencyField="idempotencyKey">
      {(e) => (<>
        <SelectField name="councilId" label="Conselho" required options={councils} errors={e.councilId} />
        <SelectField name="materialId" label="Material" required options={materials} errors={e.materialId} />
        <SelectField name="type" label="Tipo" required options={TYPES} errors={e.type} />
        <TextField name="quantity" label="Quantidade" type="number" step="0.001" min="0" required errors={e.quantity} />
        <TextField name="reason" label="Motivo" required errors={e.reason} />
      </>)}
    </ActionForm>
  );
}
