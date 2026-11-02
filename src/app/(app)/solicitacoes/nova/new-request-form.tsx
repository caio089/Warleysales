"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createRequestFormAction } from "@/modules/purchases/actions";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { SelectField, TextField } from "@/shared/ui/forms/fields";

type Option = { value: string; label: string };

export function NewRequestForm({
  councils,
  materials,
  ataItems,
}: {
  councils: Option[];
  materials: Option[];
  ataItems: Option[];
}) {
  const [rows, setRows] = useState([0]);
  return (
    <div className="surface-card max-w-2xl p-6">
      <ActionForm action={createRequestFormAction} submitLabel="Salvar rascunho">
        {(e) => (
          <>
            <SelectField name="councilId" label="Conselho" required options={councils} errors={e.councilId} />
            <TextField name="title" label="Título" required errors={e.title} />
            <fieldset className="space-y-3">
              <legend className="text-sm font-medium">Itens</legend>
              <p className="text-xs text-muted-foreground">Ao aprovar, o item da ata vigente consome o saldo (rascunho não consome). Sem vínculo, a ata permanece intacta.</p>
              {materials.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum material cadastrado. Cadastre materiais em Estoque → Materiais.</p> : null}
              {rows.map((key) => (
                <div key={key} className="grid gap-3 md:grid-cols-[1fr_8rem_1fr]">
                  <SelectField name="materialId" label="Material" options={materials} errors={e["items.0.materialId"]} />
                  <TextField name="quantity" label="Quantidade" type="number" step="0.001" min="0" errors={e["items.0.quantity"]} />
                  <SelectField name="ataItemId" label="Item da ata (opcional)" options={ataItems} optional placeholder="Sem vínculo" errors={e["items.0.ataItemId"]} />
                </div>
              ))}
              {e.items ? <p role="alert" className="text-xs text-destructive">{e.items.join(" ")}</p> : null}
              <Button type="button" variant="outline" size="sm" onClick={() => setRows((r) => [...r, r.length])}>Adicionar item</Button>
            </fieldset>
          </>
        )}
      </ActionForm>
    </div>
  );
}
