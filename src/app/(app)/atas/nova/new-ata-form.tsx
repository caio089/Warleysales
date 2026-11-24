"use client";

import { useState } from "react";
import { createAtaFormAction } from "@/modules/atas/actions";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { CurrencyField, SelectField, TextField } from "@/shared/ui/forms/fields";

type Option = { value: string; label: string };
type ProcessOption = Option & { councilId: string };

export function NewAtaForm({
  councils,
  materials,
  processes,
  defaultProcessId = "",
  lockedProcess,
}: {
  councils: Option[];
  materials: Option[];
  processes: ProcessOption[];
  defaultProcessId?: string;
  /** Dentro do processo, órgão e pasta já estão definidos. */
  lockedProcess?: { councilId: string; councilLabel: string; processId: string; processLabel: string };
}) {
  const initial = processes.find((process) => process.value === defaultProcessId);
  const [councilId, setCouncilId] = useState(lockedProcess?.councilId ?? initial?.councilId ?? "");
  const visibleProcesses = processes.filter((process) => !councilId || process.councilId === councilId);
  return (
    <ActionForm
      action={createAtaFormAction}
      submitLabel="Criar ata"
      hiddenFields={lockedProcess ? {
        councilId: lockedProcess.councilId,
        processId: lockedProcess.processId,
        returnTo: `/processos/${lockedProcess.processId}`,
      } : undefined}
    >
      {(e) => (<>
        {lockedProcess ? (
          <p className="text-sm text-muted-foreground">Órgão {lockedProcess.councilLabel}. Processo {lockedProcess.processLabel}. A ata fica nesta pasta.</p>
        ) : (<>
          <SelectField name="councilId" label="Órgão gerenciador" required options={councils} defaultValue={councilId} errors={e.councilId} onChange={setCouncilId} />
          <SelectField key={`${councilId || "todos"}-${defaultProcessId}`} name="processId" label="Processo" options={visibleProcesses} optional placeholder="Sem processo" defaultValue={visibleProcesses.some((process) => process.value === defaultProcessId) ? defaultProcessId : ""} hint="A ata fica ligada a este processo. O contrato do mesmo processo aparece aqui." errors={e.processId} />
        </>)}
        <TextField name="number" label="Número da ata" required errors={e.number} />
        <TextField name="startDate" label="Início da vigência" type="date" required hint="A vigência inicial é de 1 ano (art. 84, Lei 14.133/2021). Não há prorrogação automática." errors={e.startDate} />
        <TextField name="description" label="Descrição do item" required errors={e["items.0.description"]} />
        <SelectField name="materialId" label="Material (opcional)" options={materials} optional placeholder="Sem material" errors={e["items.0.materialId"]} />
        <TextField name="registeredQuantity" label="Quantidade registrada" type="number" step="0.001" min="0" required errors={e["items.0.registeredQuantity"]} />
        <CurrencyField name="unitPrice" label="Preço unitário (R$)" required errors={e["items.0.unitPrice"]} />
      </>)}
    </ActionForm>
  );
}
