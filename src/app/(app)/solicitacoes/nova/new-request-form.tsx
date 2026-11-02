"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createRequestFormAction } from "@/modules/purchases/actions";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { SelectField, TextField } from "@/shared/ui/forms/fields";

type Option = { value: string; label: string };

/** Formulário com linhas de itens dinâmicas (campos repetidos materialId/quantity). */
export function NewRequestForm({ councils, materials }: { councils: Option[]; materials: Option[] }) {
  const [rows, setRows] = useState([0]);
  return (
    <div className="max-w-2xl">
      <ActionForm action={createRequestFormAction} submitLabel="Salvar rascunho">
        {(e) => (
          <>
            <SelectField name="councilId" label="Conselho" required options={councils} errors={e.councilId} />
            <TextField name="title" label="Título" required errors={e.title} />
            <fieldset className="space-y-3">
              <legend className="text-sm font-medium">Itens</legend>
              {materials.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum material cadastrado. Cadastre materiais em Estoque → Materiais.</p> : null}
              {rows.map((key) => (
                <div key={key} className="grid grid-cols-[1fr_8rem] gap-3">
                  <SelectField name="materialId" label="Material" options={materials} errors={e["items.0.materialId"]} />
                  <TextField name="quantity" label="Quantidade" type="number" step="0.001" min="0" errors={e["items.0.quantity"]} />
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
