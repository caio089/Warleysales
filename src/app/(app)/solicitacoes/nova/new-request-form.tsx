"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createRequestFormAction } from "@/modules/purchases/actions";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { SelectField, TextField } from "@/shared/ui/forms/fields";

type Option = { value: string; label: string };

export function NewRequestForm({ councils }: { councils: Option[] }) {
  const [rows, setRows] = useState([0]);
  return (
    <div className="surface-card max-w-2xl p-6">
      <ActionForm action={createRequestFormAction} submitLabel="Salvar rascunho">
        {(e) => (
          <>
            <SelectField name="councilId" label="Conselho" required options={councils} errors={e.councilId} />
            <TextField name="title" label="Título" required errors={e.title} />
            <label className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/20 p-3.5 transition-colors hover:bg-muted/30 cursor-pointer">
              <input
                type="checkbox"
                name="createProcess"
                defaultChecked
                value="on"
                className="mt-0.5 size-4 rounded border-input text-primary focus:ring-ring"
              />
              <div className="space-y-0.5 text-sm">
                <span className="font-medium text-foreground">Gerar processo administrativo correspondente</span>
                <p className="text-xs text-muted-foreground">
                  Abre automaticamente o processo para inserção dos 7 documentos obrigatórios (DFD, ETP, MR, TR, PP, PJ e ED).
                </p>
              </div>
            </label>
            <fieldset className="space-y-3">
              <legend className="text-sm font-medium">Itens</legend>
              <p className="text-xs text-muted-foreground">Escreva o que precisa e a quantidade. Esta solicitação não tira saldo do estoque.</p>
              {rows.map((key) => (
                <div key={key} className="grid gap-3 md:grid-cols-[1fr_8rem_7rem]">
                  <TextField name="itemName" label="Item" required placeholder="Ex.: Papel A4" errors={e["items.0.description"]} />
                  <TextField name="quantity" label="Quantidade" type="number" step="0.001" min="0" required errors={e["items.0.quantity"]} />
                  <TextField name="unit" label="Unidade" placeholder="un" defaultValue="un" errors={e["items.0.unit"]} />
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
