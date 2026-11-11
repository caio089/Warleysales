import type { Metadata } from "next";
import { Suspense } from "react";
import {
  PackageX,
  ShoppingCart,
  TrendingDown,
  Truck,
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
import { OrderQueue, type PendingOrderItem } from "./order-queue";
import {
  AlertsPanel,
  DeadlinesPanel,
  DeliveriesSummaryPanel,
  RecentRequestsPanel,
  ReplenishmentPanel,
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
      pendingOrdersRes,
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
      ctx.actor.isCentralAdmin
        ? ctx.services.orders.list(ctx.actor, { status: "pendente", ...(councilId ? { councilId } : {}) })
        : Promise.resolve(ok([])),
    ]);
    if (!dash.ok) return dash;
    if (!alerts.ok) return alerts;
    if (!lookups.ok) return lookups;
    if (!requests.ok) return requests;
    if (!meetings.ok) return meetings;
    if (!stockLevels.ok) return stockLevels;
    if (!pendingFormalizations.ok) return pendingFormalizations;
    if (!savingsSummary.ok) return savingsSummary;
    if (!pendingOrdersRes.ok) return pendingOrdersRes;

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

    const pendingOrderQueue: PendingOrderItem[] = pendingOrdersRes.data.map((o) => ({
      id: o.id,
      number: o.number,
      councilId: o.councilId,
      councilName: lookups.data.councilLabel[o.councilId] ?? o.councilId,
      requestedBy: o.requestedBy,
      notes: o.notes,
      createdAt: o.createdAt,
      items: o.items.map((it) => ({
        materialId: it.materialId,
        materialName: lookups.data.materialLabel[it.materialId] ?? it.materialId,
        quantity: it.quantity,
      })),
    }));

    return ok({
      dash: dash.data,
      alerts: alerts.data,
      lookups: lookups.data,
      requests: requests.data,
      meetings: meetings.data,
      stockLevels: stockLevels.data,
      pendingQueue,
      pendingOrderQueue,
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
        pendingOrderQueue,
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

        const alertItems = alerts.items.slice(0, 4).map((n) => ({
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

            {/* Fila de Expedição de Warley (Pedidos de Materiais) */}
            {isWarley ? (
              <OrderQueue items={pendingOrderQueue} />
            ) : null}

            {/* Ilha de Inteligência Artificial — Briefing Operacional em tempo real */}
            <Suspense fallback={<BriefingFallback />}>
              <BriefingCard facts={facts} />
            </Suspense>

            {/* Grid Estratégico de Indicadores-Chave (4 KPIs Mestres) */}
            <section aria-label="Indicadores Prioritários" className="space-y-3">
              <SectionLabel>Indicadores Estratégicos da Operação</SectionLabel>
              <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
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
                  icon={<TrendingDown className="size-4" aria-hidden />}
                  label="Economia Gerada"
                  value={formatCurrency(savingsSummary.totalSavings)}
                  hint={`${formatPercent(savingsSummary.averageSavingsPercent)} redução média`}
                />
              </div>
            </section>

            {/* Grade Principal da Operação (2 Colunas Balanceadas) */}
            <div className="grid gap-6 lg:grid-cols-2 items-start">
              <div className="space-y-6">
                <RecentRequestsPanel items={recentRequests} />
                <ReplenishmentPanel items={replenishmentItems} />
                <DeliveriesSummaryPanel delivered={deliveredUnits} pending={pendingDeliveryUnits} />
              </div>
              <div className="space-y-6">
                <UpcomingMeetingsPanel items={upcomingMeetings.slice(0, 4)} />
                <AlertsPanel items={alertItems} unread={alerts.unread} />
                {showPrazos && dash.deadlines.length > 0 ? (
                  <DeadlinesPanel items={dash.deadlines} />
                ) : null}
                {showDocs ? (
                  <StatusDistribution rows={dash.processStatuses} total={s.processes.total} />
                ) : null}
              </div>
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
