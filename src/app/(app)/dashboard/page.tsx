import type { Metadata } from "next";
import { Suspense } from "react";
import { ClipboardList, FileCheck2, FileWarning, Gauge, PackageX, ScrollText, Timer, Warehouse } from "lucide-react";
import { buildBriefingFacts } from "@/modules/insights/briefing";
import { parseDashboardQuery } from "@/modules/reports/dashboard-query";
import { loadLookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { canInAnyCouncil } from "@/shared/lib/authz/policy";
import { formatPercent } from "@/shared/lib/format";
import { ok } from "@/shared/lib/result";
import { StartHereCard } from "@/shared/ui/flow-guide";
import { KpiCard } from "@/shared/ui/kpi-card";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader, SectionLabel } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { BriefingCard, BriefingFallback } from "./briefing-card";
import { DashboardFilters } from "./filters";
import { AlertsPanel, AttentionPanel, DeadlinesPanel, ShortcutGrid, StatusDistribution } from "./panels";

export const metadata: Metadata = { title: "Dashboard" };

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

async function DashboardContent({
  searchParams,
}: {
  searchParams: PageProps<"/dashboard">["searchParams"];
}) {
  const raw = await searchParams;
  const { councilId, focus } = parseDashboardQuery({
    councilId: one(raw.councilId),
    focus: one(raw.focus),
  });
  const result = await loadScreen(async (ctx) => {
    const [dash, alerts, lookups] = await Promise.all([
      ctx.services.reports.dashboard(ctx.actor, { councilId }),
      ctx.services.notifications.listMine(ctx.actor),
      loadLookups(ctx),
    ]);
    if (!dash.ok) return dash;
    if (!alerts.ok) return alerts;
    if (!lookups.ok) return lookups;
    return ok({ dash: dash.data, alerts: alerts.data, lookups: lookups.data, canCreateProcess: canInAnyCouncil(ctx.actor, "process.create") });
  });

  const showDocs = focus === "todos" || focus === "documentos" || focus === "atencao";
  const showOps = focus === "todos" || focus === "atencao" || focus === "prazos";
  const showPrazos = focus === "todos" || focus === "prazos" || focus === "atencao";

  return (
    <Screen result={result}>
      {({ dash, alerts, lookups, canCreateProcess }) => {
        const councilLabel = councilId ? (lookups.councilLabel[councilId] ?? null) : null;
        const facts = buildBriefingFacts({
          summary: dash.summary,
          councilLabel,
          unreadAlerts: alerts.unread,
          alertTitles: alerts.items.filter((n) => !n.readAt).map((n) => n.title),
        });
        const alertItems = alerts.items.slice(0, 5).map((n) => ({
          id: n.id,
          title: n.title,
          body: n.body,
          unread: n.readAt === null,
          at: n.createdAt.toISOString(),
          href: n.entityType === "contract" ? `/contratos/${n.entityId}` : `/atas/${n.entityId}`,
        }));
        const s = dash.summary;

        return (
          <div className="space-y-8">
            <section aria-label="Comece por aqui" className="grid gap-4 md:grid-cols-3">
              <StartHereCard
                step={1}
                href="/meu-conselho"
                title="Painel do meu conselho"
                description="Solicitações, documentos, estoque e reuniões do seu conselho em um só lugar."
                cta="Abrir meu conselho"
              />
              <StartHereCard
                step={2}
                href={canCreateProcess ? "/processos/novo" : "/processos"}
                title="Cadastrar documentos"
                description="Abra um processo e anexe os 7 tipos. O progresso sobe sozinho."
                cta={canCreateProcess ? "Abrir novo processo" : "Ver processos"}
              />
              <StartHereCard
                step={3}
                href="/solicitacoes/nova"
                title="Pedir material"
                description="Criar → enviar → aprovar → receber. Estoque só muda no recebimento."
                cta="Nova solicitação"
              />
            </section>

            <DashboardFilters councils={lookups.councils} councilId={councilId} focus={focus} />

            <Suspense fallback={<BriefingFallback />}>
              <BriefingCard facts={facts} />
            </Suspense>

            {showDocs ? (
              <section aria-label="Processos" className="space-y-3">
                <SectionLabel>Processos</SectionLabel>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <KpiCard href="/processos" icon={<ClipboardList className="size-4" aria-hidden />} label="Processos" value={s.processes.total} />
                  <KpiCard href="/processos" icon={<FileCheck2 className="size-4" aria-hidden />} label="Documentação completa" value={s.processes.completed} />
                  <KpiCard href="/processos" icon={<FileWarning className="size-4" aria-hidden />} label="Documentação pendente" value={s.processes.pending} accent={s.processes.pending > 0} />
                  <KpiCard icon={<Gauge className="size-4" aria-hidden />} label="Progresso médio" value={s.processes.averageProgress === null ? null : formatPercent(s.processes.averageProgress)} />
                </div>
              </section>
            ) : null}

            {showOps ? (
              <section aria-label="Estoque, contratos e atas" className="space-y-3">
                <SectionLabel>Estoque, contratos e atas</SectionLabel>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <KpiCard href="/estoque" accent icon={<PackageX className="size-4" aria-hidden />} label="Itens críticos" value={s.stock.critical} hint={`${s.stock.withoutAvailability} sem disponibilidade`} />
                  <KpiCard href="/contratos" accent icon={<Timer className="size-4" aria-hidden />} label="Contratos a vencer (30 dias)" value={s.contracts.expiring30} hint={`${s.contracts.expired} vencido(s)`} />
                  <KpiCard href="/contratos" icon={<Warehouse className="size-4" aria-hidden />} label="Contratos" value={s.contracts.total} />
                  <KpiCard href="/atas" icon={<ScrollText className="size-4" aria-hidden />} label="Atas de registro de preços" value={s.atas.total} hint={`${s.atas.expired} vencida(s)`} />
                </div>
              </section>
            ) : null}

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="dash-panel h-full">
                <AlertsPanel items={alertItems} unread={alerts.unread} />
              </div>
              <div className="dash-panel h-full">
                <AttentionPanel items={dash.attention} />
              </div>
              <div className="dash-panel h-full">
                {showPrazos ? (
                  <DeadlinesPanel items={dash.deadlines} />
                ) : (
                  <StatusDistribution rows={dash.processStatuses} total={s.processes.total} />
                )}
              </div>
            </div>

            {showDocs && showPrazos ? <StatusDistribution rows={dash.processStatuses} total={s.processes.total} /> : null}

            <div className="space-y-3">
              <SectionLabel>Atalhos</SectionLabel>
              <ShortcutGrid canCreateProcess={canCreateProcess} />
            </div>
          </div>
        );
      }}
    </Screen>
  );
}

export default function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  return (
    <>
      <PageHeader
        eyebrow="Conselhos"
        title="Painel operacional"
        description="Comece pelos 3 atalhos abaixo. Os números são reais do banco — alertas, prazos e documentação do seu escopo."
      />
      <Suspense fallback={<LoadingState />}>
        <DashboardContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}
