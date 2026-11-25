import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  ClipboardList,
  FilePlus,
  Moon,
  Package,
  PackageX,
  ShoppingCart,
  Sun,
  Sunrise,
  TrendingDown,
  Truck,
} from "lucide-react";
import { buildBriefingFacts } from "@/modules/insights/briefing";
import { parseDashboardQuery } from "@/modules/reports/dashboard-query";
import { loadLookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { getSession } from "@/server/session";
import { formatCurrency, formatPercent } from "@/shared/lib/format";
import { can, canInAnyCouncil } from "@/shared/lib/authz/policy";
import { APP_TIME_ZONE } from "@/shared/lib/time";
import { cn } from "@/lib/utils";
import { ok } from "@/shared/lib/result";
import { KpiCard } from "@/shared/ui/kpi-card";
import { LoadingState } from "@/shared/ui/feedback-states";
import { Screen } from "@/shared/ui/screen";
import { CouncilWorkspace } from "./council-workspace";
import { BriefingCard, BriefingFallback } from "./briefing-card";
import { DashboardFilters } from "./filters";
import { ApprovalQueue, type PendingApprovalItem } from "./approval-queue";
import { FormalizationQueue, type PendingFormalizationItem } from "./formalization-queue";
import { OrderQueue, type PendingOrderItem } from "./order-queue";
import {
  AgendaAndDeadlinesPanel,
  AlertsPanel,
  DeadlinesPanel,
  RecentRequestsPanel,
  ReplenishmentPanel,
  StatusDistribution,
} from "./panels";

export const metadata: Metadata = { title: "Central Operacional" };

const quickActions = [
  { href: "/solicitacoes/nova", icon: FilePlus, title: "Nova solicitação", description: "Registre um pedido de compra ou serviço." },
  { href: "/processos", icon: ClipboardList, title: "Acompanhar processos", description: "Confira o andamento e as etapas dos processos." },
  { href: "/estoque", icon: Package, title: "Consultar estoque", description: "Veja os materiais disponíveis e seus saldos." },
  { href: "/calendario", icon: CalendarDays, title: "Ver agenda", description: "Consulte os próximos compromissos e prazos." },
] as const;

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
      pendingFormalizations,
      savingsSummary,
      suppliersRes,
      pendingOrdersRes,
      councilOrdersRes,
    ] = await Promise.all([
      ctx.services.reports.dashboard(ctx.actor, { councilId }),
      ctx.services.notifications.listMine(ctx.actor),
      loadLookups(ctx),
      ctx.services.purchases.list(ctx.actor),
      ctx.services.meetings.list(ctx.actor),
      ctx.actor.isCentralAdmin ? ctx.services.formalizations.listPending(ctx.actor) : Promise.resolve(ok([])),
      ctx.services.formalizations.getSavingsSummary(ctx.actor, councilId),
      ctx.services.suppliers.list(ctx.actor),
      ctx.actor.isCentralAdmin
        ? ctx.services.orders.list(ctx.actor, { status: "pendente", ...(councilId ? { councilId } : {}) })
        : Promise.resolve(ok([])),
      ctx.services.orders.list(ctx.actor, councilId ? { councilId } : {}),
    ]);
    if (!dash.ok) return dash;
    if (!alerts.ok) return alerts;
    if (!lookups.ok) return lookups;
    if (!requests.ok) return requests;
    if (!meetings.ok) return meetings;
    const stockLevels = dash.data.stockLevels;
    if (!pendingFormalizations.ok) return pendingFormalizations;
    if (!savingsSummary.ok) return savingsSummary;
    if (!pendingOrdersRes.ok) return pendingOrdersRes;
    if (!councilOrdersRes.ok) return councilOrdersRes;

    const actionCouncilId = councilId ?? (lookups.data.councils.length === 1 ? lookups.data.councils[0]!.id : null);

    const suppliers = suppliersRes.ok ? suppliersRes.data : [];
    const supplierMap = Object.fromEntries(suppliers.map((s) => [s.id, s.name]));
    const processMap = Object.fromEntries(dash.data.processRefs.map((p) => [p.id, p]));

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

    const workspaceOrders = actionCouncilId
      ? councilOrdersRes.data.filter((order) => order.councilId === actionCouncilId)
      : [];
    const workspaceStock = actionCouncilId
      ? stockLevels.filter((level) => level.councilId === actionCouncilId)
      : [];

    return ok({
      dash: dash.data,
      alerts: alerts.data,
      lookups: lookups.data,
      requests: requests.data,
      meetings: meetings.data,
      stockLevels,
      pendingQueue,
      pendingOrderQueue,
      savingsSummary: savingsSummary.data,
      isWarley: ctx.actor.isCentralAdmin,
      canCreateRequest: canInAnyCouncil(ctx.actor, "request.create"),
      workspace: actionCouncilId
        ? {
            councilId: actionCouncilId,
            councilLabel: lookups.data.councilLabel[actionCouncilId] ?? "Órgão",
            stockLevels: workspaceStock,
            orders: workspaceOrders,
            availableStock: workspaceStock
              .filter((level) => level.available > 0)
              .map((level) => ({
                materialId: level.materialId,
                materialName: lookups.data.materialLabel[level.materialId] ?? level.materialId,
                available: level.available,
              })),
            canCreateRequest: can(ctx.actor, "request.create", actionCouncilId),
            canCreateProcess: can(ctx.actor, "process.create", actionCouncilId),
            canManageMeeting: can(ctx.actor, "meeting.manage", actionCouncilId),
            canCreateOrder: can(ctx.actor, "stock.move", actionCouncilId),
          }
        : null,
    });
  });

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
        canCreateRequest,
        workspace,
      }) => {
        const councilLabel = workspace?.councilLabel ?? null;
        const visibleActions = quickActions.filter(
          ({ href }) => href !== "/solicitacoes/nova" || (workspace?.canCreateRequest ?? canCreateRequest),
        );

        // Filtro de escopo por empresa
        const scopedRequests = councilId ? requests.filter((r) => r.councilId === councilId) : requests;
        const scopedMeetings = councilId ? meetings.filter((m) => m.councilId === councilId) : meetings;

        const pendingRequests = scopedRequests.filter((r) =>
          ["enviada", "em_analise", "aguardando_correcao"].includes(r.status),
        );
        const reqPending = pendingRequests.length;
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

        const recentRequests = [...(reqPending > 0 ? pendingRequests : scopedRequests)]
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

        const approvalQueue: PendingApprovalItem[] = pendingRequests
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 20)
          .map((r) => ({
            id: r.id,
            title: r.title,
            councilName: lookups.councilLabel[r.councilId] ?? "Órgão",
            status: r.status,
            processId: r.processId ?? null,
            estimatedValue: r.estimatedValue ?? null,
            itemsCount: r.items.length,
            createdAt: r.createdAt.toISOString(),
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
            <DashboardFilters
              councils={lookups.councils}
              councilId={councilId}
              councilLabel={councilLabel}
              focus={focus}
              attentionCount={replenishmentItems.length}
            />
            <section aria-labelledby="quick-actions-heading" className="space-y-3">
              <h2 id="quick-actions-heading" className="font-heading text-xl font-semibold text-primary">Ações rápidas</h2>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {visibleActions.map(({ href, icon: Icon, title, description }) => (
                  <Link
                    key={href}
                    href={href}
                    className="group flex min-w-0 flex-col rounded-2xl border border-border bg-card p-4 shadow-xs transition-colors hover:border-highlight/60 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <span className={cn("grid size-10 place-items-center rounded-xl", href === "/solicitacoes/nova" ? "bg-highlight/15 text-highlight-foreground" : "bg-secondary text-primary")}>
                        <Icon className="size-5" aria-hidden />
                      </span>
                      <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden />
                    </div>
                    <span className="text-sm font-semibold text-primary">{title}</span>
                    <span className="mt-1 text-sm leading-snug text-muted-foreground">{description}</span>
                  </Link>
                ))}
              </div>
            </section>

            <Suspense fallback={<BriefingFallback />}>
              <BriefingCard facts={facts} />
            </Suspense>

            <section id="atencao" aria-labelledby="attention-heading" className="scroll-mt-24 space-y-4">
              <h2 id="attention-heading" className="font-heading text-xl font-semibold text-primary">Precisa da sua atenção</h2>
              <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
                <div className="min-w-0">
                  <RecentRequestsPanel items={recentRequests} pendingCount={reqPending} />
                </div>
                <div className="grid min-w-0 gap-3">
                  {focus === "prazos" || dash.deadlines.length > 0 ? (
                    <div id="prazos" className="scroll-mt-24">
                      <DeadlinesPanel items={focus === "prazos" ? dash.deadlines : dash.deadlines.slice(0, 2)} />
                    </div>
                  ) : null}
                  <AlertsPanel items={alertItems} unread={alerts.unread} />
                  <ReplenishmentPanel items={replenishmentItems} />
                </div>
              </div>
            </section>

            <section aria-labelledby="workspace-heading" className="space-y-4">
              <h2 id="workspace-heading" className="font-heading text-xl font-semibold text-primary">Filas e espaço de trabalho</h2>
              {isWarley ? <ApprovalQueue items={approvalQueue} /> : null}
              {isWarley ? <FormalizationQueue items={pendingQueue} /> : null}
              {isWarley ? <OrderQueue items={pendingOrderQueue} /> : null}
              {workspace ? (
                <CouncilWorkspace
                  councilId={workspace.councilId} councilLabel={workspace.councilLabel}
                  stockLevels={workspace.stockLevels} orders={workspace.orders} availableStock={workspace.availableStock}
                  materialLabelMap={lookups.materialLabel} materialNameMap={lookups.materialName}
                  canCreateRequest={workspace.canCreateRequest} canCreateProcess={workspace.canCreateProcess}
                  canManageMeeting={workspace.canManageMeeting} canCreateOrder={workspace.canCreateOrder}
                />
              ) : (
                <p className="rounded-xl border border-dashed border-border/80 bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
                  Escolha um órgão no filtro para acessar seu espaço de trabalho.
                </p>
              )}
            </section>

            <section id="analises" aria-labelledby="analysis-heading" className="scroll-mt-24 space-y-4 border-t border-border pt-6">
              <h2 id="analysis-heading" className="font-heading text-xl font-semibold text-primary">Indicadores e análises</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  hint={replenishmentItems.length > 0 ? "Exige reposição urgente" : "Estável"}
                />
                <KpiCard
                  href="/relatorios?tab=indicadores"
                  icon={<TrendingDown className="size-4" aria-hidden />}
                  label="Economia Gerada"
                  value={formatCurrency(savingsSummary.totalSavings)}
                  hint={`${formatPercent(savingsSummary.averageSavingsPercent)} redução média`}
                />
              </div>
              <div className="grid items-start gap-4 lg:grid-cols-2">
                <div className="min-w-0">
                  <AgendaAndDeadlinesPanel meetings={upcomingMeetings} deadlines={dash.deadlines} />
                </div>
                <div id="documentos" className="min-w-0 scroll-mt-24">
                  <StatusDistribution rows={dash.processStatuses} total={s.processes.total} />
                </div>
              </div>
            </section>
          </div>
        );
      }}
    </Screen>
  );
}

async function DashboardHeading() {
  const session = await getSession();
  const now = new Date();
  const hour = Number(new Intl.DateTimeFormat("pt-BR", {
    timeZone: APP_TIME_ZONE, hour: "numeric", hourCycle: "h23",
  }).format(now));
  const [greeting, Icon] = hour < 5 || hour >= 18
    ? ["Boa noite", Moon] as const
    : hour < 12 ? ["Bom dia", Sunrise] as const : ["Boa tarde", Sun] as const;
  const firstName = session.status === "authenticated" ? session.displayName.trim().split(/\s+/)[0] : "";
  const date = new Intl.DateTimeFormat("pt-BR", { timeZone: APP_TIME_ZONE, dateStyle: "full" }).format(now);

  return (
    <header className="relative mb-4 isolate overflow-hidden rounded-2xl bg-[#0f2942] px-5 py-6 text-white sm:px-7 sm:py-7">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,#35556d,transparent_65%)]" />
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p className="flex items-center gap-2 text-sm font-medium text-slate-200">
          <span className="h-0.5 w-5 rounded-full bg-highlight" aria-hidden /> Visão geral
        </p>
        <p className="flex items-center gap-2 text-sm text-slate-200">
          <Icon className="size-4 shrink-0 text-orange-300" aria-hidden />
          <span className="first-letter:uppercase">{date}</span>
        </p>
      </div>
      <h1 className="mt-3 break-words font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
        {greeting}{firstName ? `, ${firstName}` : ""}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-200 sm:text-base">Veja o resumo da operação de hoje e acesse suas principais tarefas.</p>
    </header>
  );
}

export default function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <>
      <Suspense fallback={<LoadingState />}>
        <DashboardHeading />
      </Suspense>
      <Suspense fallback={<LoadingState />}>
        <DashboardContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}
