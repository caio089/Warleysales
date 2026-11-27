"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { createAtaFormAction } from "@/modules/atas/actions";
import type { ExtractedAta } from "@/modules/atas/pdf-extraction";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { CurrencyField, SelectField, TextAreaField, TextField } from "@/shared/ui/forms/fields";
import { AtaMaterialsValues } from "./ata-materials-values";
import { AtaValidityField } from "./ata-validity-field";
import { matchPdfItems } from "./match-pdf-items";

type Option = { value: string; label: string };
type ProcessOption = Option & { councilId: string };
type SupplierOption = { value: string; label: string; cnpj: string | null };
type RequestMaterial = { materialId: string; name: string; quantity: number };

/** Garante número único no órgão (constraint council_id + number). */
export function suggestAtaNumber(preferred: string, existingNumbers: string[]): string {
  const used = new Set(existingNumbers.map((number) => number.trim().toLocaleLowerCase("pt-BR")));
  const base = preferred.trim().slice(0, 40) || "ARP";
  if (!used.has(base.toLocaleLowerCase("pt-BR"))) return base;
  let index = 2;
  while (true) {
    const suffix = ` (${index})`;
    const candidate = base.slice(0, 40 - suffix.length) + suffix;
    if (!used.has(candidate.toLocaleLowerCase("pt-BR"))) return candidate;
    index += 1;
  }
}

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
  /** Dentro do processo: materiais já vêm da solicitação; só falta empresa, vigência e valor. */
  lockedProcess?: {
    councilId: string;
    councilLabel: string;
    processId: string;
    processLabel: string;
    processNumber: string;
    materials: RequestMaterial[];
    suppliers: SupplierOption[];
    defaultValue?: number | null;
    validityStartDate?: string | null;
    /** Números já usados no órgão/processo — evita colidir com a unique (council, number). */
    existingAtaNumbers?: string[];
    requireReplacementJustification?: boolean;
    replacement?: { number: string; supplierName?: string | null; lineTotals: number[] };
  };
}) {
  const initial = processes.find((process) => process.value === defaultProcessId);
  const [councilId, setCouncilId] = useState(lockedProcess?.councilId ?? initial?.councilId ?? "");
  const visibleProcesses = processes.filter((process) => !councilId || process.councilId === councilId);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [extracted, setExtracted] = useState<ExtractedAta | null>(null);
  const [reading, setReading] = useState(false);
  const [message, setMessage] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [pdfVersion, setPdfVersion] = useState(0);

  async function readPdf() {
    if (!pdfFile) return;
    if (pdfFile.type !== "application/pdf" || pdfFile.size > 10 * 1024 * 1024) {
      setMessage("Selecione um PDF de até 10 MB.");
      return;
    }
    setReading(true);
    setMessage("");
    try {
      const body = new FormData();
      body.set("file", pdfFile);
      const response = await fetch("/api/atas/extract-pdf", { method: "POST", body });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Falha na leitura do PDF.");
      const fields = payload.fields as ExtractedAta;
      setExtracted(fields);
      setPdfVersion((version) => version + 1);
      if (lockedProcess) {
        const match =
          lockedProcess.suppliers.find(
            (supplier) =>
              fields.supplierCnpj &&
              supplier.cnpj === fields.supplierCnpj.replace(/\D/g, ""),
          ) ??
          lockedProcess.suppliers.find(
            (supplier) =>
              fields.supplierName &&
              supplier.label.toLocaleLowerCase("pt-BR") === fields.supplierName.toLocaleLowerCase("pt-BR"),
          );
        setSupplierId(match?.value ?? "");
      }
      const itemCount = fields.items?.length ?? 0;
      setMessage(
        `PDF lido (${payload.pages} página(s)${itemCount ? ` · ${itemCount} item(ns)` : ""}). Confira empresa, valores e vigência antes de registrar.${
          payload.truncated ? " Documento longo: apenas o início foi analisado." : ""
        }`,
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha na leitura do PDF.");
    } finally {
      setReading(false);
    }
  }

  const lockedLines = useMemo(() => {
    if (!lockedProcess) return [];
    const processMaterials = lockedProcess.materials ?? [];
    const base =
      processMaterials.length > 0
        ? processMaterials
        : [{ materialId: "", name: lockedProcess.processLabel, quantity: 1 }];
    if (!extracted?.items?.length) return base;
    const matches = matchPdfItems(base.map((line) => [line.name]), extracted.items.map((item) => item.description));
    return base.map((line, index) => {
      const match = matches[index];
      const fromPdf = match === null ? null : extracted.items[match];
      if (!fromPdf) return line;
      return {
        ...line,
        name: fromPdf.description?.trim() || line.name,
        quantity: fromPdf.quantity && fromPdf.quantity > 0 ? fromPdf.quantity : line.quantity,
      };
    });
  }, [extracted, lockedProcess]);

  if (lockedProcess) {
    const lines = lockedLines;
    const matches = extracted?.items?.length
      ? matchPdfItems((lockedProcess.materials ?? []).map((line) => [line.name]), extracted.items.map((item) => item.description))
      : [];
    const defaultLineTotals = extracted?.items?.length
      ? lines.map((_, index) => matches[index] == null ? null : extracted.items[matches[index]!]!.lineTotal)
      : lockedProcess.replacement?.lineTotals;
    const suggestedNumber = suggestAtaNumber(
      extracted?.number?.trim() || lockedProcess.replacement?.number || `ARP ${lockedProcess.processNumber || "sem-número"}`,
      lockedProcess.existingAtaNumbers ?? [],
    );
    const startDate = extracted?.startDate ?? lockedProcess.validityStartDate ?? undefined;

    return (
      <div className="space-y-4">
        <section className="space-y-3 rounded-xl border border-border/70 bg-muted/20 p-4" aria-label="Ler ata em PDF para preencher">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Ler ata em PDF para preencher</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              A IA lê empresa, itens, quantidades e valores. Confira tudo antes de registrar; o PDF não é arquivado nesta etapa.
            </p>
          </div>
          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={(event) => setPdfFile(event.target.files?.[0] ?? null)}
            className="block w-full text-sm"
          />
          <Button type="button" variant="outline" disabled={!pdfFile || reading} onClick={readPdf}>
            {reading ? "Lendo PDF…" : "Ler ata com IA"}
          </Button>
          {message ? (
            <p role="status" className="text-sm text-muted-foreground">
              {message}
            </p>
          ) : null}
        </section>

        <ActionForm
          key={`ata-form-${suggestedNumber}-${pdfVersion}`}
          action={createAtaFormAction}
          submitLabel={lockedProcess.requireReplacementJustification ? "Salvar edição e substituir ata" : "Registrar ata"}
          hiddenFields={{
            councilId: lockedProcess.councilId,
            processId: lockedProcess.processId,
            processNumber: lockedProcess.processNumber,
            itemCount: String(lines.length),
            returnTo: `/processos/${lockedProcess.processId}`,
            ...Object.fromEntries(
              lines.flatMap((line, index) => [
                [`items.${index}.materialId`, line.materialId],
                ...(lockedProcess.replacement ? [] : [
                  [`items.${index}.description`, line.name],
                  [`items.${index}.registeredQuantity`, String(line.quantity)],
                ]),
              ]),
            ),
          }}
        >
          {(e) => (
            <div className="space-y-4">
              {lockedProcess.requireReplacementJustification && (
                <TextAreaField name="replacementJustification" label="Justificativa da troca de ata" required
                  hint="Informe o motivo da criação de outra ata neste processo." errors={e.replacementJustification} />
              )}
              <TextField
                name="number"
                label="Número da ata"
                required
                defaultValue={suggestedNumber}
                hint="Cada ata precisa de um número único no órgão."
                errors={e.number}
              />

              <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">1. Empresa vencedora</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Digite o nome ou use o que a IA leu do PDF.
                  </p>
                </div>
                <TextField
                  name="supplierName"
                  label="Nome da empresa"
                  required
                  placeholder="Ex.: Fornecedor Alfa Ltda"
                  defaultValue={extracted?.supplierName ?? lockedProcess.replacement?.supplierName ?? ""}
                  errors={e.supplierName ?? e.supplierId}
                />
                {lockedProcess.suppliers.length > 0 ? (
                  <SelectField
                    key={`supplier-${supplierId}`}
                    name="supplierId"
                    label="Ou escolha uma já cadastrada (opcional)"
                    optional
                    options={lockedProcess.suppliers.map((supplier) => ({
                      value: supplier.value,
                      label: supplier.cnpj ? `${supplier.label} · ${supplier.cnpj}` : supplier.label,
                    }))}
                    defaultValue={supplierId}
                    onChange={setSupplierId}
                    placeholder="Deixe em branco se digitou o nome acima"
                    errors={e.supplierId}
                  />
                ) : null}
              </div>

              <AtaMaterialsValues
                key={`values-${extracted?.totalValue ?? "base"}-${defaultLineTotals?.join("-") ?? "none"}`}
                lines={lines}
                councilLabel={lockedProcess.councilLabel}
                processLabel={lockedProcess.processLabel}
                defaultTotal={matches.some((match) => match === null) ? lockedProcess.defaultValue : (extracted?.totalValue ?? lockedProcess.defaultValue)}
                defaultLineTotals={defaultLineTotals}
                editableItems={Boolean(lockedProcess.replacement)}
                errors={e}
              />
              {extracted?.items?.length && matches.some((match) => match === null) ? (
                <p role="status" className="text-sm text-amber-700">Alguns itens do PDF não correspondem de forma única aos materiais do processo. Confira quantidades e valores manualmente.</p>
              ) : null}

              <AtaValidityField
                errors={e.startDate}
                defaultStartDate={startDate}
                hint={
                  extracted?.startDate
                    ? "Puxada do PDF da ata. Ajuste só se necessário."
                    : lockedProcess.replacement ? "Data de início da ata anterior."
                    : lockedProcess.validityStartDate
                      ? "Puxada do Termo de Referência. Ajuste só se necessário."
                      : "Se ainda não preencheu no TR, informe aqui."
                }
              />
            </div>
          )}
        </ActionForm>
      </div>
    );
  }

  return (
    <ActionForm action={createAtaFormAction} submitLabel="Criar ata">
      {(e) => (
        <>
          <SelectField
            name="councilId"
            label="Órgão gerenciador"
            required
            options={councils}
            defaultValue={councilId}
            errors={e.councilId}
            onChange={setCouncilId}
          />
          <SelectField
            key={`${councilId || "todos"}-${defaultProcessId}`}
            name="processId"
            label="Processo"
            options={visibleProcesses}
            optional
            placeholder="Sem processo"
            defaultValue={
              visibleProcesses.some((process) => process.value === defaultProcessId)
                ? defaultProcessId
                : ""
            }
            hint="A ata fica ligada a este processo. O contrato do mesmo processo aparece aqui."
            errors={e.processId}
          />
          <TextField name="number" label="Número da ata" required errors={e.number} />
          <AtaValidityField errors={e.startDate} />
          <TextField
            name="description"
            label="Descrição do item"
            required
            errors={e["items.0.description"]}
          />
          <SelectField
            name="materialId"
            label="Material (opcional)"
            options={materials}
            optional
            placeholder="Sem material"
            errors={e["items.0.materialId"]}
          />
          <TextField
            name="registeredQuantity"
            label="Quantidade registrada"
            type="number"
            step="0.001"
            min="0"
            required
            errors={e["items.0.registeredQuantity"]}
          />
          <CurrencyField
            name="unitPrice"
            label="Preço unitário (R$)"
            required
            errors={e["items.0.unitPrice"]}
          />
        </>
      )}
    </ActionForm>
  );
}
