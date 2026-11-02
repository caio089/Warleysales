import type { Metadata } from "next";
import { Suspense } from "react";
import { loadScreen } from "@/server/screen";
import { formatPercent } from "@/shared/lib/format";
import { LoadingState } from "@/shared/ui/feedback-states";
import { KpiCard } from "@/shared/ui/kpi-card";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { presentationOf, PROCESS_STATUS } from "@/shared/ui/status-presentation";

export const metadata: Metadata = { title: "Relatórios" };

async function Content() {
  const result = await loadScreen(({ services, actor }) => services.reports.operationalSummary(actor));
  return (
    <Screen result={result}>
      {(s) => (
        <div className="space-y-6">
          <section aria-labelledby="proc"><h2 id="proc" className="mb-3 text-base font-semibold">Processos por situação</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Object.keys(s.processes.byStatus).length === 0 ? <p className="text-sm text-muted-foreground">Nenhum processo no período.</p> : null}
              {Object.entries(s.processes.byStatus).map(([status, count]) => <KpiCard key={status} label={presentationOf(PROCESS_STATUS, status).label} value={count} />)}
              <KpiCard label="Progresso documental médio" value={s.processes.averageProgress === null ? null : formatPercent(s.processes.averageProgress)} />
            </div>
          </section>
          <section aria-labelledby="est"><h2 id="est" className="mb-3 text-base font-semibold">Estoque, contratos e atas</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard label="Itens críticos" value={s.stock.critical} />
              <KpiCard label="Sem disponibilidade" value={s.stock.withoutAvailability} />
              <KpiCard label="Contratos vencendo em 30 dias" value={s.contracts.expiring30} />
              <KpiCard label="Atas vencidas" value={s.atas.expired} />
            </div>
          </section>
        </div>
      )}
    </Screen>
  );
}

export default function ReportsPage() {
  return (<><PageHeader title="Relatórios" description="Indicadores calculados a partir dos dados reais, limitados ao seu acesso." /><Suspense fallback={<LoadingState />}><Content /></Suspense></>);
}
