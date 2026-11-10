import type { Metadata } from "next";
import { Suspense } from "react";
import {
  Building2,
  CalendarDays,
  ClipboardList,
  FileCheck2,
  FileWarning,
  Package,
  PackageX,
  ScrollText,
  ShoppingCart,
  Timer,
  TrendingDown,
  Truck,
  Warehouse,
} from "lucide-react";
import { buildBriefingFacts } from "@/modules/insights/briefing";
import { parseDashboardQuery } from "@/modules/reports/dashboard-query";
import { loadLookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { canInAnyCouncil } from "@/shared/lib/authz/policy";
import { formatCurrency, formatPercent } from "@/shared/lib/format";
import { ok } from "@/shared/lib/result";
import { KpiCard } from "@/shared/ui/kpi-card";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader, SectionLabel } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { BriefingCard, BriefingFallback } from "./briefing-card";
import { DashboardFilters } from "./filters";
import { FormalizationQueue, type PendingFormalizationItem } from "./formalization-queue";
import {
  AlertsPanel,
  AttentionPanel,
  DeadlinesPanel,
  DeliveriesSummaryPanel,
  RecentRequestsPanel,
  ReplenishmentPanel,
  ShortcutGrid,
  StatusDistribution,
  UpcomingMeetingsPanel,
} from "./panels";

export const metadata: Metadata = { title: "Central Operacional" };

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

async function DashboardContent({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const raw = await searchParams;
  const { councilId, focus } = parseDashboardQuery({
    councilId: one(raw.councilId),
    focus: one(raw.focus),
  });

  const result = await loadScreen(async (ctx) => {
    const [
      dash,
      alerts,
      lookups,
      requests,
      meetings,
      stockLevels,
      pendingFormalizations,
      savingsSummary,
      suppliersRes,
      processesRes,
    ] = await Promise.all([
      ctx.services.reports.dashboard(ctx.actor, { councilId }),
      ctx.services.notifications.listMine(ctx.actor),
      loadLookups(ctx),
      ctx.services.purchases.list(ctx.actor),
      ctx.services.meetings.list(ctx.actor),
      ctx.services.inventory.listLevels(ctx.actor, councilId),
      ctx.actor.isCentralAdmin ? ctx.services.formalizations.listPending(ctx.actor) : Promise.resolve(ok([])),
      ctx.services.formalizations.getSavingsSummary(ctx.actor, councilId),
      ctx.services.suppliers.list(ctx.actor),
      ctx.services.processes.list(ctx.actor),
    ]);
    if (!dash.ok) return dash;
    if (!alerts.ok) return alerts;
    if (!lookups.ok) return lookups;
    if (!requests.ok) return requests;
    if (!meetings.ok) return meetings;
    if (!stockLevels.ok) return stockLevels;
    if (!pendingFormalizations.ok) return pendingFormalizations;
    if (!savingsSummary.ok) return savingsSummary;

    const suppliers = suppliersRes.ok ? suppliersRes.data : [];
    const processes = processesRes.ok ? processesRes.data : [];
    const supplierMap = Object.fromEntries(suppliers.map((s) => [s.id, s.name]));
    const processMap = Object.fromEntries(processes.map((p) => [p.process.id, p.process]));

    const pendingQueue: PendingFormalizationItem[] = pendingFormalizations.data.map((f) => ({
      id: f.id,
      processId: f.processId,
      processNumber: processMap[f.processId]?.number ?? f.processId.slice(0, 8),
      processTitle: processMap[f.processId]?.title ?? "",
      councilId: f.councilId,
      councilName: lookups.data.councilLabel[f.councilId] ?? f.councilId,
      supplierId: f.supplierId,
      supplierName: supplierMap[f.supplierId] ?? "Fornecedor",
      instrumentType: f.instrumentType,
      instrumentNumber: f.instrumentNumber,
      estimatedValue: f.estimatedValue,
      contractedValue: f.contractedValue,
      savingsValue: f.savingsValue,
      savingsPercent: f.savingsPercent,
      createdAt: f.createdAt,
    }));

    return ok({
      dash: dash.data,
      alerts: alerts.data,
      lookups: lookups.data,
      requests: requests.data,
      meetings: meetings.data,
      stockLevels: stockLevels.data,
      pendingQueue,
      savingsSummary: savingsSummary.data,
      isWarley: ctx.actor.isCentralAdmin,
      canCreateProcess: canInAnyCouncil(ctx.actor, "process.create"),
      canDecideRequest: canInAnyCouncil(ctx.actor, "request.decide"),
    });
  });

  const showDocs = focus === "todos" || focus === "documentos";
  const showPrazos = focus === "todos" || focus === "prazos" || focus === "atencao";

  return (
    <Screen result={result}>
      {({
        dash,
        alerts,
        lookups,
        requests,
        meetings,
        stockLevels,
        pendingQueue,
        savingsSummary,
        isWarley,
        canCreateProcess,
      }) => {
        const councilLabel = councilId ? (lookups.councilLabel[councilId] ?? null) : null;

        // Filtro de escopo por empresa
        const scopedRequests = councilId ? requests.filter((r) => r.councilId === councilId) : requests;
        const scopedMeetings = councilId ? meetings.filter((m) => m.councilId === councilId) : meetings;

        // Cálculos operacionais de solicitações
        const reqPending = scopedRequests.filter((r) =>
          ["enviada", "em_analise", "aguardando_correcao"].includes(r.status),
        ).length;
        const reqInProgress = scopedRequests.filter((r) =>
          ["aprovada", "em_atendimento", "parcialmente_atendida"].includes(r.status),
        ).length;
        const reqCompleted = scopedRequests.filter((r) => r.status === "atendida").length;

        // Entregas realizadas vs pendentes
        let deliveredUnits = 0;
        let pendingDeliveryUnits = 0;
        scopedRequests.forEach((r) => {
          if (["aprovada", "em_atendimento", "parcialmente_atendida", "atendida"].includes(r.status)) {
            r.items.forEach((item) => {
              deliveredUnits += Number(item.receivedTotal || 0);
              if (["aprovada", "em_atendimento", "parcialmente_atendida"].includes(r.status)) {
                pendingDeliveryUnits += Math.max(0, Number(item.quantity) - Number(item.receivedTotal || 0));
              }
            });
          }
        });

        // Estoque crítico / empresas com necessidade de reposição
        const replenishmentItems = stockLevels
          .filter((l) => l.level !== "normal")
          .map((l) => ({
            companyId: l.councilId,
            company: lookups.councilLabel[l.councilId] ?? "Empresa",
            material: lookups.materialLabel[l.materialId] ?? "Material",
            available: l.available,
            minimum: l.minimum,
            level: l.level,
          }));

        // Próximas reuniões
        const upcomingMeetings = scopedMeetings
          .filter((m) => m.status === "agendada")
          .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
          .map((m) => ({
            id: m.id,
            title: m.title,
            company: lookups.councilLabel[m.councilId] ?? "Empresa",
            scheduledAt: m.scheduledAt.toISOString(),
          }));

        // Solicitações recentes para o painel operacional
        const recentRequests = [...scopedRequests]
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 6)
          .map((r) => ({
            id: r.id,
            title: r.title,
            company: lookups.councilLabel[r.councilId] ?? "Órgão",
            status: r.status,
            createdAt: r.createdAt.toISOString(),
            itemsCount: r.items.length,
          }));

        // Fatos enriquecidos para IA
        const facts = buildBriefingFacts({
          summary: dash.summary,
          councilLabel,
          totalCompanies: lookups.councils.length,
          requestsSummary: {
            pending: reqPending,
            inProgress: reqInProgress,
            completed: reqCompleted,
          },
          stockAttention: replenishmentItems.slice(0, 5),
          upcomingMeetings: upcomingMeetings.slice(0, 3).map((m) => ({
            company: m.company,
            title: m.title,
            scheduledAt: m.scheduledAt,
          })),
          pendingDeliveriesCount: pendingDeliveryUnits,
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
            <DashboardFilters councils={lookups.councils} councilId={councilId} focus={focus} />

            {/* Fila de Veredito de Warley (Homologações de Contratações) */}
            {isWarley ? (
              <FormalizationQueue items={pendingQueue} />
            ) : null}

            {/* Ilha de Inteligência Artificial — Briefing Operacional em tempo real */}
            <Suspense fallback={<BriefingFallback />}>
              <BriefingCard facts={facts} />
            </Suspense>

            {/* Grid Estratégico de Indicadores-Chave (KPIs) */}
            <section aria-label="Indicadores Prioritários" className="space-y-3">
              <SectionLabel>Indicadores Estratégicos da Operação</SectionLabel>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <KpiCard
                  href="/conselhos"
                  icon={<Building2 className="size-4" aria-hidden />}
                  label="Órgãos Parceiros"
                  value={lookups.councils.length}
                  hint="Ativos na plataforma"
                />
                <KpiCard
                  icon={<TrendingDown className="size-4" aria-hidden />}
                  label="Economia Gerada"
                  value={formatCurrency(savingsSummary.totalSavings)}
                  hint={`${formatPercent(savingsSummary.averageSavingsPercent)} redução média`}
                />
                <KpiCard
                  href="/solicitacoes"
                  icon={<ShoppingCart className="size-4" aria-hidden />}
                  label="Solicitações Pendentes"
                  value={reqPending}
                  accent={reqPending > 0}
                  hint={`${reqInProgress} em andamento`}
                />
                <KpiCard
                  href="/solicitacoes"
                  icon={<Truck className="size-4" aria-hidden />}
                  label="Entregas Pendentes"
                  value={`${pendingDeliveryUnits} un`}
                  accent={pendingDeliveryUnits > 0}
                  hint={`${deliveredUnits} un já entregues`}
                />
                <KpiCard
                  href="/estoque"
                  icon={<PackageX className="size-4" aria-hidden />}
                  label="Estoque Crítico"
                  value={replenishmentItems.length}
                  accent={replenishmentItems.length > 0}
                  hint={replenishmentItems.length > 0 ? "Exige reposição" : "Estável"}
                />
                <KpiCard
                  href="/reunioes"
                  icon={<CalendarDays className="size-4" aria-hidden />}
                  label="Próximas Reuniões"
                  value={upcomingMeetings.length}
                  hint="Agendadas"
                />
              </div>
            </section>

            {/* Painéis Centrais da Operação: Reposição vs Solicitações */}
            <div className="grid gap-6 lg:grid-cols-2">
              <ReplenishmentPanel items={replenishmentItems} />
              <RecentRequestsPanel items={recentRequests} />
            </div>

            {/* Painéis de Acompanhamento: Entregas, Reuniões e Alertas */}
            <div className="grid gap-6 lg:grid-cols-3">
              <DeliveriesSummaryPanel delivered={deliveredUnits} pending={pendingDeliveryUnits} />
              <UpcomingMeetingsPanel items={upcomingMeetings.slice(0, 4)} />
              <AlertsPanel items={alertItems} unread={alerts.unread} />
            </div>

            {/* Processos e Documentação (quando aplicável ou selecionado no filtro) */}
            {showDocs ? (
              <section aria-label="Processos e Documentação" className="space-y-3">
                <SectionLabel>Documentação e Governança</SectionLabel>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <KpiCard href="/processos" icon={<ClipboardList className="size-4" aria-hidden />} label="Processos Totais" value={s.processes.total} />
                  <KpiCard href="/processos" icon={<FileCheck2 className="size-4" aria-hidden />} label="Docs Completos" value={s.processes.completed} />
                  <KpiCard href="/processos" icon={<FileWarning className="size-4" aria-hidden />} label="Docs Pendentes" value={s.processes.pending} accent={s.processes.pending > 0} />
                  <KpiCard icon={<ClipboardList className="size-4" aria-hidden />} label="Progresso Médio" value={s.processes.averageProgress === null ? null : formatPercent(s.processes.averageProgress)} />
                </div>
              </section>
            ) : null}

            {/* Prazos de Atas e Contratos */}
            {showPrazos && dash.deadlines.length > 0 ? (
              <div className="grid gap-6 lg:grid-cols-2">
                <DeadlinesPanel items={dash.deadlines} />
                <StatusDistribution rows={dash.processStatuses} total={s.processes.total} />
              </div>
            ) : null}

            {/* Atalhos Rápidos da Central de Controle */}
            <div className="space-y-3">
              <SectionLabel>Ações Rápidas</SectionLabel>
              <ShortcutGrid />
            </div>
          </div>
        );
      }}
    </Screen>
  );
}

export default function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <>
      <PageHeader
        eyebrow="Central do Warley"
        title="Painel de Controle Operacional"
        description="Acompanhamento integrado de órgãos parceiros, demandas de materiais, entregas pendentes e estoque em tempo real."
      />
      <Suspense fallback={<LoadingState />}>
        <DashboardContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}
