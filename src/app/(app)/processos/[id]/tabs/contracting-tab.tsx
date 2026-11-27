"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@base-ui/react/dialog";
import Link from "next/link";
import { ExternalLink, FileCheck2, ScrollText } from "lucide-react";
import { AtaBalancePanel, type AtaBalanceRow } from "@/app/(app)/atas/ata-balance-panel";
import { SavingsPanel } from "../savings-panel";
import { NewAtaForm } from "@/app/(app)/atas/nova/new-ata-form";
import { NewContractForm } from "@/app/(app)/contratos/novo/new-contract-form";
import type { ProcessContractingMode } from "@/modules/processes/contracting-mode";
import { needsAta } from "@/modules/processes/contracting-mode";
import { formatCurrency } from "@/shared/lib/format";
import { formatDateOnly } from "@/shared/lib/time";
import { LinkAtaToProcessForm, LinkContractToProcessForm } from "@/shared/ui/forms/link-process-form";
import { StatusBadge } from "@/shared/ui/status-badge";
import {
  FormalizationCard,
  type FormalizationCardProps,
  type FormalizationSupplier,
} from "../formalization-card";
import type { ProcessFormalization } from "@/modules/formalizations/domain/formalization";

export interface LinkedAtaItem {
  id: string;
  number: string;
  endDate: string | null;
  startDate?: string;
  supplierName?: string | null;
  status: "Vigente" | "Vencida" | "Rascunho" | string;
  items?: AtaBalanceRow[];
}

export interface LinkedContractItem {
  id: string;
  number: string;
  object: string;
  value: number;
  endDate: string | null;
}

export interface ContractingTabProps {
  processId: string;
  councilId: string;
  documentalComplete: boolean;
  formalization: ProcessFormalization | null;
  suppliers: FormalizationSupplier[];
  isWarley: boolean;
  defaultEstimatedValue?: number | null;
  requestId?: string | null;
  requestItems?: FormalizationCardProps["requestItems"];
  evidenceOptions?: FormalizationCardProps["evidenceOptions"];
  linkedAtas?: LinkedAtaItem[];
  linkedContracts?: LinkedContractItem[];
  availableAtas?: { value: string; label: string }[];
  availableContracts?: { value: string; label: string }[];
  canLink?: boolean;
  contractingMode?: ProcessContractingMode | null;
  /** Dados para criar ata e contrato sem sair deste processo. */
  draft?: {
    councilLabel: string;
    processLabel: string;
    processNumber: string;
    materials: { value: string; label: string }[];
    requestMaterials: { materialId: string; name: string; quantity: number }[];
    defaultValue?: number | null;
    validityStartDate?: string | null;
    suppliers: { value: string; label: string; cnpj: string | null }[];
  };
}

/** Aba 2 — Contratação: Instrumentos contratuais vinculados (Atas e Contratos) + Formulário de Formalização. */
export function ContractingTab({
  processId,
  councilId,
  documentalComplete,
  formalization,
  suppliers,
  isWarley,
  defaultEstimatedValue,
  requestId,
  requestItems = [],
  evidenceOptions,
  linkedAtas = [],
  linkedContracts = [],
  availableAtas = [],
  availableContracts = [],
  canLink = false,
  draft,
  contractingMode = null,
}: ContractingTabProps) {
  const [showFormalization, setShowFormalization] = useState(false);
  const [replacementFor, setReplacementFor] = useState<string | null>(null);
  const currentAtas = linkedAtas.filter((ata) => ata.status !== "Cancelada");
  const cancelledAtas = linkedAtas.filter((ata) => ata.status === "Cancelada");
  const existingAta = currentAtas[0];
  const replacementOpen = existingAta != null && replacementFor === existingAta.id;
  const showAta = needsAta(contractingMode);
  const instrumentsReady =
    (!showAta || existingAta != null) && linkedContracts.length > 0;
  const linkedContractValue = linkedContracts.reduce((sum, item) => sum + item.value, 0);
  const recorded = formalization?.status !== "rejeitada" ? formalization : null;
  const canOpenFormalization = formalization?.status === "aguardando_homologacao"
    ? isWarley
    : isWarley || (canLink && documentalComplete);
  return (
    <div className="space-y-6">
      {/* Seção Superior: Instrumentos Contratuais Vinculados */}
      <section
        aria-labelledby="instrumentos-heading"
        className="surface-card space-y-4 p-5 sm:p-6"
      >
        <header className="border-b border-border/60 pb-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2
                id="instrumentos-heading"
                className="font-heading text-base font-semibold text-foreground sm:text-lg"
              >
                Instrumentos Contratuais Vinculados
              </h2>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                {contractingMode === "contrato"
                  ? "Este processo é somente contrato (sem ata). A escolha foi feita na aba Documentação."
                  : contractingMode === "registro_precos"
                    ? "Registro de preços: primeiro a ata, depois o contrato."
                    : "Defina na aba Documentação se é registro de preços (tem ata) ou só contrato."}
              </p>
            </div>
          </div>
        </header>

        {!contractingMode ? (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-foreground">
            Ainda não foi informado se é registro de preços. Responda em{" "}
            <Link href="?aba=documentos" className="font-medium text-primary hover:underline">
              Documentação
            </Link>{" "}
            para liberar o fluxo certo de ata e contrato.
          </div>
        ) : null}

        <ol className="space-y-8">
          {showAta ? (
          <li className="space-y-3">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <ScrollText className="size-4 text-primary" aria-hidden="true" />
              1. Ata de registro de preços ({currentAtas.length})
            </h3>
            {currentAtas.length > 0 ? (
              <div className="space-y-2.5">
                {currentAtas.map((ata) => (
                  <div
                    key={ata.id}
                    className="group relative flex min-w-0 flex-col justify-between gap-3 rounded-xl border border-border/70 bg-card p-4 transition-all hover:border-primary/40 hover:shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground">
                          Ata de Registro de Preços
                        </span>
                        <p className="mt-0.5 font-semibold text-foreground group-hover:text-primary transition-colors">
                          {ata.number}
                        </p>
                      </div>
                      <StatusBadge
                        label={ata.status}
                        tone={
                          ata.status === "Vigente"
                            ? "success"
                            : ata.status === "Rascunho" ? "warning" : "neutral"
                        }
                      />
                    </div>

                    {ata.items && (
                      <AtaBalancePanel headingId={`saldo-ata-${ata.id}`} items={ata.items} isDraft={ata.status === "Rascunho"} />
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40 text-xs text-muted-foreground">
                      <span>
                        Vigência até {ata.endDate ? formatDateOnly(ata.endDate) : "—"}
                        {ata.items ? ` · ${ata.items.length} item(ns)` : ""}
                      </span>
                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          href={`/atas/${ata.id}`}
                          className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                        >
                          <span>Ver saldo e detalhes</span>
                          <ExternalLink className="size-3" aria-hidden="true" />
                        </Link>
                        {ata.id === existingAta?.id && cancelledAtas.length > 0 && <CancelledAtaHistory atas={cancelledAtas} />}
                        {ata.id === existingAta?.id && canLink && draft && (
                          <Button type="button" variant="outline" size="sm" aria-expanded={replacementOpen}
                            onClick={() => setReplacementFor(replacementOpen ? null : ata.id)}>
                            {replacementOpen ? "Fechar edição" : "Editar ata"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-4 text-center">
                <p className="text-xs text-muted-foreground">
                  Nenhuma ata de registro de preços vinculada a este processo.
                </p>
              </div>
            )}
            {canLink && (!existingAta || replacementOpen) ? (
              <div className="space-y-4 rounded-xl border border-border/70 bg-muted/10 p-4">
                <p className="text-xs text-muted-foreground">
                  No registro de preços, anexe a ata em PDF para a IA ler itens, quantidades e valores. Depois, cada contrato desconta do saldo dessa ata.
                </p>
                {!existingAta && (availableAtas.length > 0 ? (
                  <LinkAtaToProcessForm processId={processId} atas={availableAtas} submitLabel="Vincular ata existente" />
                ) : (
                  <p className="text-xs text-muted-foreground">Não há ata livre deste órgão para vincular.</p>
                ))}
                {draft ? (
                  <NewAtaForm
                    councils={[]}
                    materials={draft.materials}
                    processes={[]}
                    lockedProcess={{
                      councilId,
                      councilLabel: draft.councilLabel,
                      processId,
                      processLabel: draft.processLabel,
                      processNumber: draft.processNumber,
                      materials: replacementOpen && existingAta.items?.length ? existingAta.items.map((row) => ({
                        materialId: row.materialId ?? "", name: row.description, quantity: row.registered,
                      })) : draft.requestMaterials,
                      suppliers: draft.suppliers,
                      defaultValue: draft.defaultValue,
                      validityStartDate: replacementOpen ? existingAta.startDate ?? draft.validityStartDate : draft.validityStartDate,
                      requireReplacementJustification: replacementOpen,
                      replacement: replacementOpen ? {
                        number: existingAta.number, supplierName: existingAta.supplierName,
                        lineTotals: existingAta.items?.map((row) => row.registered * row.unitPrice) ?? [],
                      } : undefined,
                      existingAtaNumbers: linkedAtas.map((ata) => ata.number),
                    }}
                  />
                ) : (
                  <Link href={`/atas/nova?processId=${processId}`} className="text-sm font-medium text-primary hover:underline">
                    Criar ata deste processo
                  </Link>
                )}
              </div>
            ) : null}
          </li>
          ) : (
            <li className="rounded-xl border border-dashed border-border/80 bg-muted/15 px-4 py-3 text-sm text-muted-foreground">
              Sem ata neste processo — marcado como somente contrato na Documentação.
            </li>
          )}

          {!showAta && <li className="space-y-3">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <FileCheck2 className="size-4 text-primary" aria-hidden="true" />
              1. Contrato ({linkedContracts.length})
            </h3>
            {linkedContracts.length > 0 ? (
              <div className="space-y-2.5">
                {linkedContracts.map((contract) => (
                  <div
                    key={contract.id}
                    className="group relative flex flex-col justify-between gap-3 rounded-xl border border-border/70 bg-card p-4 transition-all hover:border-primary/40 hover:shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground">
                          Contrato Administrativo
                        </span>
                        <p className="mt-0.5 font-semibold text-foreground group-hover:text-primary transition-colors">
                          {contract.number}
                        </p>
                        {contract.object ? (
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                            {contract.object}
                          </p>
                        ) : null}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[0.7rem] font-medium text-muted-foreground uppercase">
                          Valor Contratado
                        </span>
                        <p className="font-semibold text-foreground">
                          {formatCurrency(contract.value)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs text-muted-foreground">
                      <span>Vigência até {contract.endDate ? formatDateOnly(contract.endDate) : "—"}</span>
                      <Link
                        href={`/contratos/${contract.id}`}
                        className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                      >
                        <span>Ver contrato</span>
                        <ExternalLink className="size-3" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-4 text-center">
                <p className="text-xs text-muted-foreground">
                  Nenhum contrato administrativo vinculado a este processo.
                </p>
              </div>
            )}
            {canLink && linkedContracts.length === 0 ? (
              <div className="space-y-4 rounded-xl border border-border/70 bg-muted/10 p-4">
                {availableContracts.length > 0 ? (
                  <LinkContractToProcessForm processId={processId} contracts={availableContracts} submitLabel="Anexar contrato" />
                ) : (
                  <p className="text-xs text-muted-foreground">Não há contrato livre deste órgão para anexar.</p>
                )}
                {draft ? (
                  <NewContractForm
                    councils={[]}
                    processes={[]}
                    suppliers={draft.suppliers}
                    lockedProcess={{
                      councilId,
                      councilLabel: draft.councilLabel,
                      processId,
                      processLabel: draft.processLabel,
                      processNumber: draft.processNumber,
                      object: draft.processLabel,
                      defaultValue: draft.defaultValue,
                      validityStartDate: draft.validityStartDate,
                      requestMaterials: draft.requestMaterials,
                      atas: currentAtas.map((ata) => ({
                        id: ata.id,
                        number: ata.number,
                        status: ata.status,
                        items: ata.items ?? [],
                      })),
                    }}
                  />
                ) : (
                  <Link href={`/contratos/novo?processId=${processId}`} className="text-sm font-medium text-primary hover:underline">
                    Criar contrato deste processo
                  </Link>
                )}
              </div>
            ) : null}
          </li>}
        </ol>
      </section>

      {instrumentsReady && (
        <section className="space-y-3" aria-label="Economia da contratação">
          <SavingsPanel estimatedNum={recorded?.estimatedValue ?? defaultEstimatedValue ?? 0}
            contractedNum={recorded?.contractedValue ?? linkedContractValue} />
          {formalization?.status !== "homologado" && canOpenFormalization && (
            <Button type="button" variant="outline" aria-expanded={showFormalization}
              onClick={() => setShowFormalization((open) => !open)}>
              {showFormalization ? "Fechar formalização"
                : formalization?.status === "aguardando_homologacao" ? "Revisar homologação"
                : isWarley ? "Gravar economia e liberar estoque" : "Enviar para homologação"}
            </Button>
          )}
        </section>
      )}
      {(!instrumentsReady || (showFormalization && canOpenFormalization && formalization?.status !== "homologado")) && (
        <FormalizationCard
          processId={processId}
          councilId={councilId}
          documentalComplete={documentalComplete}
          evidenceOptions={evidenceOptions}
          formalization={formalization}
          suppliers={suppliers}
          isWarley={isWarley}
          defaultEstimatedValue={defaultEstimatedValue}
          defaultContractedValue={instrumentsReady ? linkedContractValue : undefined}
          requestId={requestId}
          requestItems={requestItems}
          instrumentsReady={instrumentsReady}
        />
      )}
    </div>
  );
}

function CancelledAtaHistory({ atas }: { atas: LinkedAtaItem[] }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger render={<Button type="button" variant="outline" size="sm" />}>Atas anteriores</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 max-h-[88vh] w-[min(60rem,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border bg-popover p-5 text-popover-foreground shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <Dialog.Title className="font-heading text-lg font-semibold">Atas anteriores</Dialog.Title>
            <Dialog.Close render={<Button type="button" variant="outline" size="sm" />}>Fechar</Dialog.Close>
          </div>
          <Dialog.Description className="mb-4 text-sm text-muted-foreground">
            Atas canceladas após o registro de uma nova versão.
          </Dialog.Description>
          <div className="space-y-4">
            {atas.map((ata) => (
              <article key={ata.id} className="space-y-3 rounded-xl border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold">{ata.number}</h3>
                  <StatusBadge label="Cancelada" tone="danger" />
                </div>
                {ata.supplierName && <p className="text-sm">Fornecedor: {ata.supplierName}</p>}
                {ata.endDate && <p className="text-sm">Vigência até {formatDateOnly(ata.endDate)}</p>}
                {ata.items && <AtaBalancePanel headingId={`saldo-historico-${ata.id}`} items={ata.items} isDraft={false} isCancelled />}
                <Link href={`/atas/${ata.id}`} className="text-sm font-medium text-primary underline">Abrir ficha da ata cancelada</Link>
              </article>
            ))}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
