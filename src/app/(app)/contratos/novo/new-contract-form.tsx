"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { AtaValidityField } from "@/app/(app)/atas/nova/ata-validity-field";
import { matchPdfItems } from "@/app/(app)/atas/nova/match-pdf-items";
import { computeInitialEndDate } from "@/modules/atas/domain/validity";
import type { ExtractedContract } from "@/modules/contracts/pdf-extraction";
import { createContractFormAction } from "@/modules/contracts/actions";
import { calculateContractAtaValue } from "@/modules/contracts/domain/ata-value";
import { suggestContractNumber } from "@/modules/contracts/domain/suggest-number";
import { formatCurrency, formatNumber } from "@/shared/lib/format";
import { formatDateOnly } from "@/shared/lib/time";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { CurrencyField, SelectField, TextField } from "@/shared/ui/forms/fields";

type Option = { value: string; label: string };
type ProcessOption = Option & { councilId: string };
type SupplierOption = Option & { cnpj: string | null };

export type ContractAtaOption = {
  id: string;
  number: string;
  supplierId?: string | null;
  supplierName?: string | null;
  status: string;
  items: Array<{
    itemId: string;
    description: string;
    materialLabel: string;
    balance: number;
    unitPrice: number;
  }>;
};

export function NewContractForm({
  councils,
  processes,
  suppliers,
  defaultProcessId = "",
  lockedProcess,
  currentYear,
  existingContractNumbersByCouncil,
}: {
  councils: Option[];
  processes: ProcessOption[];
  suppliers: SupplierOption[];
  defaultProcessId?: string;
  currentYear?: number;
  existingContractNumbersByCouncil?: Record<string, string[]>;
  /** Dentro do processo: puxa materiais, vigência do TR e valor do PP. */
  lockedProcess?: {
    returnToAtaId?: string;
    councilId: string;
    councilLabel: string;
    processId: string;
    processLabel: string;
    processNumber: string;
    suggestedNumber?: string;
    object?: string;
    defaultValue?: number | null;
    validityStartDate?: string | null;
    requestMaterials?: { materialId: string; name: string; quantity: number }[];
    /** Atas do processo para consumir saldo (registro de preços). */
    atas?: ContractAtaOption[];
  };
}) {
  const initial = processes.find((process) => process.value === defaultProcessId);
  const [councilId, setCouncilId] = useState(lockedProcess?.councilId ?? initial?.councilId ?? "");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [extracted, setExtracted] = useState<ExtractedContract | null>(null);
  const [supplierId, setSupplierId] = useState(lockedProcess?.atas?.find((ata) => ata.status === "Vigente")?.supplierId ?? "");
  const [reading, setReading] = useState(false);
  const [message, setMessage] = useState("");
  const [pdfVersion, setPdfVersion] = useState(0);
  const atas = useMemo(() => lockedProcess?.atas ?? [], [lockedProcess?.atas]);
  const vigenteAtas = atas.filter((ata) => ata.status === "Vigente");
  const [ataId, setAtaId] = useState(vigenteAtas[0]?.id ?? atas[0]?.id ?? "");
  /** Quantidades do contrato por item da ata — o valor total é calculado ao vivo. */
  const [qtyDrafts, setQtyDrafts] = useState<Record<string, string>>({});
  const visibleProcesses = processes.filter((process) => !councilId || process.councilId === councilId);
  const selectedAta = useMemo(
    () => atas.find((ata) => ata.id === ataId) ?? null,
    [ataId, atas],
  );
  const ataLines = useMemo(() => selectedAta?.items ?? [], [selectedAta]);
  const pdfMatches = useMemo(
    () => extracted?.items?.length
      ? matchPdfItems(ataLines.map((item) => [item.description, item.materialLabel]), extracted.items.map((item) => item.description))
      : [],
    [ataLines, extracted],
  );
  const contractLines = useMemo(
    () =>
      ataLines.map((item, index) => {
        const raw = qtyDrafts[item.itemId];
        const fromState = raw !== undefined ? Number(String(raw).replace(",", ".")) : NaN;
        const pdfIndex = pdfMatches[index];
        const pdfQty = pdfIndex == null ? null : extracted?.items?.[pdfIndex]?.quantity;
        const fallback = pdfQty != null && pdfQty > 0 ? pdfQty : 0;
        const quantity = raw === undefined ? fallback : Number.isFinite(fromState) && fromState > 0 ? fromState : 0;
        const lineTotal = Math.round(quantity * item.unitPrice * 100) / 100;
        return { ...item, quantity, lineTotal, pdfQuantity: pdfQty, draft: raw ?? (fallback > 0 ? String(fallback) : "") };
      }),
    [ataLines, extracted, pdfMatches, qtyDrafts],
  );
  const computedContractValue = useMemo(
    () => calculateContractAtaValue(contractLines),
    [contractLines],
  );

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
      setPdfVersion((version) => version + 1);
      setQtyDrafts({});
      const match = suppliers.find((supplier) => fields.supplierCnpj && supplier.cnpj === fields.supplierCnpj.replace(/\D/g, ""))
        ?? suppliers.find((supplier) => fields.supplierName && supplier.label.toLocaleLowerCase("pt-BR") === fields.supplierName.toLocaleLowerCase("pt-BR") && (!fields.supplierCnpj || supplier.cnpj === fields.supplierCnpj.replace(/\D/g, "")));
      setSupplierId(selectedAta?.supplierId ?? match?.value ?? "");
      const itemCount = (fields.items?.length ?? 0);
      setMessage(
        `PDF lido (${payload.pages} página(s)${itemCount ? ` · ${itemCount} item(ns)` : ""}). Confira cada campo antes de cadastrar.${
          payload.truncated ? " Documento longo: apenas o início foi analisado." : ""
        }`,
      );
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
    const suggestedNumber = lockedProcess.suggestedNumber ?? suggestContractNumber(currentYear ?? new Date().getFullYear(), []);
    const object =
      lockedProcess.object
      ?? (materials.length === 1 ? materials[0]!.name : lockedProcess.processLabel);
    const valueFromQuantities = atas.length > 0 && ataLines.length > 0;

    return (
      <div className="space-y-4">
        <section className="space-y-3 rounded-xl border border-border/70 bg-muted/20 p-4" aria-label="Ler contrato em PDF">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Ler contrato em PDF para preencher</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              A IA lê empresa, itens e quantidades. Confira os campos; o PDF não é arquivado nesta etapa. O valor é a soma das quantidades × preço da ata.
            </p>
          </div>
          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={(event) => setPdfFile(event.target.files?.[0] ?? null)}
            className="block w-full text-sm"
          />
          <Button type="button" variant="outline" disabled={!pdfFile || reading} onClick={readPdf}>
            {reading ? "Lendo PDF…" : "Ler contrato com IA"}
          </Button>
          {message ? <p role="status" className="text-sm text-muted-foreground">{message}</p> : null}
        </section>

        <ActionForm
          key={`ctr-${ataId}-${pdfVersion}`}
          action={createContractFormAction}
          submitLabel="Registrar contrato e descontar da ata"
          hiddenFields={{
            councilId: lockedProcess.councilId,
            processId: lockedProcess.processId,
            returnTo: lockedProcess.returnToAtaId ? `/atas/${lockedProcess.returnToAtaId}` : `/processos/${lockedProcess.processId}`,
            ...(atas.length === 1 ? { ataId: atas[0]!.id } : {}),
            ...(valueFromQuantities ? { value: String(computedContractValue) } : {}),
          }}
        >
          {(e) => (
            <div className="space-y-4">
              <div className="rounded-xl border border-border/70 bg-muted/15 px-3.5 py-3 text-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Dados puxados do processo
                </p>
                <p className="mt-1 text-foreground">{lockedProcess.processLabel}</p>
                {start ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Vigência do TR: {formatDateOnly(start)}
                    {end ? ` até ${formatDateOnly(end)}` : ""}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <TextField name="number" label="Número do contrato" required defaultValue={(extracted?.number?.trim() || suggestedNumber).slice(0, 40)} errors={e.number} />
                <TextField name="object" label="Objeto do contrato" required defaultValue={extracted?.object?.trim() || object} errors={e.object} />
              </div>

              {atas.length > 0 ? (
                <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Itens e quantidades do contrato</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Informe quantas unidades entram neste contrato. O valor é calculado sozinho (qtd × unitário da ata).
                    </p>
                  </div>
                  {extracted?.items?.length && pdfMatches.some((match) => match === null) ? (
                    <p role="status" className="text-sm text-amber-700">Alguns itens do PDF não correspondem de forma única aos itens da ata. Confira e informe as quantidades manualmente.</p>
                  ) : null}
                  {atas.length > 1 ? <SelectField
                    name="ataId"
                    label="Ata de registro de preços"
                    required
                    options={atas.map((ata) => ({
                      value: ata.id,
                      label: `${ata.number}${ata.supplierName ? ` · ${ata.supplierName}` : ""} · ${ata.status}`,
                    }))}
                    defaultValue={ataId}
                    onChange={(next) => {
                      setAtaId(next);
                      setQtyDrafts({});
                      setSupplierId(atas.find((ata) => ata.id === next)?.supplierId ?? "");
                    }}
                    errors={e.ataId}
                  /> : selectedAta ? (
                    <p className="rounded-lg bg-card px-3 py-2 text-sm text-foreground ring-1 ring-border/60">
                      Ata selecionada: <span className="font-semibold">{selectedAta.number}</span>
                      {selectedAta.supplierName ? ` · ${selectedAta.supplierName}` : ""}
                    </p>
                  ) : null}
                  {selectedAta?.status === "Rascunho" ? (
                    <p className="text-xs text-amber-700">Ative a ata antes de consumir saldo com o contrato.</p>
                  ) : null}
                  {contractLines.length > 0 ? (
                    <>
                      <ul className="space-y-2">
                        {contractLines.map((item, index) => (
                          <li
                            key={item.itemId}
                            className="grid gap-3 rounded-lg border border-border/60 bg-card p-3 sm:grid-cols-[minmax(0,1fr)_7rem_8rem]"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground">{item.materialLabel || item.description}</p>
                              <p className="text-xs text-muted-foreground">
                                Saldo na ata: {formatNumber(item.balance)} · unitário {formatCurrency(item.unitPrice)}
                              </p>
                              {item.pdfQuantity != null && item.pdfQuantity > item.balance ? (
                                <p role="alert" className="mt-1 text-xs font-medium text-destructive">
                                  PDF: {formatNumber(item.pdfQuantity)}; saldo disponível: {formatNumber(item.balance)}. A quantidade do PDF excede o saldo da ata.
                                </p>
                              ) : null}
                              <input type="hidden" name={`ataItems.${index}.ataItemId`} value={item.itemId} />
                              <input type="hidden" name={`ataItems.${index}.unitPrice`} value={String(item.unitPrice)} />
                            </div>
                            <TextField
                              name={`ataItems.${index}.quantity`}
                              label="Qtd."
                              type="text"
                              inputMode="decimal"
                              value={item.draft}
                              onChange={(event) => {
                                const next = event.currentTarget.value;
                                setQtyDrafts((current) => ({ ...current, [item.itemId]: next }));
                              }}
                              hint={`máx. ${formatNumber(item.balance)}`}
                              errors={e[`ataItems.${index}.quantity`] ?? e.ataItems}
                            />
                            <div className="flex flex-col justify-end rounded-xl border border-primary/15 bg-primary/5 px-3 py-2">
                              <p className="text-[0.68rem] font-medium uppercase tracking-wide text-muted-foreground">
                                Subtotal
                              </p>
                              <p className="mt-0.5 text-sm font-semibold tabular-nums text-primary">
                                {formatCurrency(item.lineTotal)}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                      <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-3">
                        <span className="text-sm font-medium text-foreground">Valor do contrato</span>
                        <span className="text-base font-semibold tabular-nums text-primary">
                          {formatCurrency(computedContractValue)}
                        </span>
                      </div>
                      {e.value ? (
                        <p role="alert" className="text-sm text-destructive">
                          {e.value.join(" ")}
                        </p>
                      ) : null}
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">Esta ata ainda não tem itens.</p>
                  )}
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-border/70 px-3 py-2 text-xs text-muted-foreground">
                  Sem ata neste processo — o contrato será registrado sem desconto de saldo de ata.
                </p>
              )}

                <SelectField
                key={`supplier-${supplierId || extracted?.supplierName || ""}`}
                name="supplierId"
                label="Empresa vencedora"
                required={suppliers.length > 0}
                  options={(selectedAta?.supplierId ? suppliers.filter((supplier) => supplier.value === selectedAta.supplierId) : suppliers).map((supplier) => ({
                  value: supplier.value,
                  label: supplier.cnpj ? `${supplier.label} · ${supplier.cnpj}` : supplier.label,
                }))}
                defaultValue={supplierId}
                  onChange={setSupplierId}
                placeholder="Selecione a empresa"
                errors={e.supplierId}
              />
              {!supplierId ? (
                <TextField
                  name="supplierName"
                  label="Ou digite o nome da empresa"
                  defaultValue={extracted?.supplierName ?? ""}
                  errors={e.supplierName}
                />
              ) : null}

              <AtaValidityField
                errors={e.startDate}
                defaultStartDate={extracted?.startDate ?? start}
                endFieldName="endDate"
                hint={
                  extracted?.startDate
                    ? "Puxada do PDF do contrato."
                    : start
                      ? "Puxada do Termo de Referência. O fim do contrato acompanha 1 ano."
                      : "Informe o início da vigência."
                }
              />

              {!valueFromQuantities ? (
                <CurrencyField
                  name="value"
                  label="Valor do contrato (R$)"
                  required
                  defaultValue={extracted?.value ?? lockedProcess.defaultValue ?? undefined}
                  errors={e.value}
                />
              ) : null}
            </div>
          )}
        </ActionForm>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3 rounded-lg border border-border p-4" aria-label="Ler contrato em PDF">
        <h2 className="font-medium">Preencher a partir de PDF</h2>
        <p className="text-sm text-muted-foreground">PDF com texto selecionável, até 10 MB e 30 páginas. O texto é enviado ao provedor de IA para extração; o cadastro só acontece após sua conferência. O PDF não é arquivado nesta etapa.</p>
        <input type="file" accept="application/pdf,.pdf" onChange={(event) => setPdfFile(event.target.files?.[0] ?? null)} className="block w-full text-sm" />
        <Button type="button" variant="outline" disabled={!pdfFile || reading} onClick={readPdf}>{reading ? "Lendo PDF…" : "Ler PDF para preencher"}</Button>
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
        <TextField key={`number-${councilId}-${extracted?.number ?? ""}`} name="number" label="Número" required
          defaultValue={extracted?.number ?? (councilId ? suggestContractNumber(currentYear ?? new Date().getFullYear(), existingContractNumbersByCouncil?.[councilId] ?? []) : "")}
          errors={e.number} />
        <TextField key={`object-${extracted?.object ?? ""}`} name="object" label="Objeto" required defaultValue={extracted?.object ?? ""} errors={e.object} />
        <TextField key={`start-${extracted?.startDate ?? ""}`} name="startDate" label="Início" type="date" required defaultValue={extracted?.startDate ?? ""} errors={e.startDate} />
        <TextField key={`end-${extracted?.endDate ?? ""}`} name="endDate" label="Fim/validade" type="date" required defaultValue={extracted?.endDate ?? ""} errors={e.endDate} />
        <CurrencyField key={`value-${extracted?.value ?? ""}`} name="value" label="Valor global (R$)" defaultValue={extracted?.value} errors={e.value} />
        {extracted?.items && extracted.items.length > 0 ? (
          <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
            <p className="text-sm font-semibold text-foreground">Itens lidos do PDF</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Conferência — a soma alimenta o valor global. Na próxima etapa, essas quantidades descontarão o saldo da ata.
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {extracted.items.map((item, index) => (
                <li key={`${item.description}-${index}`} className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg bg-card px-3 py-2 ring-1 ring-border/60">
                  <span className="font-medium text-foreground">{item.description ?? `Item ${index + 1}`}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {item.quantity != null ? `${item.quantity} un` : "—"}
                    {item.lineTotal != null ? ` · ${formatCurrency(item.lineTotal)}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </>)}
      </ActionForm>
    </div>
  );
}
