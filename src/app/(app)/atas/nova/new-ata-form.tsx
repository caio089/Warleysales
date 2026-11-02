"use client";

import { createAtaFormAction } from "@/modules/atas/actions";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { SelectField, TextField } from "@/shared/ui/forms/fields";

export function NewAtaForm({
  councils,
  materials,
}: {
  councils: { value: string; label: string }[];
  materials: { value: string; label: string }[];
}) {
  return (
    <ActionForm action={createAtaFormAction} submitLabel="Criar ata">
      {(e) => (<>
        <SelectField name="councilId" label="Conselho gerenciador" required options={councils} errors={e.councilId} />
        <TextField name="number" label="Número da ata" required errors={e.number} />
        <TextField name="startDate" label="Início da vigência" type="date" required hint="A vigência inicial é de 1 ano (art. 84, Lei 14.133/2021). Não há prorrogação automática." errors={e.startDate} />
        <TextField name="description" label="Descrição do item" required errors={e["items.0.description"]} />
        <SelectField name="materialId" label="Material (opcional)" options={materials} optional placeholder="Sem material" errors={e["items.0.materialId"]} />
        <TextField name="registeredQuantity" label="Quantidade registrada" type="number" step="0.001" min="0" required errors={e["items.0.registeredQuantity"]} />
        <TextField name="unitPrice" label="Preço unitário (R$)" type="number" step="0.01" min="0" required errors={e["items.0.unitPrice"]} />
      </>)}
    </ActionForm>
  );
}
