import type { Metadata } from "next";
import { Suspense } from "react";
import { z } from "zod";
import {
  CalendarDays,
  ClipboardList,
  FileWarning,
  PackageX,
  ShoppingCart,
} from "lucide-react";
import { NewMeetingForm } from "@/app/(app)/reunioes/meeting-forms";
import type { Meeting } from "@/modules/meetings/schemas";
import type { ProcessView } from "@/modules/processes/service";
import type { PurchaseRequest } from "@/modules/purchases/schemas";
import type { DashboardSnapshot } from "@/modules/reports/service";
import { loadLookups, type Lookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { can } from "@/shared/lib/authz/policy";
import { ok, type Result } from "@/shared/lib/result";
import { LoadingState } from "@/shared/ui/feedback-states";
import { KpiCard } from "@/shared/ui/kpi-card";
import { PageHeader, SectionLabel } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { ActionHub, buildCouncilActions } from "./action-hub";
import { CouncilPicker } from "./council-picker";
import { MeetingsOverview, ProcessesOverview, RequestsOverview } from "./overview-lists";

export const metadata: Metadata = { title: "Meu conselho" };

type PanelData =
  | { empty: true; lookups: Lookups }
  | {
      empty: false;
      councilId: string;
      lookups: Lookups;
      dash: DashboardSnapshot;
      requestTotal: number;
      requests: PurchaseRequest[];
      processes: ProcessView[];
      meetings: Meeting[];
      meetingsOpen: number;
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

    const [dash, requests, meetings] = await Promise.all([
      ctx.services.reports.dashboard(ctx.actor, { councilId }),
      ctx.services.purchases.list(ctx.actor),
      ctx.services.meetings.list(ctx.actor),
    ]);
    if (!dash.ok) return dash;
    if (!requests.ok) return requests;
    if (!meetings.ok) return meetings;

    const councilRequests = requests.data
      .filter((r) => r.councilId === councilId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const councilMeetings = meetings.data
      .filter((m) => m.councilId === councilId)
      .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());

    const processes = await ctx.services.processes.list(ctx.actor);
    if (!processes.ok) return processes;
    const councilProcesses = processes.data
      .filter((p) => p.process.councilId === councilId)
      .sort((a, b) => b.process.createdAt.getTime() - a.process.createdAt.getTime());

    const membership = ctx.actor.memberships.find((m) => m.councilId === councilId);
    const roleLabel = ctx.actor.isCentralAdmin
      ? "Administração central"
      : membership?.role === "council_manager"
        ? "Gestor do conselho"
        : membership?.role === "council_operator"
          ? "Operador"
          : "Visualizador";

    return ok({
      empty: false,
      councilId,
      lookups: lookups.data,
      dash: dash.data,
      requestTotal: councilRequests.length,
      requests: councilRequests.slice(0, 6),
      processes: councilProcesses.slice(0, 6),
      meetings: councilMeetings.slice(0, 6),
      meetingsOpen: councilMeetings.filter((m) => m.status === "agendada").length,
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
                eyebrow="Painel do conselho"
                title="Meu conselho"
                description="Você ainda não tem conselho vinculado. Peça ao administrador central para associar seu usuário."
              />
              <p className="rounded-xl border border-dashed border-border/80 bg-secondary/40 px-4 py-8 text-center text-sm text-muted-foreground">
                Sem vínculo de conselho não há solicitações, documentos nem reuniões para mostrar.
              </p>
            </>
          );
        }

        const {
          councilId,
          lookups,
          dash,
          requestTotal,
          requests,
          processes,
          meetings,
          meetingsOpen,
          canCreateRequest,
          canCreateProcess,
          canManageMeeting,
          roleLabel,
        } = data;
        const label = lookups.councilLabel[councilId] ?? "Conselho";
        const s = dash.summary;
        const actions = buildCouncilActions({
          councilId,
          canCreateRequest,
          canCreateProcess,
          canManageMeeting,
        });

        return (
          <div className="space-y-8">
            <PageHeader
              eyebrow="Painel do conselho"
              title={label}
              description={`Tudo do ${label} em um lugar: solicitações, documentos, estoque e reuniões. Seu papel: ${roleLabel}.`}
              actions={<CouncilPicker councils={lookups.councils} councilId={councilId} />}
            />

            <div className="space-y-3">
              <SectionLabel>O que você pode fazer</SectionLabel>
              <ActionHub items={actions} />
            </div>

            <div className="space-y-3">
              <SectionLabel>Resumo deste conselho</SectionLabel>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <KpiCard
                  href="/solicitacoes"
                  icon={<ShoppingCart className="size-4" aria-hidden />}
                  label="Solicitações"
                  value={requestTotal}
                />
                <KpiCard
                  href="/processos"
                  icon={<ClipboardList className="size-4" aria-hidden />}
                  label="Processos"
                  value={s.processes.total}
                />
                <KpiCard
                  href="/processos"
                  icon={<FileWarning className="size-4" aria-hidden />}
                  label="Docs pendentes"
                  value={s.processes.pending}
                  accent={s.processes.pending > 0}
                />
                <KpiCard
                  href="/estoque"
                  icon={<PackageX className="size-4" aria-hidden />}
                  label="Estoque crítico"
                  value={s.stock.critical}
                  accent={s.stock.critical > 0}
                />
                <KpiCard
                  href="/reunioes"
                  icon={<CalendarDays className="size-4" aria-hidden />}
                  label="Reuniões agendadas"
                  value={meetingsOpen}
                />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
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

            {canManageMeeting ? (
              <section id="agendar-reuniao" aria-labelledby="agendar-titulo" className="surface-card max-w-lg scroll-mt-24 p-6">
                <h2 id="agendar-titulo" className="mb-1 font-heading text-lg font-medium tracking-tight text-primary">
                  Agendar reunião
                </h2>
                <p className="mb-4 text-sm text-muted-foreground">
                  A reunião fica ligada a este conselho. Depois de realizada, registre a ata em Reuniões.
                </p>
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
