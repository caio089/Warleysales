"use client";

import { setAllocationsFormAction } from "@/modules/atas/actions";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { SelectField, TextField } from "@/shared/ui/forms/fields";

type Option = { value: string; label: string };

/** P5: alocação opcional. Sem conselho/quantidade, o item volta a saldo comum. */
export function AllocationForm({ ataId, items, councils }: { ataId: string; items: Option[]; councils: Option[] }) {
  return (
    <section aria-labelledby="aloc" className="surface-card max-w-lg p-6">
      <h2 id="aloc" className="mb-1 font-heading text-lg font-medium tracking-tight text-primary">Alocação por conselho</h2>
      <p className="mb-4 text-sm text-muted-foreground">Opcional. Substitui as alocações do item. Sem preenchimento, o saldo é comum.</p>
      <ActionForm action={setAllocationsFormAction} submitLabel="Salvar alocação" hiddenFields={{ ataId }} resetOnSuccess={false}>
        {(e) => (
          <>
            <SelectField name="itemId" label="Item" required options={items} errors={e.itemId} />
            <SelectField name="councilId" label="Conselho" options={councils} optional placeholder="Saldo comum (sem limite)" errors={e.allocations} />
            <TextField name="quantity" label="Quantidade alocada" type="number" step="0.001" min="0" errors={e.allocations} />
          </>
        )}
      </ActionForm>
    </section>
  );
}
