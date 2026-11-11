"use client";

import { useState } from "react";
import { createContractFormAction } from "@/modules/contracts/actions";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { SelectField, TextField } from "@/shared/ui/forms/fields";

type Option = { value: string; label: string };
type ProcessOption = Option & { councilId: string };

export function NewContractForm({
  councils,
  processes,
  defaultProcessId = "",
}: {
  councils: Option[];
  processes: ProcessOption[];
  defaultProcessId?: string;
}) {
  const initial = processes.find((process) => process.value === defaultProcessId);
  const [councilId, setCouncilId] = useState(initial?.councilId ?? "");
  const visibleProcesses = processes.filter((process) => !councilId || process.councilId === councilId);
  return (
    <ActionForm action={createContractFormAction} submitLabel="Cadastrar contrato">
      {(e) => (<>
        <SelectField name="councilId" label="Conselho" required options={councils} defaultValue={councilId} errors={e.councilId} onChange={setCouncilId} />
        <SelectField key={`${councilId || "todos"}-${defaultProcessId}`} name="processId" label="Processo" options={visibleProcesses} optional placeholder="Sem processo" defaultValue={visibleProcesses.some((process) => process.value === defaultProcessId) ? defaultProcessId : ""} hint="Use o mesmo processo da ata para os dois ficarem ligados." errors={e.processId} />
        <TextField name="number" label="Número" required errors={e.number} />
        <TextField name="object" label="Objeto" required errors={e.object} />
        <TextField name="startDate" label="Início" type="date" required errors={e.startDate} />
        <TextField name="endDate" label="Fim" type="date" required errors={e.endDate} />
        <TextField name="value" label="Valor (R$)" type="number" step="0.01" min="0" errors={e.value} />
      </>)}
    </ActionForm>
  );
}
