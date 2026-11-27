import { NewContractForm } from "@/app/(app)/contratos/novo/new-contract-form";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  Building2,
  CalendarRange,
  CircleDollarSign,
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
import { AtaStepButton, LinkContractToProcessForm, LinkProcessForm } from "@/shared/ui/forms/link-process-form";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { StatusBadge } from "@/shared/ui/status-badge";
import { linkAtaProcessFormAction } from "@/modules/atas/actions";
import { AtaBalancePanel, buildAtaBalanceRows } from "../ata-balance-panel";
import { ATA_MAX_EXTENSIONS } from "@/modules/atas/domain/validity";
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
    const request = process ? await services.purchases.findLinkedByProcess(actor, process.id) : null;
    const requestStatus = request?.ok ? request.data?.status : undefined;
    const contractDraft = process && request?.ok &&
      (!requestStatus || ["aprovada", "em_atendimento", "parcialmente_atendida", "atendida"].includes(requestStatus)) &&
      can(actor, "contract.manage", councilId) && view.data.ata.status === "vigente" && view.data.validity === "vigente"
      ? {
          councilId, councilLabel: lookups.data.councilLabel[councilId] ?? "Órgão",
          processId: process.id, processLabel: `${process.number} — ${process.title}`, processNumber: process.number,
          defaultValue: process.estimatedValue, validityStartDate: process.validityStartDate ?? view.data.ata.startDate,
          atas: [{ id, number: view.data.ata.number, status: "Vigente", items: buildAtaBalanceRows(view.data, lookups.data.materialLabel) }],
        } : undefined;

    return ok({
      view: view.data,
      lookups: lookups.data,
      supplierName,
      contractDraft,
      contractSuppliers: supplierRows.filter((row) => row.active).map((row) => ({ value: row.id, label: row.name, cnpj: row.cnpj })),
      canManage: can(actor, "ata.manage", councilId),
      processes: processes.data
        .filter((item) => item.process.councilId === councilId)
        .map((item) => ({ value: item.process.id, label: `${item.process.number} — ${item.process.title}` })),
      processHref: processId ? `/solicitacoes/processos/${processId}` : null,
      processLabel: processes.data.find((item) => item.process.id === processId)?.process.number ?? null,
      relatedContracts: processId
        ? contracts.data
            .filter(({ contract }) => contract.councilId === councilId && (contract.ataId === id || (!contract.ataId && contract.processId === processId && view.data.ata.status !== "cancelada")))
            .map((item) => ({ id: item.contract.id, label: `${item.contract.number} — ${item.contract.object}` }))
        : [],
      councilContracts: contracts.data
        .filter(({ contract }) => contract.councilId === councilId && !contract.processId && !contract.ataId)
        .map((item) => ({ value: item.contract.id, label: `${item.contract.number} — ${item.contract.object}` })),
    });
  });

  return (
    <Screen result={result}>
      {({ view, lookups, supplierName, canManage, processes, processHref, processLabel, relatedContracts, councilContracts, contractDraft, contractSuppliers }) => {
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

            <section aria-label="Processo e contratos" className="surface-card mb-8 space-y-4 p-6">
              <div>
                <h2 className="font-heading text-lg font-medium tracking-tight text-primary">Processo e contratos</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {processHref && processLabel ? (
                    <>
                      Processo{" "}
                      <Link href={processHref} className="font-medium text-primary underline-offset-4 hover:underline">
                        {processLabel}
                      </Link>
                    </>
                  ) : (
                    "Nenhum processo vinculado."
                  )}
                  {relatedContracts.length > 0 ? " · Contratos: " : null}
                  {relatedContracts.map((contract, index) => (
                    <span key={contract.id}>
                      {index > 0 ? ", " : null}
                      <Link href={`/contratos/${contract.id}`} className="font-medium text-primary underline-offset-4 hover:underline">
                        {contract.label}
                      </Link>
                    </span>
                  ))}
                </p>
              </div>
              {canManage && !isCancelled ? (
                <LinkProcessForm
                  action={linkAtaProcessFormAction}
                  entityIdName="ataId"
                  entityId={view.ata.id}
                  processes={processes}
                  current={view.ata.processId ?? null}
                />
              ) : null}
              {contractDraft && relatedContracts.length === 0 ? (
                <div className="space-y-3 border-t border-border/70 pt-4">
                  <h3 className="text-sm font-medium">Vincular um contrato a este processo</h3>
                  {councilContracts.length > 0 && (
                    <LinkContractToProcessForm processId={contractDraft.processId} contracts={councilContracts} />
                  )}
                  <NewContractForm councils={[]} processes={[]} suppliers={contractSuppliers}
                    lockedProcess={{ ...contractDraft, returnToAtaId: view.ata.id }} />
                </div>
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
