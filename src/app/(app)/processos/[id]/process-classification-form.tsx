"use client";

import { classifyProcessFormAction } from "@/modules/processes/actions";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { SelectField, TextField } from "@/shared/ui/forms/fields";

export function ProcessClassificationForm({ processId, responsibleId, processType, people }: {
  processId: string;
  responsibleId: string | null;
  processType: string | null;
  people: { value: string; label: string }[];
}) {
  return <ActionForm action={classifyProcessFormAction} submitLabel="Salvar responsável e tipo" hiddenFields={{ processId }}>
    {(errors) => <>
      <SelectField name="responsibleId" label="Responsável atribuído" optional placeholder="Não atribuído" defaultValue={responsibleId ?? ""} options={people} errors={errors.responsibleId} />
      <TextField name="processType" label="Tipo de processo" defaultValue={processType ?? ""} errors={errors.processType} />
    </>}
  </ActionForm>;
}
