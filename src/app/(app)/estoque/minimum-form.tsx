"use client";

import { setMinimumFormAction } from "@/modules/inventory/actions";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { SelectField, TextField } from "@/shared/ui/forms/fields";

type Option = { value: string; label: string };

/** Define o mínimo por conselho/material. Sem isso, o nível "crítico" nunca dispara. */
export function MinimumForm({ councils, materials }: { councils: Option[]; materials: Option[] }) {
  const defaultCouncilId = councils.length === 1 ? councils[0]!.value : "";
  const defaultMaterialId = materials.length === 1 ? materials[0]!.value : "";
  return (
    <section aria-labelledby="minimo" className="surface-card p-6">
      <h2 id="minimo" className="font-heading text-lg font-medium tracking-tight text-primary">Estoque mínimo</h2>
      <p className="mt-1 mb-4 text-sm leading-relaxed text-muted-foreground">Usado para classificar atenção e crítico. Só gestor altera.</p>
      <ActionForm action={setMinimumFormAction} submitLabel="Definir mínimo">
        {(e) => (
          <>
            <SelectField name="councilId" label="Conselho" required options={councils} defaultValue={defaultCouncilId} errors={e.councilId} />
            <SelectField name="materialId" label="Material" required options={materials} defaultValue={defaultMaterialId} errors={e.materialId} />
            <TextField name="minimum" label="Quantidade mínima" type="text" inputMode="decimal" placeholder="Ex.: 5" required errors={e.minimum} />
          </>
        )}
      </ActionForm>
    </section>
  );
}
