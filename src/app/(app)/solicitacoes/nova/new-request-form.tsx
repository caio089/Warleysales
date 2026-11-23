"use client";

import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { createRequestFormAction } from "@/modules/purchases/actions";
import type { ExtractedPurchaseRequest } from "@/modules/purchases/request-extraction";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { SelectField, TextField } from "@/shared/ui/forms/fields";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string };

const ACCEPTED =
  ".xlsx,.docx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export function NewRequestForm({ councils }: { councils: Option[] }) {
  const [file, setFile] = useState<File | null>(null);
  const [reading, setReading] = useState(false);
  const [message, setMessage] = useState("");
  const [extracted, setExtracted] = useState<ExtractedPurchaseRequest | null>(null);
  /** Remonta o formulário após a importação, para os defaultValue entrarem. */
  const [formKey, setFormKey] = useState(0);
  const [itemCount, setItemCount] = useState(1);

  async function readDocument() {
    if (!file) return;
    const lower = file.name.toLowerCase();
    if ((!lower.endsWith(".xlsx") && !lower.endsWith(".docx")) || file.size > 10 * 1024 * 1024) {
      setMessage("Selecione um Excel (.xlsx) ou Word (.docx) de até 10 MB.");
      return;
    }
    setReading(true);
    setMessage("");
    try {
      const body = new FormData();
      body.set("file", file);
      const response = await fetch("/api/purchases/extract-request", { method: "POST", body });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Falha na leitura do arquivo.");
      const fields = payload.fields as ExtractedPurchaseRequest;
      setExtracted(fields);
      setItemCount(Math.max(1, fields.items.length));
      setFormKey((current) => current + 1);
      const viaTemplate = payload.source === "template";
      const kindLabel = payload.kind === "xlsx" ? "planilha" : "documento Word";
      setMessage(
        `${kindLabel[0].toUpperCase()}${kindLabel.slice(1)} lida${viaTemplate ? " pelo modelo" : " com IA"}: ${fields.items.length} item(ns) preenchidos. Confira antes de salvar.` +
          (payload.truncated ? " Arquivo longo: apenas o início foi analisado." : ""),
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha na leitura do arquivo.");
    } finally {
      setReading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3 rounded-lg border border-border p-4" aria-label="Importar solicitação">
        <h2 className="font-medium">Cadastrar vários itens de uma vez</h2>
        <p className="text-sm text-muted-foreground">
          Baixe o modelo Excel (aba Solicitação + Instruções) ou Word, preencha o Título e a tabela Item / Quantidade / Unidade
          com quantas linhas quiser (o Valor estimado é opcional) e envie de volta. O sistema compara as colunas e preenche o formulário. Nada é gravado antes da sua conferência.
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href="/api/purchases/request-template?format=xlsx"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Baixar modelo Excel
          </a>
          <a
            href="/api/purchases/request-template?format=docx"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Baixar modelo Word
          </a>
        </div>
        <input
          type="file"
          accept={ACCEPTED}
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="block w-full text-sm"
        />
        <Button type="button" variant="outline" disabled={!file || reading} onClick={readDocument}>
          {reading ? "Lendo arquivo…" : "Importar e preencher"}
        </Button>
        {message ? <p role="status" className="text-sm text-muted-foreground">{message}</p> : null}
      </section>

      <div className="surface-card max-w-2xl p-6">
        <ActionForm key={formKey} action={createRequestFormAction} submitLabel="Salvar rascunho">
          {(e) => (
            <>
              <SelectField name="councilId" label="Órgão" required options={councils} errors={e.councilId} />
              <TextField
                name="title"
                label="Título"
                required
                defaultValue={extracted?.title ?? ""}
                errors={e.title}
              />
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border/60 bg-muted/20 p-3.5 transition-colors hover:bg-muted/30">
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
                <p className="text-xs text-muted-foreground">
                  Vários itens da planilha/documento entram aqui de uma vez. Você ainda pode acrescentar linhas manualmente.
                </p>
                {Array.from({ length: itemCount }, (_, index) => {
                  const item = extracted?.items[index];
                  return (
                    <div key={`${formKey}-${index}`} className="grid gap-3 md:grid-cols-[1fr_8rem_7rem]">
                      <TextField
                        name="itemName"
                        label="Item"
                        required
                        placeholder="Ex.: Papel A4"
                        defaultValue={item?.description ?? ""}
                        errors={e[`items.${index}.description`]}
                      />
                      <TextField
                        name="quantity"
                        label="Quantidade"
                        type="number"
                        step="0.001"
                        min="0"
                        required
                        defaultValue={item?.quantity != null ? String(item.quantity) : ""}
                        errors={e[`items.${index}.quantity`]}
                      />
                      <TextField
                        name="unit"
                        label="Unidade"
                        placeholder="un"
                        defaultValue={item?.unit ?? "un"}
                        errors={e[`items.${index}.unit`]}
                      />
                    </div>
                  );
                })}
                {e.items ? <p role="alert" className="text-xs text-destructive">{e.items.join(" ")}</p> : null}
                <Button type="button" variant="outline" size="sm" onClick={() => setItemCount((count) => count + 1)}>
                  Adicionar item
                </Button>
              </fieldset>
            </>
          )}
        </ActionForm>
      </div>
    </div>
  );
}
