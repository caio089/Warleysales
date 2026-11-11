import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { linkContractProcessFormAction } from "@/modules/contracts/actions";
import { loadScreen } from "@/server/screen";
import { ok } from "@/shared/lib/result";
import { can } from "@/shared/lib/authz/policy";
import { LoadingState } from "@/shared/ui/feedback-states";
import { LinkAtaToProcessForm, LinkProcessForm } from "@/shared/ui/forms/link-process-form";
import { KpiCard } from "@/shared/ui/kpi-card";
import { PageHeader } from "@/shared/ui/page-header";
import { ProgressBar } from "@/shared/ui/progress-bar";
import { Screen } from "@/shared/ui/screen";
import { SimpleTable } from "@/shared/ui/simple-table";
import { formatCurrency } from "@/shared/lib/format";
import { AmendmentForm } from "./amendment-form";

export const metadata: Metadata = { title: "Contrato" };

async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await loadScreen(async ({ services, actor }) => {
    const [view, processes, atas] = await Promise.all([
      services.contracts.get(actor, id),
      services.processes.list(actor),
      services.atas.list(actor),
    ]);
    if (!view.ok) return view;
    if (!processes.ok) return processes;
    if (!atas.ok) return atas;
    const councilId = view.data.contract.councilId;
    const processId = view.data.contract.processId ?? null;
    return ok({
      view: view.data,
      canManage: can(actor, "contract.manage", councilId),
      processes: processes.data
        .filter((item) => item.process.councilId === councilId)
        .map((item) => ({ value: item.process.id, label: `${item.process.number} — ${item.process.title}` })),
      processHref: processId ? `/processos/${processId}` : null,
      processLabel: processes.data.find((item) => item.process.id === processId)?.process.number ?? null,
      relatedAtas: processId
        ? atas.data
          .filter((item) => item.ata.processId === processId)
          .map((item) => ({ id: item.ata.id, label: item.ata.number }))
        : [],
      councilAtas: atas.data
        .filter((item) => item.ata.councilId === councilId)
        .map((item) => ({ value: item.ata.id, label: item.ata.number })),
    });
  });
  return (
    <Screen result={result}>
      {({ view, canManage, processes, processHref, processLabel, relatedAtas, councilAtas }) => (
        <>
          <PageHeader title={`Contrato ${view.contract.number}`} description={view.contract.object} />
          <section aria-label="Processo e atas" className="surface-card mb-8 max-w-lg space-y-4 p-6">
            <div>
              <h2 className="font-heading text-lg font-medium tracking-tight text-primary">Processo vinculado</h2>
              <p className="text-sm text-muted-foreground">
                {processHref && processLabel ? <Link href={processHref} className="font-medium text-primary underline-offset-4 hover:underline">Processo {processLabel}</Link> : "Nenhum processo vinculado."}
                {relatedAtas.length > 0 ? " Atas deste processo: " : null}
                {relatedAtas.map((ata, index) => (
                  <span key={ata.id}>
                    {index > 0 ? ", " : null}
                    <Link href={`/atas/${ata.id}`} className="font-medium text-primary underline-offset-4 hover:underline">{ata.label}</Link>
                  </span>
                ))}
              </p>
            </div>
            {canManage ? (
              <LinkProcessForm action={linkContractProcessFormAction} entityIdName="contractId" entityId={view.contract.id} processes={processes} current={view.contract.processId ?? null} />
            ) : null}
            {canManage && view.contract.processId ? (
              <div className="space-y-3 border-t border-border/70 pt-4">
                <h3 className="text-sm font-medium">Vincular uma ata a este processo</h3>
                {councilAtas.length > 0 ? (
                  <LinkAtaToProcessForm processId={view.contract.processId} atas={councilAtas} />
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhuma ata deste órgão para vincular.</p>
                )}
              </div>
            ) : null}
          </section>
          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-3">
              <KpiCard label="Dias restantes" value={view.remainingDays} hint={view.status === "vencido" ? "Contrato vencido" : undefined} />
              <KpiCard label="Valor vigente" value={formatCurrency(view.terms.value)} />
              <section className="surface-card p-5"><p className="mb-2 text-[0.7rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">Vigência decorrida</p><ProgressBar value={view.elapsedPercent} label="Vigência decorrida" /></section>
            </div>
            <section aria-labelledby="aditivos"><h2 id="aditivos" className="mb-2 text-base font-semibold">Histórico de aditivos</h2>
              <SimpleTable
                caption="Aditivos do contrato"
                rows={view.contract.amendments.map((a) => ({ id: String(a.sequence), sequence: a.sequence, signedAt: a.signedAt, reason: a.reason, previousEnd: a.previous.endDate, nextEnd: a.next.endDate, previousValue: a.previous.value, nextValue: a.next.value }))}
                columns={[{ key: "sequence", header: "Nº", kind: "number" }, { key: "signedAt", header: "Assinado em", kind: "date" }, { key: "reason", header: "Justificativa" }, { key: "previousEnd", header: "Fim anterior", kind: "date" }, { key: "nextEnd", header: "Novo fim", kind: "date" }, { key: "previousValue", header: "Valor anterior", kind: "currency" }, { key: "nextValue", header: "Novo valor", kind: "currency" }]}
                emptyTitle="Sem aditivos"
                emptyDescription="Os termos originais continuam vigentes."
              />
            </section>
            {canManage ? <section aria-labelledby="novo-aditivo" className="surface-card max-w-lg p-6"><h2 id="novo-aditivo" className="mb-4 font-heading text-lg font-medium tracking-tight text-primary">Registrar aditivo</h2><AmendmentForm contractId={view.contract.id} /></section> : null}
          </div>
        </>
      )}
    </Screen>
  );
}

export default function ContractPage({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense fallback={<LoadingState />}><Content params={params} /></Suspense>;
}
