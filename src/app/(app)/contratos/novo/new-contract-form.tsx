"use client";

import { createContractFormAction } from "@/modules/contracts/actions";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { SelectField, TextField } from "@/shared/ui/forms/fields";

export function NewContractForm({ councils }: { councils: { value: string; label: string }[] }) {
  return (
    <ActionForm action={createContractFormAction} submitLabel="Cadastrar contrato">
      {(e) => (<>
        <SelectField name="councilId" label="Conselho" required options={councils} errors={e.councilId} />
        <TextField name="number" label="Número" required errors={e.number} />
        <TextField name="object" label="Objeto" required errors={e.object} />
        <TextField name="startDate" label="Início" type="date" required errors={e.startDate} />
        <TextField name="endDate" label="Fim" type="date" required errors={e.endDate} />
        <TextField name="value" label="Valor (R$)" type="number" step="0.01" min="0" errors={e.value} />
      </>)}
    </ActionForm>
  );
}
