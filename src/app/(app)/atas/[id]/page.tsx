import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { loadLookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { ok } from "@/shared/lib/result";
import { can } from "@/shared/lib/authz/policy";
import { formatDateOnly } from "@/shared/lib/time";
import { LoadingState } from "@/shared/ui/feedback-states";
import { AtaStepButton, LinkContractToProcessForm, LinkProcessForm } from "@/shared/ui/forms/link-process-form";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { SimpleTable } from "@/shared/ui/simple-table";
import { linkAtaProcessFormAction } from "@/modules/atas/actions";
import { ATA_MAX_EXTENSIONS } from "@/modules/atas/domain/validity";
import { AllocationForm } from "./allocation-form";

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
    return ok({
      view: view.data,
      lookups: lookups.data,
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
      {({ view, lookups, canManage, processes, processHref, processLabel, relatedContracts, councilContracts }) => (
        <>
          <PageHeader title={`Ata ${view.ata.number}`} description={`Vigência até ${formatDateOnly(view.endDate)} · ${view.validity === "vigente" ? "vigente" : "vencida"} · ${view.ata.status === "rascunho" ? "rascunho (não consome saldo)" : "ativa"}`} />
          <section aria-label="Processo e contratos" className="surface-card mb-8 max-w-lg space-y-4 p-6">
            <div>
              <h2 className="font-heading text-lg font-medium tracking-tight text-primary">Processo vinculado</h2>
              <p className="text-sm text-muted-foreground">
                {processHref && processLabel ? <Link href={processHref} className="font-medium text-primary underline-offset-4 hover:underline">Processo {processLabel}</Link> : "Nenhum processo vinculado."}
                {relatedContracts.length > 0 ? " Contratos deste processo: " : null}
                {relatedContracts.map((contract, index) => (
                  <span key={contract.id}>
                    {index > 0 ? ", " : null}
                    <Link href={`/contratos/${contract.id}`} className="font-medium text-primary underline-offset-4 hover:underline">{contract.label}</Link>
                  </span>
                ))}
              </p>
            </div>
            {canManage ? (
              <LinkProcessForm action={linkAtaProcessFormAction} entityIdName="ataId" entityId={view.ata.id} processes={processes} current={view.ata.processId ?? null} />
            ) : null}
            {canManage && view.ata.processId ? (
              <div className="space-y-3 border-t border-border/70 pt-4">
                <h3 className="text-sm font-medium">Vincular um contrato a este processo</h3>
                {councilContracts.length > 0 ? (
                  <LinkContractToProcessForm processId={view.ata.processId} contracts={councilContracts} />
                ) : (
                  <Link href={`/contratos/novo?processId=${view.ata.processId}`} className="text-sm font-medium text-primary underline-offset-4 hover:underline">Cadastrar o primeiro contrato deste processo</Link>
                )}
              </div>
            ) : null}
          </section>
          <div className="space-y-8">
            <SimpleTable
              caption="Saldo por item"
              rows={view.items.map((i) => ({
                id: i.itemId,
                description: i.description,
                material: i.materialId ? (lookups.materialLabel[i.materialId] ?? "—") : "—",
                registered: i.balance.registered,
                committed: i.balance.committed,
                balance: i.balance.balance,
                allocation: i.allocations.length ? i.allocations.map((a) => `${lookups.councilLabel[a.councilId] ?? "—"}: ${a.quantity}`).join("; ") : "Comum",
              }))}
              columns={[
                { key: "description", header: "Item" },
                { key: "material", header: "Material" },
                { key: "registered", header: "Registrada", kind: "number" },
                { key: "committed", header: "Comprometida", kind: "number" },
                { key: "balance", header: "Saldo", kind: "number" },
                { key: "allocation", header: "Alocação" },
              ]}
            />
            {canManage ? (
              <div className="flex flex-wrap gap-3">
                {view.ata.status === "rascunho" ? <AtaStepButton ataId={view.ata.id} step="activate" /> : null}
                {view.ata.status === "vigente" && view.validity === "vigente" && view.ata.extensions.length < ATA_MAX_EXTENSIONS ? (
                  <AtaStepButton ataId={view.ata.id} step="extend" />
                ) : null}
              </div>
            ) : null}
            {canManage ? (
              <AllocationForm
                ataId={view.ata.id}
                items={view.items.map((i) => ({ value: i.itemId, label: i.description }))}
                councils={lookups.councils.map((c) => ({ value: c.id, label: c.label }))}
              />
            ) : null}
            {view.ata.extensions.length > 0 ? (
              <section aria-labelledby="prorrog"><h2 id="prorrog" className="mb-2 text-base font-semibold">Prorrogações</h2>
                <ul className="text-sm">{view.ata.extensions.map((e, i) => <li key={i}>{formatDateOnly(e.previousEndDate)} → {formatDateOnly(e.newEndDate)} · {e.legalBasis}</li>)}</ul>
              </section>
            ) : null}
          </div>
        </>
      )}
    </Screen>
  );
}

export default function AtaPage({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense fallback={<LoadingState />}><Content params={params} /></Suspense>;
}
