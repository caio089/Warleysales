"use client";

import Link from "next/link";
import { ExternalLink, FileCheck2, ScrollText } from "lucide-react";
import { NewAtaForm } from "@/app/(app)/atas/nova/new-ata-form";
import { NewContractForm } from "@/app/(app)/contratos/novo/new-contract-form";
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
  status: "Vigente" | "Vencida" | string;
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
  /** Dados para criar ata e contrato sem sair deste processo. */
  draft?: {
    councilLabel: string;
    processLabel: string;
    materials: { value: string; label: string }[];
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
}: ContractingTabProps) {
  const instrumentsReady = linkedAtas.length > 0 && linkedContracts.length > 0;
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
                Primeiro a ata. Depois o contrato. Os dois podem ser criados aqui ou anexados se já existirem no órgão.
              </p>
            </div>
          </div>
        </header>

        <ol className="space-y-8">
          <li className="space-y-3">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <ScrollText className="size-4 text-primary" aria-hidden="true" />
              1. Ata de registro de preços ({linkedAtas.length})
            </h3>
            {linkedAtas.length > 0 ? (
              <div className="space-y-2.5">
                {linkedAtas.map((ata) => (
                  <div
                    key={ata.id}
                    className="group relative flex flex-col justify-between gap-3 rounded-xl border border-border/70 bg-card p-4 transition-all hover:border-primary/40 hover:shadow-xs"
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
                        tone={ata.status === "Vigente" ? "success" : "neutral"}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs text-muted-foreground">
                      <span>Vigência até {ata.endDate ? formatDateOnly(ata.endDate) : "—"}</span>
                      <Link
                        href={`/atas/${ata.id}`}
                        className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                      >
                        <span>Ver ata</span>
                        <ExternalLink className="size-3" aria-hidden="true" />
                      </Link>
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
            {canLink ? (
              <div className="space-y-4 rounded-xl border border-border/70 bg-muted/10 p-4">
                {availableAtas.length > 0 ? (
                  <LinkAtaToProcessForm processId={processId} atas={availableAtas} submitLabel="Anexar ata" />
                ) : (
                  <p className="text-xs text-muted-foreground">Não há ata livre deste órgão para anexar.</p>
                )}
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
                    }}
                  />
                ) : (
                  <Link href={`/atas/novo?processId=${processId}`} className="text-sm font-medium text-primary hover:underline">
                    Criar ata deste processo
                  </Link>
                )}
              </div>
            ) : null}
          </li>

          <li className="space-y-3">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <FileCheck2 className="size-4 text-primary" aria-hidden="true" />
              2. Contrato ({linkedContracts.length})
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
            {canLink ? (
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
                    }}
                  />
                ) : (
                  <Link href={`/contratos/novo?processId=${processId}`} className="text-sm font-medium text-primary hover:underline">
                    Criar contrato deste processo
                  </Link>
                )}
              </div>
            ) : null}
          </li>
        </ol>
      </section>

      {/* Seção Principal: Formalização da Contratação */}
      <FormalizationCard
        processId={processId}
        councilId={councilId}
        documentalComplete={documentalComplete}
        evidenceOptions={evidenceOptions}
        formalization={formalization}
        suppliers={suppliers}
        isWarley={isWarley}
        defaultEstimatedValue={defaultEstimatedValue}
        requestId={requestId}
        requestItems={requestItems}
        instrumentsReady={instrumentsReady}
      />
    </div>
  );
}
