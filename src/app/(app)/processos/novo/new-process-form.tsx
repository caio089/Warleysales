"use client";

import { createProcessFormAction } from "@/modules/processes/actions";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { SelectField, TextField } from "@/shared/ui/forms/fields";

export function NewProcessForm({ councils }: { councils: { value: string; label: string }[] }) {
  return (
    <ActionForm action={createProcessFormAction} submitLabel="Criar processo">
      {(e) => (
        <>
          <SelectField name="councilId" label="Conselho" required options={councils} errors={e.councilId} />
          <TextField name="number" label="Número do processo" required placeholder="001/2026" errors={e.number} />
          <TextField name="title" label="Objeto / título" required errors={e.title} />
        </>
      )}
    </ActionForm>
  );
}
