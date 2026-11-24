"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ExtractedContract } from "@/modules/contracts/pdf-extraction";
import { createContractFormAction } from "@/modules/contracts/actions";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { CurrencyField, SelectField, TextField } from "@/shared/ui/forms/fields";

type Option = { value: string; label: string };
type ProcessOption = Option & { councilId: string };
type SupplierOption = Option & { cnpj: string | null };

export function NewContractForm({
  councils,
  processes,
  suppliers,
  defaultProcessId = "",
  lockedProcess,
}: {
  councils: Option[];
  processes: ProcessOption[];
  suppliers: SupplierOption[];
  defaultProcessId?: string;
  /** Dentro do processo, órgão e pasta já estão definidos. */
  lockedProcess?: { councilId: string; councilLabel: string; processId: string; processLabel: string };
}) {
  const initial = processes.find((process) => process.value === defaultProcessId);
  const [councilId, setCouncilId] = useState(lockedProcess?.councilId ?? initial?.councilId ?? "");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [extracted, setExtracted] = useState<ExtractedContract | null>(null);
  const [supplierId, setSupplierId] = useState("");
  const [reading, setReading] = useState(false);
  const [message, setMessage] = useState("");
  const visibleProcesses = processes.filter((process) => !councilId || process.councilId === councilId);
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
      const response = await fetch("/api/contracts/extract-pdf", { method: "POST", body });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Falha na leitura do PDF.");
      const fields = payload.fields as ExtractedContract;
      setExtracted(fields);
      const match = suppliers.find((supplier) => fields.supplierCnpj && supplier.cnpj === fields.supplierCnpj.replace(/\D/g, ""))
        ?? suppliers.find((supplier) => fields.supplierName && supplier.label.toLocaleLowerCase("pt-BR") === fields.supplierName.toLocaleLowerCase("pt-BR") && (!fields.supplierCnpj || supplier.cnpj === fields.supplierCnpj.replace(/\D/g, "")));
      setSupplierId(match?.value ?? "");
      setMessage(`PDF lido (${payload.pages} página(s)). Confira cada campo antes de cadastrar.${payload.truncated ? " Documento longo: apenas o início foi analisado." : ""}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha na leitura do PDF.");
    } finally {
      setReading(false);
    }
  }
  return (
    <div className="space-y-6">
      <section className="space-y-3 rounded-lg border border-border p-4" aria-label="Ler contrato em PDF">
        <h2 className="font-medium">Preencher a partir de PDF</h2>
        <p className="text-sm text-muted-foreground">PDF com texto selecionável, até 10 MB e 30 páginas. O texto é enviado ao provedor de IA para extração; o cadastro só acontece após sua conferência.</p>
        <input type="file" accept="application/pdf,.pdf" onChange={(event) => setPdfFile(event.target.files?.[0] ?? null)} className="block w-full text-sm" />
        <Button type="button" variant="outline" disabled={!pdfFile || reading} onClick={readPdf}>{reading ? "Lendo PDF…" : "Ler PDF"}</Button>
        {message ? <p role="status" className="text-sm text-muted-foreground">{message}</p> : null}
      </section>
      <ActionForm
        action={createContractFormAction}
        submitLabel="Confirmar e cadastrar contrato"
        hiddenFields={lockedProcess ? {
          councilId: lockedProcess.councilId,
          processId: lockedProcess.processId,
          returnTo: `/processos/${lockedProcess.processId}`,
        } : undefined}
      >
      {(e) => (<>
        {lockedProcess ? (
          <p className="text-sm text-muted-foreground">Órgão {lockedProcess.councilLabel}. Processo {lockedProcess.processLabel}. O contrato fica nesta pasta, depois da ata.</p>
        ) : (<>
          <SelectField name="councilId" label="Órgão" required options={councils} defaultValue={councilId} errors={e.councilId} onChange={setCouncilId} />
          <SelectField key={`${councilId || "todos"}-${defaultProcessId}`} name="processId" label="Processo" options={visibleProcesses} optional placeholder="Sem processo" defaultValue={visibleProcesses.some((process) => process.value === defaultProcessId) ? defaultProcessId : ""} hint="Use o mesmo processo da ata para os dois ficarem ligados." errors={e.processId} />
        </>)}
        <SelectField key={`supplier-${supplierId}`} name="supplierId" label="Fornecedor existente" options={suppliers} optional placeholder="Cadastrar pelo nome abaixo" defaultValue={supplierId} onChange={setSupplierId} errors={e.supplierId} />
        <TextField key={`name-${extracted?.supplierName ?? ""}`} name="supplierName" label="Empresa/fornecedor (se novo)" defaultValue={extracted?.supplierName ?? ""} hint="Se não selecionar um fornecedor existente, este nome será cadastrado ao confirmar." errors={e.supplierName} />
        <TextField key={`cnpj-${extracted?.supplierCnpj ?? ""}`} name="supplierCnpj" label="CNPJ (se novo)" defaultValue={extracted?.supplierCnpj ?? ""} errors={e.supplierCnpj} />
        <TextField key={`number-${extracted?.number ?? ""}`} name="number" label="Número" required defaultValue={extracted?.number ?? ""} errors={e.number} />
        <TextField key={`object-${extracted?.object ?? ""}`} name="object" label="Objeto" required defaultValue={extracted?.object ?? ""} errors={e.object} />
        <TextField key={`start-${extracted?.startDate ?? ""}`} name="startDate" label="Início" type="date" required defaultValue={extracted?.startDate ?? ""} errors={e.startDate} />
        <TextField key={`end-${extracted?.endDate ?? ""}`} name="endDate" label="Fim/validade" type="date" required defaultValue={extracted?.endDate ?? ""} errors={e.endDate} />
        <CurrencyField key={`value-${extracted?.value ?? ""}`} name="value" label="Valor global (R$)" defaultValue={extracted?.value} errors={e.value} />
      </>)}
      </ActionForm>
    </div>
  );
}
