"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AtaValidityField } from "@/app/(app)/atas/nova/ata-validity-field";
import { computeInitialEndDate } from "@/modules/atas/domain/validity";
import type { ExtractedContract } from "@/modules/contracts/pdf-extraction";
import { createContractFormAction } from "@/modules/contracts/actions";
import { formatCurrency } from "@/shared/lib/format";
import { formatDateOnly } from "@/shared/lib/time";
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
  /** Dentro do processo: puxa materiais, vigência do TR e valor do PP. */
  lockedProcess?: {
    councilId: string;
    councilLabel: string;
    processId: string;
    processLabel: string;
    processNumber: string;
    object?: string;
    defaultValue?: number | null;
    validityStartDate?: string | null;
    requestMaterials?: { materialId: string; name: string; quantity: number }[];
  };
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

  if (lockedProcess) {
    const materials = lockedProcess.requestMaterials ?? [];
    const start = lockedProcess.validityStartDate ?? undefined;
    const end = start ? computeInitialEndDate(start) : undefined;
    const suggestedNumber = `CTR ${lockedProcess.processNumber}`.slice(0, 40);
    const object =
      lockedProcess.object
      ?? (materials.length === 1 ? materials[0]!.name : lockedProcess.processLabel);

    return (
      <ActionForm
        action={createContractFormAction}
        submitLabel="Registrar contrato"
        hiddenFields={{
          councilId: lockedProcess.councilId,
          processId: lockedProcess.processId,
          number: suggestedNumber,
          object,
          returnTo: `/processos/${lockedProcess.processId}`,
        }}
      >
        {(e) => (
          <div className="space-y-4">
            <div className="rounded-xl border border-border/70 bg-muted/15 px-3.5 py-3 text-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Dados puxados do processo
              </p>
              <p className="mt-1 text-foreground">{lockedProcess.processLabel}</p>
              {materials.length > 0 ? (
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  {materials.map((item) => (
                    <li key={`${item.materialId}-${item.name}`}>
                      {item.name} · qtd {item.quantity}
                    </li>
                  ))}
                </ul>
              ) : null}
              {start ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Vigência do TR: {formatDateOnly(start)}
                  {end ? ` até ${formatDateOnly(end)}` : ""}
                </p>
              ) : (
                <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                  Ainda sem vigência no TR — informe abaixo ou salve antes na aba Documentos (TR).
                </p>
              )}
            </div>

            <SelectField
              name="supplierId"
              label="Empresa vencedora"
              required
              options={suppliers.map((supplier) => ({
                value: supplier.value,
                label: supplier.cnpj ? `${supplier.label} · ${supplier.cnpj}` : supplier.label,
              }))}
              placeholder="Selecione a empresa"
              errors={e.supplierId}
            />

            <AtaValidityField
              errors={e.startDate}
              defaultStartDate={start}
              endFieldName="endDate"
              hint={
                start
                  ? "Puxada do Termo de Referência. O fim do contrato acompanha 1 ano."
                  : "Informe o início. Ideal: salvar antes no TR para reutilizar na ata e no contrato."
              }
            />

            <CurrencyField
              name="value"
              label="Valor do contrato (R$)"
              required
              defaultValue={lockedProcess.defaultValue ?? undefined}
              hint={
                lockedProcess.defaultValue != null
                  ? `Sugestão do processo/PP: ${formatCurrency(lockedProcess.defaultValue)}`
                  : undefined
              }
              errors={e.value}
            />
          </div>
        )}
      </ActionForm>
    );
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
      >
      {(e) => (<>
          <SelectField name="councilId" label="Órgão" required options={councils} defaultValue={councilId} errors={e.councilId} onChange={setCouncilId} />
          <SelectField key={`${councilId || "todos"}-${defaultProcessId}`} name="processId" label="Processo" options={visibleProcesses} optional placeholder="Sem processo" defaultValue={visibleProcesses.some((process) => process.value === defaultProcessId) ? defaultProcessId : ""} hint="Use o mesmo processo da ata para os dois ficarem ligados." errors={e.processId} />
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
