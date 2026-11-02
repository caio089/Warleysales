"use client";

import { requestTransferFormAction } from "@/modules/transfers/actions";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { SelectField, TextField } from "@/shared/ui/forms/fields";

type Option = { value: string; label: string };

export function NewTransferForm({ councils, materials }: { councils: Option[]; materials: Option[] }) {
  return (
    <ActionForm action={requestTransferFormAction} submitLabel="Solicitar transferência">
      {(e) => (<>
        <SelectField name="originCouncilId" label="Conselho de origem (cede o material)" required options={councils} errors={e.originCouncilId} />
        <SelectField name="destinationCouncilId" label="Conselho de destino (recebe)" required options={councils} errors={e.destinationCouncilId} />
        <SelectField name="materialId" label="Material" required options={materials} errors={e["items.0.materialId"]} />
        <TextField name="quantity" label="Quantidade" type="number" step="0.001" min="0" required errors={e["items.0.quantity"]} />
        {e.items ? <p role="alert" className="text-xs text-destructive">{e.items.join(" ")}</p> : null}
      </>)}
    </ActionForm>
  );
}
