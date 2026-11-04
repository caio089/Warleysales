import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { z } from "zod";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Package,
  PackageCheck,
  Plus,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { NewMeetingForm } from "@/app/(app)/reunioes/meeting-forms";
import type { Meeting } from "@/modules/meetings/schemas";
import type { ProcessView } from "@/modules/processes/service";
import type { PurchaseRequest } from "@/modules/purchases/schemas";
import type { StockLevelView } from "@/modules/inventory/service";
import type { DashboardSnapshot } from "@/modules/reports/service";
import { loadLookups, type Lookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { can } from "@/shared/lib/authz/policy";
import { ok, type Result } from "@/shared/lib/result";
import { KpiCard } from "@/shared/ui/kpi-card";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader, SectionLabel } from "@/shared/ui/page-header";
import { ProgressBar } from "@/shared/ui/progress-bar";
import { Screen } from "@/shared/ui/screen";
import { SimpleTable } from "@/shared/ui/simple-table";
import { StatusBadge } from "@/shared/ui/status-badge";
import { presentationOf, REQUEST_STATUS } from "@/shared/ui/status-presentation";
import { ActionHub, buildCouncilActions } from "./action-hub";
import { CouncilPicker } from "./council-picker";
import { MeetingsOverview, ProcessesOverview, RequestsOverview } from "./overview-lists";

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
      canCreateRequest: boolean;
      canCreateProcess: boolean;
      canManageMeeting: boolean;
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

    const [dash, requests, meetings, stockRes, processes] = await Promise.all([
      ctx.services.reports.dashboard(ctx.actor, { councilId }),
      ctx.services.purchases.list(ctx.actor),
      ctx.services.meetings.list(ctx.actor),
      ctx.services.inventory.listLevels(ctx.actor, councilId),
      ctx.services.processes.list(ctx.actor),
    ]);
    if (!dash.ok) return dash;
    if (!requests.ok) return requests;
    if (!meetings.ok) return meetings;
    if (!stockRes.ok) return stockRes;
    if (!processes.ok) return processes;

    const councilRequests = requests.data
      .filter((r) => r.councilId === councilId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const councilMeetings = meetings.data
      .filter((m) => m.councilId === councilId)
      .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
    const councilProcesses = processes.data
      .filter((p) => p.process.councilId === councilId)
      .sort((a, b) => b.process.createdAt.getTime() - a.process.createdAt.getTime());

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
      canCreateRequest: can(ctx.actor, "request.create", councilId),
      canCreateProcess: can(ctx.actor, "process.create", councilId),
      canManageMeeting: can(ctx.actor, "meeting.manage", councilId),
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
          dash,
          pendingRequestsCount,
          inProgressRequestsCount,
          totalReceivedUnits,
          totalPendingUnits,
          requests,
          processes,
          meetings,
          meetingsOpen,
          stockLevels,
          canCreateRequest,
          canCreateProcess,
          canManageMeeting,
          roleLabel,
        } = data;

        const label = lookups.councilLabel[councilId] ?? "Empresa Parceira";
        const actions = buildCouncilActions({
          councilId,
          canCreateRequest,
          canCreateProcess,
          canManageMeeting,
        });

        return (
          <div className="space-y-8">
            <PageHeader
              eyebrow="Painel da Empresa"
              title={label}
              description={`Ambiente exclusivo para acompanhamento de demandas, estoque local, entregas e reuniões com o Warley. Papel ativo: ${roleLabel}.`}
              actions={
                <div className="flex flex-wrap items-center gap-2">
                  <CouncilPicker councils={lookups.councils} councilId={councilId} />
                  {canCreateRequest ? (
                    <Link href={`/solicitacoes/nova?councilId=${councilId}`} className={buttonVariants()}>
                      <Plus className="mr-1.5 size-4" />
                      Fazer Solicitação
                    </Link>
                  ) : null}
                </div>
              }
            />

            {/* Ações Rápidas do Usuário */}
            <div className="space-y-3">
              <SectionLabel>O que você pode fazer</SectionLabel>
              <ActionHub items={actions} />
            </div>

            {/* Resumo Operacional da Empresa */}
            <div className="space-y-3">
              <SectionLabel>Visão Geral das Demandas e Entregas</SectionLabel>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <KpiCard
                  href="/solicitacoes"
                  icon={<ShoppingCart className="size-4" aria-hidden />}
                  label="Solicitações Pendentes"
                  value={pendingRequestsCount}
                  accent={pendingRequestsCount > 0}
                  hint={`${inProgressRequestsCount} em andamento`}
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
                  href="/estoque"
                  icon={<Package className="size-4" aria-hidden />}
                  label="Itens Disponíveis"
                  value={stockLevels.length}
                  hint="No catálogo da empresa"
                />
                <KpiCard
                  href="#agendar-reuniao"
                  icon={<CalendarDays className="size-4" aria-hidden />}
                  label="Próximas Reuniões"
                  value={meetingsOpen}
                  hint="Agendadas com Warley"
                />
              </div>
            </div>

            {/* Seção de Estoque Local da Empresa */}
            <section aria-label="Estoque Disponível da Empresa" className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <SectionLabel>Estoque Disponível na Empresa</SectionLabel>
                  <p className="text-xs text-muted-foreground">Materiais atualmente disponíveis para utilização na sua sede.</p>
                </div>
                <Link href={`/estoque?councilId=${councilId}`} className="text-xs font-semibold text-primary hover:underline">
                  Ver detalhes do estoque →
                </Link>
              </div>

              <SimpleTable
                caption="Estoque da empresa"
                rows={stockLevels.map((s) => ({
                  id: `${s.councilId}:${s.materialId}`,
                  material: lookups.materialLabel[s.materialId] ?? "—",
                  available: s.available,
                  minimum: s.minimum,
                  level: s.level,
                }))}
                columns={[
                  { key: "material", header: "Produto / Material" },
                  { key: "available", header: "Quantidade Disponível", kind: "number" },
                  { key: "minimum", header: "Estoque Mínimo", kind: "number" },
                  { key: "level", header: "Situação", kind: "status", dictionary: "stock" },
                ]}
                emptyTitle="Nenhum produto em estoque"
                emptyDescription="Quando as solicitações forem aprovadas e recebidas, os itens aparecerão disponíveis aqui."
              />
            </section>

            {/* Painéis de Solicitações, Documentos e Reuniões */}
            <div className="grid gap-6 lg:grid-cols-3">
              <RequestsOverview rows={requests.map((r) => ({ id: r.id, title: r.title, status: r.status, createdAt: r.createdAt }))} />
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
              />
            </div>

            {/* Agendamento de Reuniões */}
            {canManageMeeting ? (
              <section id="agendar-reuniao" aria-labelledby="agendar-titulo" className="surface-card max-w-lg scroll-mt-24 p-6">
                <div className="mb-4 flex items-center gap-2">
                  <span className="grid size-9 place-items-center rounded-xl bg-secondary text-primary">
                    <CalendarDays className="size-4" aria-hidden />
                  </span>
                  <div>
                    <h2 id="agendar-titulo" className="font-heading text-base font-semibold tracking-tight text-primary">
                      Solicitar Reunião ou Alinhamento
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      A reunião fica registrada diretamente na agenda operacional da empresa com o Warley.
                    </p>
                  </div>
                </div>
                <NewMeetingForm
                  councils={[{ value: councilId, label }]}
                  defaultCouncilId={councilId}
                  lockCouncil
                />
              </section>
            ) : null}
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
