import { NewContractForm } from "@/app/(app)/contratos/novo/new-contract-form";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  Building2,
  CalendarRange,
  CircleDollarSign,
  FileCheck2,
  Package,
  ScrollText,
} from "lucide-react";
import { loadLookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { ok } from "@/shared/lib/result";
import { can } from "@/shared/lib/authz/policy";
import { formatCurrency, formatNumber } from "@/shared/lib/format";
import { formatDateOnly } from "@/shared/lib/time";
import { LoadingState } from "@/shared/ui/feedback-states";
import { AtaStepButton } from "@/shared/ui/forms/link-process-form";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { StatusBadge } from "@/shared/ui/status-badge";
import { AtaBalancePanel, buildAtaBalanceRows } from "../ata-balance-panel";
import { ATA_MAX_EXTENSIONS } from "@/modules/atas/domain/validity";
import { suggestContractNumber } from "@/modules/contracts/domain/suggest-number";
export const metadata: Metadata = { title: "Ata" };

async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await loadScreen(async ({ services, actor }) => {
    const [view, lookups, processes, contracts] = await Promise.all([
      services.atas.get(actor, id),
      loadLookups({ services, actor }),
      services.processes.list(actor),
      services.contracts.list(actor),
    ]);
    if (!view.ok) return view;
    if (!lookups.ok) return lookups;
    if (!processes.ok) return processes;
    if (!contracts.ok) return contracts;

    const councilId = view.data.ata.councilId;
    const processId = view.data.ata.processId ?? null;
    const supplierId = view.data.ata.supplierId;
    const suppliers = await services.suppliers.list(actor);
    const supplierRows = suppliers.ok ? suppliers.data : [];
    const supplierName = supplierRows.find((row) => row.id === supplierId)?.name ?? null;
    const process = processes.data.find((item) => item.process.id === processId)?.process;
    const contractDraft = process &&
      can(actor, "contract.create", councilId) && view.data.ata.status === "vigente" && view.data.validity === "vigente"
      ? {
          councilId, councilLabel: lookups.data.councilLabel[councilId] ?? "Órgão",
          processId: process.id, processLabel: `${process.number} — ${process.title}`, processNumber: process.number,
          defaultValue: process.estimatedValue, validityStartDate: process.validityStartDate ?? view.data.ata.startDate,
          suggestedNumber: suggestContractNumber(process.number, contracts.data
            .filter(({ contract }) => contract.councilId === councilId)
            .map(({ contract }) => contract.number)),
          atas: [{ id, supplierId, supplierName, number: view.data.ata.number, status: "Vigente", items: buildAtaBalanceRows(view.data, lookups.data.materialLabel) }],
        } : undefined;

    return ok({
      view: view.data,
      lookups: lookups.data,
      supplierName,
      contractDraft,
      contractSuppliers: supplierRows.filter((row) => row.active || row.id === supplierId).map((row) => ({ value: row.id, label: row.name, cnpj: row.cnpj })),
      canManage: can(actor, "ata.manage", councilId),
      relatedContracts: contracts.data
        .filter(({ contract }) => contract.ataId === id)
        .sort((a, b) => Number(b.status === "vigente") - Number(a.status === "vigente"))
        .map((item) => ({ id: item.contract.id, number: item.contract.number, object: item.contract.object, value: item.terms.value, endDate: item.terms.endDate, status: item.status })),
    });
  });

  return (
    <Screen result={result}>
      {({ view, lookups, supplierName, canManage, relatedContracts, contractDraft, contractSuppliers }) => {
        const totalRegistered = view.items.reduce((sum, item) => sum + item.balance.registered, 0);
        const totalBalance = view.items.reduce((sum, item) => sum + item.balance.balance, 0);
        const totalValue = view.ata.items.reduce(
          (sum, item) => sum + item.registeredQuantity * item.unitPrice,
          0,
        );
        const isCancelled = view.ata.status === "cancelada";
        const isDraft = view.ata.status === "rascunho";
        const isValid = view.validity === "vigente";
        const statusTone = isCancelled ? "danger" : isDraft ? "warning" : isValid ? "success" : "danger";
        const statusLabel = isCancelled ? "Cancelada" : isDraft ? "Rascunho" : isValid ? "Vigente" : "Vencida";

        return (
          <>
            <PageHeader
              eyebrow="Atas · Registro de preços"
              backHref="/atas"
              returnToPath="/atas"
              backLabel="Todas as atas"
              title={`Ata ${view.ata.number}`}
              description={
                isCancelled ? "Ata cancelada após o registro de uma nova ata no mesmo processo."
                : isDraft
                  ? "Rascunho de ata de registro de preços."
                  : `Vigência até ${formatDateOnly(view.endDate)} · saldo disponível para consumo.`
              }
            />

            <div className="mb-6 flex flex-wrap items-center gap-2">
              <StatusBadge label={statusLabel} tone={statusTone} />
              <span className="text-sm text-muted-foreground">
                {lookups.councilLabel[view.ata.councilId] ?? "Órgão"}
              </span>
            </div>

            {/* Resumo geral */}
            <section aria-label="Resumo da ata" className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs">
                <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                  <Building2 className="size-4" aria-hidden />
                  <span className="text-xs font-medium">Empresa</span>
                </div>
                <p className="text-base font-semibold text-foreground">{supplierName ?? "Não informada"}</p>
              </article>
              <article className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs">
                <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                  <CalendarRange className="size-4" aria-hidden />
                  <span className="text-xs font-medium">Vigência</span>
                </div>
                <p className="text-base font-semibold text-foreground">
                  {formatDateOnly(view.ata.startDate)} → {formatDateOnly(view.endDate)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {view.ata.extensions.length > 0
                    ? `${view.ata.extensions.length} prorrogação(ões)`
                    : "Sem prorrogações"}
                </p>
              </article>
              <article className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs">
                <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                  <CircleDollarSign className="size-4" aria-hidden />
                  <span className="text-xs font-medium">Valor total</span>
                </div>
                <p className="text-base font-semibold tabular-nums text-foreground">{formatCurrency(totalValue)}</p>
                <p className="mt-1 text-xs text-muted-foreground">{view.items.length} item(ns)</p>
              </article>
              <article className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs">
                <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                  <Package className="size-4" aria-hidden />
                  <span className="text-xs font-medium">Saldo disponível</span>
                </div>
                <p className="text-base font-semibold tabular-nums text-emerald-700">{formatNumber(totalBalance)}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  de {formatNumber(totalRegistered)} registradas
                  {isDraft ? " · ainda não consome" : ""}
                </p>
              </article>
            </section>

            {/* Faixa de saldo */}
            <div className="mb-8">
              <AtaBalancePanel headingId="saldo-heading" items={buildAtaBalanceRows(view, lookups.materialLabel)} isDraft={isDraft} isCancelled={isCancelled} />
            </div>

            {/* Prorrogação */}
            {canManage && view.ata.status === "vigente" && isValid && view.ata.extensions.length < ATA_MAX_EXTENSIONS ? (
              <section
                aria-label="Ações da ata"
                className="mb-8 rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/8 via-card to-card p-5 shadow-xs"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-primary">
                      <ScrollText className="size-5 shrink-0" aria-hidden />
                      Prorrogar vigência
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {`Prorroga por 1 ano (até ${ATA_MAX_EXTENSIONS} vezes). Hoje: ${formatDateOnly(view.endDate)}.`}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-3">
                    <AtaStepButton ataId={view.ata.id} />
                  </div>
                </div>
              </section>
            ) : null}

            <section aria-labelledby="contratos-da-ata" className="surface-card mb-8 space-y-5 p-5 sm:p-6">
              <div>
                <h2 id="contratos-da-ata" className="flex items-center gap-2 font-heading text-lg font-semibold text-primary">
                  <FileCheck2 className="size-5" aria-hidden="true" />
                  Contratos desta ata ({relatedContracts.length})
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">Cada contrato usa os itens e o saldo desta ata.</p>
              </div>
              {relatedContracts.length > 0 ? (
                <ul className="grid gap-3 md:grid-cols-2">
                  {relatedContracts.map((contract) => (
                    <li key={contract.id} className="rounded-xl border border-border/70 bg-card p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <Link href={`/contratos/${contract.id}`} className="font-semibold text-primary underline-offset-4 hover:underline">{contract.number}</Link>
                          <p className="mt-1 text-sm text-muted-foreground">{contract.object}</p>
                        </div>
                        <StatusBadge label={contract.status === "encerrado" ? "Encerrado" : contract.status === "vencido" ? "Vencido" : "Vigente"} tone={contract.status === "vigente" ? "success" : "neutral"} />
                      </div>
                      <p className="mt-3 text-sm font-semibold tabular-nums">{formatCurrency(contract.value)}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Vigência até {formatDateOnly(contract.endDate)}</p>
                    </li>
                  ))}
                </ul>
              ) : <p className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">Nenhum contrato vinculado diretamente a esta ata.</p>}
              {contractDraft ? (
                <details className="rounded-xl border border-primary/20 bg-primary/5 p-4" open={relatedContracts.length === 0}>
                  <summary className="cursor-pointer font-semibold text-primary">Adicionar contrato a esta ata</summary>
                  <div className="mt-4">
                    <NewContractForm councils={[]} processes={[]} suppliers={contractSuppliers}
                      lockedProcess={{ ...contractDraft, returnToAtaId: view.ata.id }} />
                  </div>
                </details>
              ) : null}
            </section>

            {view.ata.extensions.length > 0 ? (
              <section aria-labelledby="prorrog" className="mt-8 rounded-2xl border border-border/70 bg-card p-5 shadow-xs">
                <h2 id="prorrog" className="mb-3 font-heading text-base font-semibold text-primary">
                  Prorrogações
                </h2>
                <ul className="space-y-2 text-sm">
                  {view.ata.extensions.map((extension, index) => (
                    <li key={`${extension.newEndDate}-${index}`} className="rounded-lg bg-muted/40 px-3 py-2">
                      {formatDateOnly(extension.previousEndDate)} → {formatDateOnly(extension.newEndDate)}
                      <span className="text-muted-foreground"> · {extension.legalBasis}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </>
        );
      }}
    </Screen>
  );
}

export default function AtaPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<LoadingState />}>
      <Content params={params} />
    </Suspense>
  );
}
