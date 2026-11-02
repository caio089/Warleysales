import type { Metadata } from "next";
import { Suspense } from "react";
import { loadScreen } from "@/server/screen";
import { formatPercent } from "@/shared/lib/format";
import { KpiCard } from "@/shared/ui/kpi-card";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";

export const metadata: Metadata = { title: "Dashboard" };

/**
 * Painel: administrador central vê o consolidado de todos os conselhos; demais perfis,
 * o dos seus conselhos (o escopo é aplicado nos serviços, R14).
 */
async function DashboardContent() {
  const result = await loadScreen(({ services, actor }) => services.reports.operationalSummary(actor));
  return (
    <Screen result={result}>
      {(s) => (
        <div className="space-y-6">
          <section aria-label="Processos" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Processos" value={s.processes.total} />
            <KpiCard label="Documentação completa" value={s.processes.completed} />
            <KpiCard label="Documentação pendente" value={s.processes.pending} />
            <KpiCard label="Progresso médio" value={s.processes.averageProgress === null ? null : formatPercent(s.processes.averageProgress)} />
          </section>
          <section aria-label="Estoque, contratos e atas" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Itens críticos" value={s.stock.critical} hint={`${s.stock.withoutAvailability} sem disponibilidade`} />
            <KpiCard label="Contratos a vencer (30 dias)" value={s.contracts.expiring30} hint={`${s.contracts.expired} vencido(s)`} />
            <KpiCard label="Contratos" value={s.contracts.total} />
            <KpiCard label="Atas de registro de preços" value={s.atas.total} hint={`${s.atas.expired} vencida(s)`} />
          </section>
        </div>
      )}
    </Screen>
  );
}

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" description="Visão geral dos conselhos conforme o seu acesso." />
      <Suspense fallback={<LoadingState />}>
        <DashboardContent />
      </Suspense>
    </>
  );
}
