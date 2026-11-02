"use client";

import { createMaterialFormAction } from "@/modules/inventory/actions";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { TextField } from "@/shared/ui/forms/fields";

export function NewMaterialForm() {
  return (
    <ActionForm action={createMaterialFormAction} submitLabel="Cadastrar material">
      {(e) => (<>
        <TextField name="code" label="Código" required errors={e.code} />
        <TextField name="name" label="Nome" required errors={e.name} />
        <TextField name="unit" label="Unidade (ex.: un, resma)" required errors={e.unit} />
      </>)}
    </ActionForm>
  );
}
