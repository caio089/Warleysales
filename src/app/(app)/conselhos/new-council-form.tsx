"use client";

import { createCouncilFormAction } from "@/modules/identity/council-actions";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { TextAreaField, TextField } from "@/shared/ui/forms/fields";

export function NewCouncilForm() {
  return (
    <ActionForm action={createCouncilFormAction} submitLabel="Criar conselho">
      {(e) => (
        <>
          <TextField name="name" label="Nome" required errors={e.name} />
          <TextField name="acronym" label="Sigla" required errors={e.acronym} />
          <TextAreaField name="institutionalInfo" label="Informações institucionais" errors={e.institutionalInfo} />
        </>
      )}
    </ActionForm>
  );
}
