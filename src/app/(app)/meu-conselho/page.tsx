import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { z } from "zod";
import {
  CalendarDays,
  PackageCheck,
  PackagePlus,
  Plus,
  ScrollText,
  ShoppingCart,
  TrendingDown,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Meeting } from "@/modules/meetings/schemas";
import type { ProcessView } from "@/modules/processes/service";
import type { PurchaseRequest } from "@/modules/purchases/schemas";
import type { StockLevelView } from "@/modules/inventory/service";
import type { MaterialOrder } from "@/modules/orders/schemas";
import type { DashboardSnapshot } from "@/modules/reports/service";
import type { SavingsSummary } from "@/modules/formalizations/service";
import { loadLookups, type Lookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { can } from "@/shared/lib/authz/policy";
import { formatCurrency, formatPercent } from "@/shared/lib/format";
import { ok, type Result } from "@/shared/lib/result";
import { KpiCard } from "@/shared/ui/kpi-card";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader, SectionLabel } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { ActionHub, buildCouncilActions } from "./action-hub";
import { CouncilPicker } from "./council-picker";
import { type AvailableStockItem } from "./material-order-dialog";
import { MaterialOrdersSection } from "./material-orders-section";
import { MeetingDialog } from "./meeting-dialog";
import { MeetingsOverview, ProcessesOverview, RequestsOverview } from "./overview-lists";
import { SavingsHistoryDialog, type SavingsHistoryItem } from "./savings-history-dialog";
import { StockSection } from "./stock-section";

export const metadata: Metadata = { title: "Portal da Empresa" };

type PanelData =
  | { empty: true; lookups: Lookups }
  | {
      empty: false;
      councilId: string;
      lookups: Lookups;
      dash: DashboardSnapshot;
      requestTotal: number;
      pendingRequestsCount: number;
      inProgressRequestsCount: number;
      completedRequestsCount: number;
      totalReceivedUnits: number;
      totalPendingUnits: number;
      requests: PurchaseRequest[];
      processes: ProcessView[];
      meetings: Meeting[];
      meetingsOpen: number;
      stockLevels: StockLevelView[];
      orders: MaterialOrder[];
      availableStock: AvailableStockItem[];
      savingsSummary: SavingsSummary;
      savingsHistory: SavingsHistoryItem[];
      canCreateRequest: boolean;
      canCreateProcess: boolean;
      canManageMeeting: boolean;
      canCreateOrder: boolean;
      roleLabel: string;
    };

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function pickCouncilId(
  requested: string | undefined,
  councils: { id: string; label: string }[],
): string | null {
  if (councils.length === 0) return null;
  if (requested && z.uuid().safeParse(requested).success && councils.some((c) => c.id === requested)) {
    return requested;
  }
  return councils[0]!.id;
}

async function Content({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const requestedCouncilId = one(raw.councilId);

  const result = await loadScreen(async (ctx): Promise<Result<PanelData>> => {
    const lookups = await loadLookups(ctx);
    if (!lookups.ok) return lookups;
    const councilId = pickCouncilId(requestedCouncilId, lookups.data.councils);
    if (!councilId) {
      return ok({ empty: true, lookups: lookups.data });
    }

    const [dash, requests, meetings, stockRes, processes, savingsRes, homologatedRes, suppliersRes, ordersRes] = await Promise.all([
      ctx.services.reports.dashboard(ctx.actor, { councilId }),
      ctx.services.purchases.list(ctx.actor),
      ctx.services.meetings.list(ctx.actor),
      ctx.services.inventory.listLevels(ctx.actor, councilId),
      ctx.services.processes.list(ctx.actor),
      ctx.services.formalizations.getSavingsSummary(ctx.actor, councilId),
      ctx.services.formalizations.listHomologated(ctx.actor, councilId),
      ctx.services.suppliers.list(ctx.actor),
      ctx.services.orders.list(ctx.actor, { councilId }),
    ]);
    if (!dash.ok) return dash;
    if (!requests.ok) return requests;
    if (!meetings.ok) return meetings;
    if (!stockRes.ok) return stockRes;
    if (!processes.ok) return processes;
    if (!savingsRes.ok) return savingsRes;
    if (!homologatedRes.ok) return homologatedRes;
    if (!ordersRes.ok) return ordersRes;

    const suppliers = suppliersRes.ok ? suppliersRes.data : [];
    const supplierNameMap = Object.fromEntries(suppliers.map((s) => [s.id, s.name]));
    const processNumberMap = Object.fromEntries(processes.data.map((p) => [p.process.id, p.process.number]));

    const savingsHistory: SavingsHistoryItem[] = homologatedRes.data
      .map((f) => ({
        id: f.id,
        processId: f.processId,
        processNumber: processNumberMap[f.processId] ?? f.processId.slice(0, 8),
        supplierName: supplierNameMap[f.supplierId] ?? "Fornecedor",
        instrumentType: f.instrumentType,
        instrumentNumber: f.instrumentNumber,
        estimatedValue: f.estimatedValue,
        contractedValue: f.contractedValue,
        savingsValue: f.savingsValue,
        savingsPercent: f.savingsPercent,
        homologatedAt: f.homologatedAt,
      }))
      .sort((a, b) => new Date(b.homologatedAt ?? 0).getTime() - new Date(a.homologatedAt ?? 0).getTime());

    const councilRequests = requests.data
      .filter((r) => r.councilId === councilId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const councilMeetings = meetings.data
      .filter((m) => m.councilId === councilId)
      .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
    const councilProcesses = processes.data
      .filter((p) => p.process.councilId === councilId)
      .sort((a, b) => b.process.createdAt.getTime() - a.process.createdAt.getTime());
    const councilOrders = ordersRes.data
      .filter((o) => o.councilId === councilId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const availableStock: AvailableStockItem[] = stockRes.data
      .filter((s) => s.available > 0)
      .map((s) => ({
        materialId: s.materialId,
        materialName: lookups.data.materialLabel[s.materialId] ?? s.materialId,
        available: s.available,
      }));

    // Cálculos de solicitações da empresa
    const pendingRequestsCount = councilRequests.filter((r) =>
      ["enviada", "em_analise", "aguardando_correcao"].includes(r.status),
    ).length;
    const inProgressRequestsCount = councilRequests.filter((r) =>
      ["aprovada", "em_atendimento", "parcialmente_atendida"].includes(r.status),
    ).length;
    const completedRequestsCount = councilRequests.filter((r) => r.status === "atendida").length;

    // Entregas da empresa
    let totalReceivedUnits = 0;
    let totalPendingUnits = 0;
    councilRequests.forEach((r) => {
      if (["aprovada", "em_atendimento", "parcialmente_atendida", "atendida"].includes(r.status)) {
        r.items.forEach((item) => {
          totalReceivedUnits += Number(item.receivedTotal || 0);
          if (["aprovada", "em_atendimento", "parcialmente_atendida"].includes(r.status)) {
            totalPendingUnits += Math.max(0, Number(item.quantity) - Number(item.receivedTotal || 0));
          }
        });
      }
    });

    const membership = ctx.actor.memberships.find((m) => m.councilId === councilId);
    const roleLabel = ctx.actor.isCentralAdmin
      ? "Administração Central (Warley)"
      : membership?.role === "council_manager"
        ? "Gestor da Empresa"
        : membership?.role === "council_operator"
          ? "Operador"
          : "Consulta / Visualizador";

    return ok({
      empty: false,
      councilId,
      lookups: lookups.data,
      dash: dash.data,
      requestTotal: councilRequests.length,
      pendingRequestsCount,
      inProgressRequestsCount,
      completedRequestsCount,
      totalReceivedUnits,
      totalPendingUnits,
      requests: councilRequests.slice(0, 8),
      processes: councilProcesses.slice(0, 6),
      meetings: councilMeetings.slice(0, 6),
      meetingsOpen: councilMeetings.filter((m) => m.status === "agendada").length,
      stockLevels: stockRes.data,
      orders: councilOrders,
      availableStock,
      savingsSummary: savingsRes.data,
      savingsHistory,
      canCreateRequest: can(ctx.actor, "request.create", councilId),
      canCreateProcess: can(ctx.actor, "process.create", councilId),
      canManageMeeting: can(ctx.actor, "meeting.manage", councilId),
      canCreateOrder: can(ctx.actor, "stock.move", councilId),
      roleLabel,
    });
  });

  return (
    <Screen result={result}>
      {(data) => {
        if (data.empty) {
          return (
            <>
              <PageHeader
                eyebrow="Portal da Empresa"
                title="Meu Ambiente"
                description="Você ainda não possui vínculo a uma empresa parceira. Peça ao administrador central para associar seu usuário."
              />
              <p className="rounded-xl border border-dashed border-border/80 bg-secondary/40 px-4 py-8 text-center text-sm text-muted-foreground">
                Sem vínculo de empresa não há solicitações, documentos nem estoque para exibir.
              </p>
            </>
          );
        }

        const {
          councilId,
          lookups,
          pendingRequestsCount,
          inProgressRequestsCount,
          totalReceivedUnits,
          totalPendingUnits,
          requests,
          processes,
          meetings,
          stockLevels,
          orders,
          availableStock,
          savingsSummary,
          savingsHistory,
          canCreateRequest,
          canCreateProcess,
          canManageMeeting,
          canCreateOrder,
          roleLabel,
        } = data;

        const label = lookups.councilLabel[councilId] ?? "Empresa Parceira";
        const actions = buildCouncilActions({
          councilId,
          canCreateRequest,
          canCreateProcess,
          canManageMeeting,
          renderMeetingTrigger: (className, body) => (
            <MeetingDialog
              councilId={councilId}
              councilLabel={label}
              triggerClassName="w-full"
              trigger={
                <button type="button" className={className}>
                  {body}
                </button>
              }
            />
          ),
        });

        return (
          <div className="space-y-6">
            {/* 1. CABEÇALHO DO ÓRGÃO + BANNER DE ECONOMIA INTEGRADO */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              {/* Faixa Superior: Identificação e Ações Principais */}
              <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    PAINEL DA EMPRESA
                  </span>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    {label}
                  </h1>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                    Ambiente exclusivo para acompanhamento de demandas, estoque local, entregas e reuniões com o Warley.
                  </p>
                  <div className="pt-1.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                      Papel ativo: {roleLabel}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-end gap-3 shrink-0">
                  <CouncilPicker councils={lookups.councils} councilId={councilId} />
                  {canCreateRequest ? (
                    <Link
                      href={`/solicitacoes/nova?councilId=${councilId}`}
                      className="inline-flex items-center gap-2 bg-[#0F2942] hover:bg-[#1a3d5e] text-white px-4 py-2.5 rounded-xl font-medium text-xs shadow-xs transition-colors h-11"
                    >
                      <Plus className="size-4" />
                      Fazer Solicitação
                    </Link>
                  ) : null}
                </div>
              </div>

              {/* Faixa Inferior: Eficiência Orçamentária Institucional */}
              <div className="px-6 py-4 bg-gradient-to-r from-emerald-50/70 via-emerald-50/30 to-white flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <TrendingDown className="size-4.5" aria-hidden />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      Eficiência Orçamentária Institucional · Economia Gerada nas Contratações
                    </h2>
                    <p className="text-xs text-slate-500 hidden sm:block">
                      Resultado financeiro acumulado obtido através das negociações homologadas por Warley para a empresa.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-5 sm:gap-6 shrink-0">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Total Economizado
                    </span>
                    <p className="text-lg sm:text-xl font-bold tabular-nums text-emerald-700">
                      {formatCurrency(savingsSummary.totalSavings)}
                    </p>
                  </div>

                  <div className="border-l border-slate-200/80 pl-5 sm:pl-6">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Desconto Médio
                    </span>
                    <p className="text-lg sm:text-xl font-bold tabular-nums text-slate-900">
                      {formatPercent(savingsSummary.averageSavingsPercent)}
                    </p>
                  </div>

                  <div className="border-l border-slate-200/80 pl-5 sm:pl-6">
                    <SavingsHistoryDialog
                      councilName={label}
                      summary={savingsSummary}
                      items={savingsHistory}
                      trigger={
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 border-emerald-300 text-emerald-800 hover:bg-emerald-100/50 text-xs font-medium rounded-xl"
                        >
                          <ScrollText className="size-3.5 text-emerald-600" />
                          Histórico de Economia
                        </Button>
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. O QUE VOCÊ PODE FAZER */}
            <div className="space-y-3">
              <SectionLabel>O que você pode fazer</SectionLabel>
              <ActionHub items={actions} />
            </div>

            {/* 3. VISÃO GERAL DAS DEMANDAS E ENTREGAS */}
            <div className="space-y-3">
              <SectionLabel>Visão Geral das Demandas e Entregas</SectionLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <KpiCard
                  href="/solicitacoes"
                  icon={<ShoppingCart className="size-4" aria-hidden />}
                  label="Solicitações em Andamento"
                  value={pendingRequestsCount + inProgressRequestsCount}
                  accent={pendingRequestsCount > 0}
                  hint={`${pendingRequestsCount} pendentes, ${inProgressRequestsCount} em atendimento`}
                />
                <KpiCard
                  href="/entregas"
                  icon={<PackageCheck className="size-4" aria-hidden />}
                  label="Materiais Recebidos"
                  value={`${totalReceivedUnits} un`}
                  hint="Entregas já confirmadas"
                />
                <KpiCard
                  href="/entregas"
                  icon={<Truck className="size-4" aria-hidden />}
                  label="Entregas Pendentes"
                  value={`${totalPendingUnits} un`}
                  accent={totalPendingUnits > 0}
                  hint="Aguardando recebimento"
                />
                <KpiCard
                  href="#pedidos-materiais"
                  icon={<PackagePlus className="size-4" aria-hidden />}
                  label="Pedidos de Material"
                  value={orders.length}
                  accent={orders.filter((o) => o.status === "pendente").length > 0}
                  hint={`${orders.filter((o) => o.status === "pendente").length} aguardando Warley`}
                />
              </div>
            </div>

            {/* 4 & 5. BENTO GRID 12 COLUNAS: ESTOQUE (7 COLS) + ACOMPANHAMENTO (5 COLS) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              {/* Coluna 7: Estoque Disponível */}
              <div className="lg:col-span-7">
                <StockSection
                  councilId={councilId}
                  stockLevels={stockLevels}
                  materialLabelMap={lookups.materialLabel}
                  materialNameMap={lookups.materialName}
                />
              </div>

              {/* Coluna 5: Acompanhamento (Solicitações, Processos, Reuniões) */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-4">
                <RequestsOverview
                  rows={requests.map((r) => ({
                    id: r.id,
                    title: r.title,
                    status: r.status,
                    createdAt: r.createdAt,
                  }))}
                />
                <ProcessesOverview
                  rows={processes.map((p) => ({
                    id: p.process.id,
                    number: p.process.number,
                    title: p.process.title,
                    status: p.process.status,
                    progress: p.displayPercent,
                  }))}
                />
                <MeetingsOverview
                  rows={meetings.map((m) => ({
                    id: m.id,
                    title: m.title,
                    status: m.status,
                    scheduledAt: m.scheduledAt,
                  }))}
                  action={
                    canManageMeeting ? (
                      <MeetingDialog
                        councilId={councilId}
                        councilLabel={label}
                        trigger={
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 gap-1 px-2 text-xs font-semibold rounded-lg"
                          >
                            <CalendarDays className="size-3.5" aria-hidden />
                            Agendar
                          </Button>
                        }
                      />
                    ) : null
                  }
                />
              </div>
            </div>

            {/* 6. PEDIDOS DE MATERIAIS DA EMPRESA (LARGURA TOTAL 12 COLUNAS) */}
            <MaterialOrdersSection
              councilId={councilId}
              orders={orders}
              availableStock={availableStock}
              materialLabelMap={lookups.materialLabel}
              canCreateOrder={canCreateOrder}
            />
          </div>
        );
      }}
    </Screen>
  );
}

export default function MeuConselhoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<LoadingState />}>
      <Content searchParams={searchParams} />
    </Suspense>
  );
}
