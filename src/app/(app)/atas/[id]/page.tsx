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
    let supplierName: string | null = null;
    if (supplierId) {
      const suppliers = await services.suppliers.list(actor);
      if (suppliers.ok) {
        supplierName = suppliers.data.find((row) => row.id === supplierId)?.name ?? null;
      }
    }

    return ok({
      view: view.data,
      lookups: lookups.data,
      supplierName,
      canManage: can(actor, "ata.manage", councilId),
      processes: processes.data
        .filter((item) => item.process.councilId === councilId)
        .map((item) => ({ value: item.process.id, label: `${item.process.number} — ${item.process.title}` })),
      processHref: processId ? `/processos/${processId}` : null,
      processLabel: processes.data.find((item) => item.process.id === processId)?.process.number ?? null,
      relatedContracts: processId
        ? contracts.data
            .filter((item) => item.contract.processId === processId)
            .map((item) => ({ id: item.contract.id, label: `${item.contract.number} — ${item.contract.object}` }))
        : [],
      councilContracts: contracts.data
        .filter((item) => item.contract.councilId === councilId)
        .map((item) => ({ value: item.contract.id, label: `${item.contract.number} — ${item.contract.object}` })),
    });
  });

  return (
    <Screen result={result}>
      {({ view, lookups, supplierName, canManage, processes, processHref, processLabel, relatedContracts, councilContracts }) => {
        const ataItemsById = Object.fromEntries(view.ata.items.map((item) => [item.id, item]));
        const totalRegistered = view.items.reduce((sum, item) => sum + item.balance.registered, 0);
        const totalCommitted = view.items.reduce((sum, item) => sum + item.balance.committed, 0);
        const totalBalance = view.items.reduce((sum, item) => sum + item.balance.balance, 0);
        const totalValue = view.ata.items.reduce(
          (sum, item) => sum + item.registeredQuantity * item.unitPrice,
          0,
        );
        const isDraft = view.ata.status === "rascunho";
        const isValid = view.validity === "vigente";
        const statusTone = isDraft ? "warning" : isValid ? "success" : "danger";
        const statusLabel = isDraft ? "Rascunho" : isValid ? "Vigente" : "Vencida";

        return (
          <>
            <PageHeader
              eyebrow="Atas · Registro de preços"
              backHref="/atas"
              returnToPath="/atas"
              backLabel="Todas as atas"
              title={`Ata ${view.ata.number}`}
              description={
                isDraft
                  ? "Rascunho: confira empresa, vigência, valores e saldo antes de ativar."
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
            <section aria-labelledby="saldo-heading" className="mb-8 rounded-2xl border border-border/70 bg-card p-5 shadow-xs">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 id="saldo-heading" className="font-heading text-lg font-semibold text-primary">
                    Saldo por item
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Registrada − comprometida = saldo. {isDraft ? "No rascunho o saldo ainda não é consumido." : "Pedidos aprovados consomem este saldo."}
                  </p>
                </div>
              </div>

              <div className="mb-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-muted/40 px-4 py-3">
                  <p className="text-xs font-medium text-muted-foreground">Registrada</p>
                  <p className="mt-1 text-xl font-semibold tabular-nums">{formatNumber(totalRegistered)}</p>
                </div>
                <div className="rounded-xl bg-amber-50 px-4 py-3 ring-1 ring-amber-100">
                  <p className="text-xs font-medium text-amber-800/80">Comprometida</p>
                  <p className="mt-1 text-xl font-semibold tabular-nums text-amber-800">{formatNumber(totalCommitted)}</p>
                </div>
                <div className="rounded-xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-100">
                  <p className="text-xs font-medium text-emerald-800/80">Saldo</p>
                  <p className="mt-1 text-xl font-semibold tabular-nums text-emerald-700">{formatNumber(totalBalance)}</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-border/60">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <caption className="sr-only">Itens da ata com quantidades, valores e saldo</caption>
                  <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2.5 font-semibold">Item</th>
                      <th className="px-3 py-2.5 font-semibold">Material</th>
                      <th className="px-3 py-2.5 text-right font-semibold">Qtd</th>
                      <th className="px-3 py-2.5 text-right font-semibold">Unitário</th>
                      <th className="px-3 py-2.5 text-right font-semibold">Total</th>
                      <th className="px-3 py-2.5 text-right font-semibold">Comprometida</th>
                      <th className="px-3 py-2.5 text-right font-semibold">Saldo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {view.items.map((row) => {
                      const source = ataItemsById[row.itemId];
                      const unitPrice = source?.unitPrice ?? 0;
                      const lineTotal = row.balance.registered * unitPrice;
                      return (
                        <tr key={row.itemId} className="hover:bg-muted/30">
                          <td className="px-3 py-3 font-medium text-foreground">{row.description}</td>
                          <td className="px-3 py-3 text-muted-foreground">
                            {row.materialId ? (lookups.materialLabel[row.materialId] ?? "—") : "—"}
                          </td>
                          <td className="px-3 py-3 text-right tabular-nums">{formatNumber(row.balance.registered)}</td>
                          <td className="px-3 py-3 text-right tabular-nums">{formatCurrency(unitPrice)}</td>
                          <td className="px-3 py-3 text-right tabular-nums font-medium">{formatCurrency(lineTotal)}</td>
                          <td className="px-3 py-3 text-right tabular-nums text-amber-800">{formatNumber(row.balance.committed)}</td>
                          <td className="px-3 py-3 text-right tabular-nums font-semibold text-emerald-700">
                            {formatNumber(row.balance.balance)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Ativar / prorrogar */}
            {canManage && (isDraft || (view.ata.status === "vigente" && isValid && view.ata.extensions.length < ATA_MAX_EXTENSIONS)) ? (
              <section
                aria-label="Ações da ata"
                className="mb-8 rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/8 via-card to-card p-5 shadow-xs"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-primary">
                      <ScrollText className="size-5 shrink-0" aria-hidden />
                      {isDraft ? "Pronto para ativar?" : "Prorrogar vigência"}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {isDraft
                        ? `Confira o saldo (${formatNumber(totalBalance)}) e o valor (${formatCurrency(totalValue)}) acima. Ao ativar, a ata passa a consumir saldo em pedidos aprovados.`
                        : `Prorroga por 1 ano (até ${ATA_MAX_EXTENSIONS} vezes). Hoje: ${formatDateOnly(view.endDate)}.`}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-3">
                    {isDraft ? <AtaStepButton ataId={view.ata.id} step="activate" /> : null}
                    {!isDraft ? <AtaStepButton ataId={view.ata.id} step="extend" /> : null}
                  </div>
                </div>
              </section>
            ) : null}

            <section aria-label="Processo e contratos" className="surface-card mb-8 max-w-2xl space-y-4 p-6">
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
              {canManage ? (
                <LinkProcessForm
                  action={linkAtaProcessFormAction}
                  entityIdName="ataId"
                  entityId={view.ata.id}
                  processes={processes}
                  current={view.ata.processId ?? null}
                />
              ) : null}
              {canManage && view.ata.processId ? (
                <div className="space-y-3 border-t border-border/70 pt-4">
                  <h3 className="text-sm font-medium">Vincular um contrato a este processo</h3>
                  {councilContracts.length > 0 ? (
                    <LinkContractToProcessForm processId={view.ata.processId} contracts={councilContracts} />
                  ) : (
                    <Link
                      href={`/contratos/novo?processId=${view.ata.processId}`}
                      className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Cadastrar o primeiro contrato deste processo
                    </Link>
                  )}
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
