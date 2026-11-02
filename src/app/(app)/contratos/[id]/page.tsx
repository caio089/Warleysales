import type { Metadata } from "next";
import { Suspense } from "react";
import { loadScreen } from "@/server/screen";
import { ok } from "@/shared/lib/result";
import { can } from "@/shared/lib/authz/policy";
import { LoadingState } from "@/shared/ui/feedback-states";
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
    const view = await services.contracts.get(actor, id);
    if (!view.ok) return view;
    return ok({ view: view.data, canManage: can(actor, "contract.manage", view.data.contract.councilId) });
  });
  return (
    <Screen result={result}>
      {({ view, canManage }) => (
        <>
          <PageHeader title={`Contrato ${view.contract.number}`} description={view.contract.object} />
          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-3">
              <KpiCard label="Dias restantes" value={view.remainingDays} hint={view.status === "vencido" ? "Contrato vencido" : undefined} />
              <KpiCard label="Valor vigente" value={formatCurrency(view.terms.value)} />
              <section className="rounded-lg border p-4"><p className="mb-2 text-xs font-medium text-muted-foreground">Vigência decorrida</p><ProgressBar value={view.elapsedPercent} label="Vigência decorrida" /></section>
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
            {canManage ? <section aria-labelledby="novo-aditivo" className="max-w-lg rounded-lg border p-4"><h2 id="novo-aditivo" className="mb-4 text-base font-semibold">Registrar aditivo</h2><AmendmentForm contractId={view.contract.id} /></section> : null}
          </div>
        </>
      )}
    </Screen>
  );
}

export default function ContractPage({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense fallback={<LoadingState />}><Content params={params} /></Suspense>;
}
