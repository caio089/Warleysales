import type { Metadata } from "next";
import { Suspense } from "react";
import { CalendarClock, CalendarDays, FileCheck2, ListTodo } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { loadLookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { can, canInAnyCouncil } from "@/shared/lib/authz/policy";
import { ok } from "@/shared/lib/result";
import { LoadingState } from "@/shared/ui/feedback-states";
import { FlowGuide } from "@/shared/ui/flow-guide";
import { KpiCard } from "@/shared/ui/kpi-card";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { ModuleInsight, ModuleInsightFallback } from "@/shared/ui/module-insight";
import { SimpleTable } from "@/shared/ui/simple-table";
import { MeetingActions, NewMeetingForm } from "./meeting-forms";
import { MeetingMediaPanel } from "./meeting-media-panel";

export const metadata: Metadata = { title: "Reuniões" };

async function Content({ searchParams }: { searchParams: Promise<{ reuniao?: string }> }) {
  const selectedId = (await searchParams).reuniao;
  const result = await loadScreen(async (ctx) => {
    const [meetings, lookups] = await Promise.all([ctx.services.meetings.list(ctx.actor), loadLookups(ctx)]);
    if (!meetings.ok) return meetings;
    if (!lookups.ok) return lookups;
    return ok({ meetings: meetings.data, lookups: lookups.data, canManage: canInAnyCouncil(ctx.actor, "meeting.manage"), manageableMeetingIds: meetings.data.filter((m) => can(ctx.actor, "meeting.manage", m.councilId)).map((m) => m.id) });
  });
  return (
    <Screen result={result}>
      {({ meetings, lookups, canManage, manageableMeetingIds }) => {
        const selected = meetings.find((meeting) => meeting.id === selectedId);
        const totalMeetings = meetings.length;
        const upcomingMeetings = meetings.filter((m) => m.status === "agendada").length;
        const completedWithMinutes = meetings.filter((m) => m.status === "realizada" && Boolean(m.minutes)).length;
        const openActionItems = meetings.flatMap((m) => m.actionItems).filter((i) => !i.done).length;

        return (
          <div className="space-y-8">
            <PageHeader eyebrow="Agenda · Governança" title="Reuniões" description="Agende encontros, registre o áudio e transforme a transcrição revisada em ata." actions={canManage ? <a href="#agendar-reuniao" className={buttonVariants()}>Agendar reunião</a> : undefined} />
            {selected ? <section className="surface-card space-y-2 p-5" aria-labelledby="reuniao-selecionada">
              <h2 id="reuniao-selecionada" className="font-semibold">{selected.title}</h2>
              <p className="text-sm">{lookups.councilLabel[selected.councilId]} · {selected.scheduledAt.toLocaleString("pt-BR", { timeZone: "America/Fortaleza" })} · {selected.status}</p>
              {selected.minutes ? <p className="whitespace-pre-wrap text-sm">{selected.minutes.text}</p> : null}
            </section> : null}
            <FlowGuide title="Da agenda à ata" steps={[
              { title: "Agende", detail: "Defina o órgão, o assunto e a data." },
              { title: "Realize", detail: "Atualize a situação da reunião." },
              { title: "Registre", detail: "Grave ou anexe o áudio e revise a transcrição." },
              { title: "Conclua", detail: "Revise a proposta de ata antes de salvar." },
            ]} />
            <Suspense fallback={<ModuleInsightFallback />}>
              <ModuleInsight moduleName="Reuniões" sourceHref="/reunioes" facts={[
                { label: "Total", value: totalMeetings },
                { label: "Agendadas", value: upcomingMeetings },
                { label: "Realizadas com ata", value: completedWithMinutes },
                { label: "Ações em aberto", value: openActionItems },
              ]} />
            </Suspense>
            <section aria-label="Métricas de Reuniões" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard
                icon={<CalendarDays className="size-4" aria-hidden />}
                label="Total de Reuniões"
                value={totalMeetings}
                hint="Registradas no sistema"
              />
              <KpiCard
                icon={<CalendarClock className="size-4" aria-hidden />}
                label="Próximas Agendadas"
                value={upcomingMeetings}
                hint={upcomingMeetings > 0 ? "Reuniões futuras" : "Nenhuma agendada"}
              />
              <KpiCard
                icon={<FileCheck2 className="size-4" aria-hidden />}
                label="Realizadas com Ata"
                value={completedWithMinutes}
                hint="Atas documentadas"
              />
              <KpiCard
                icon={<ListTodo className="size-4" aria-hidden />}
                label="Ações em Aberto"
                value={openActionItems}
                accent={openActionItems > 0}
                hint={openActionItems > 0 ? "Pendências a concluir" : "Todas concluídas"}
              />
            </section>

            <SimpleTable
              caption="Reuniões"
              rows={meetings.map((m) => ({
                id: m.id,
                title: m.title,
                council: lookups.councilLabel[m.councilId] ?? "—",
                scheduledAt: m.scheduledAt.toISOString(),
                status: m.status,
                minutes: m.minutes ? m.minutes.text.slice(0, 80) : "—",
                items: m.actionItems.length,
              }))}
              columns={[
                { key: "title", header: "Reunião" },
                { key: "council", header: "Órgão" },
                { key: "scheduledAt", header: "Data e hora (Fortaleza)", kind: "datetime" },
                { key: "status", header: "Status", kind: "status", dictionary: "meeting" },
                { key: "minutes", header: "Ata da reunião" },
                { key: "items", header: "Pendências", kind: "number" },
              ]}
              filterKeys={[{ key: "status", label: "Status", dictionary: "meeting" }]}
              emptyTitle="Nenhuma reunião agendada"
            />
            <MeetingMediaPanel meetings={meetings.map((m) => ({
              id: m.id, title: m.title, status: m.status, audioPath: m.audioPath, transcript: m.transcript,
            }))} manageableMeetingIds={manageableMeetingIds} />
            {meetings.some((m) => m.actionItems.length > 0) ? (
              <SimpleTable
                caption="Pendências de reunião"
                rows={meetings.flatMap((m) => m.actionItems.map((i) => ({
                  id: i.id,
                  meeting: m.title,
                  description: i.description,
                  due: i.dueDate,
                  done: i.done ? "Concluída" : "Aberta",
                })))}
                columns={[
                  { key: "meeting", header: "Reunião" },
                  { key: "description", header: "Pendência" },
                  { key: "due", header: "Prazo", kind: "date" },
                  { key: "done", header: "Situação" },
                ]}
              />
            ) : null}
            {canManage ? (
              <>
                <MeetingActions
                  meetings={meetings.filter((m) => m.status === "agendada").map((m) => ({ value: m.id, label: m.title }))}
                  done={meetings.filter((m) => m.status === "realizada").map((m) => ({
                    value: m.id, label: m.title, transcript: m.transcript, minutesText: m.minutes?.text ?? null,
                  }))}
                  actionable={meetings.filter((m) => m.status === "agendada" || m.status === "realizada").map((m) => ({ value: m.id, label: m.title }))}
                />
                <section id="agendar-reuniao" aria-labelledby="novo" className="surface-card max-w-lg scroll-mt-6 p-6">
                  <h2 id="novo" className="mb-4 font-heading text-lg font-medium tracking-tight text-primary">
                    Agendar reunião
                  </h2>
                  <NewMeetingForm councils={lookups.councils.map((c) => ({ value: c.id, label: c.label }))} />
                </section>
              </>
            ) : null}
          </div>
        );
      }}
    </Screen>
  );
}

export default function MeetingsPage({ searchParams }: { searchParams: Promise<{ reuniao?: string }> }) {
  return (
    <Suspense fallback={<LoadingState />}><Content searchParams={searchParams} /></Suspense>
  );
}
