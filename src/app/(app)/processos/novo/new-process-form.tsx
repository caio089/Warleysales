"use client";

import { useState } from "react";
import { createProcessFormAction } from "@/modules/processes/actions";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { SelectField, TextField } from "@/shared/ui/forms/fields";

export function NewProcessForm({ councils, people = [] }: { councils: { value: string; label: string }[]; people?: { value: string; label: string; councilId: string }[] }) {
  const [councilId, setCouncilId] = useState(councils[0]?.value ?? "");
  return (
    <ActionForm action={createProcessFormAction} submitLabel="Criar processo">
      {(e) => (
        <>
          <SelectField name="councilId" label="Órgão" required options={councils} defaultValue={councilId} onChange={setCouncilId} errors={e.councilId} />
          <TextField name="number" label="Número do processo" required placeholder="001/2026" errors={e.number} />
          <TextField name="title" label="Objeto / título" required errors={e.title} />
          <SelectField key={councilId} name="responsibleId" label="Responsável atribuído" optional placeholder="Não atribuído" options={people.filter((person) => person.councilId === councilId)} errors={e.responsibleId} />
          <TextField name="processType" label="Tipo de processo" errors={e.processType} />
        </>
      )}
    </ActionForm>
  );
}
