import type { Metadata } from "next";
import { Suspense } from "react";
import { loadLookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { canInAnyCouncil } from "@/shared/lib/authz/policy";
import { ok } from "@/shared/lib/result";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { SimpleTable } from "@/shared/ui/simple-table";
import { MeetingActions, NewMeetingForm } from "./meeting-forms";

export const metadata: Metadata = { title: "Reuniões" };

async function Content() {
  const result = await loadScreen(async (ctx) => {
    const [meetings, lookups] = await Promise.all([ctx.services.meetings.list(ctx.actor), loadLookups(ctx)]);
    if (!meetings.ok) return meetings;
    if (!lookups.ok) return lookups;
    return ok({ meetings: meetings.data, lookups: lookups.data, canManage: canInAnyCouncil(ctx.actor, "meeting.manage") });
  });
  return (
    <Screen result={result}>
      {({ meetings, lookups, canManage }) => (
        <div className="space-y-8">
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
              { key: "council", header: "Conselho" },
              { key: "scheduledAt", header: "Data e hora (Fortaleza)", kind: "datetime" },
              { key: "status", header: "Status", kind: "status", dictionary: "meeting" },
              { key: "minutes", header: "Ata da reunião" },
              { key: "items", header: "Pendências", kind: "number" },
            ]}
            filterKeys={[{ key: "status", label: "Status", dictionary: "meeting" }]}
            emptyTitle="Nenhuma reunião agendada"
          />
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
                done={meetings.filter((m) => m.status === "realizada").map((m) => ({ value: m.id, label: m.title }))}
                actionable={meetings.filter((m) => m.status === "agendada" || m.status === "realizada").map((m) => ({ value: m.id, label: m.title }))}
              />
              <section aria-labelledby="novo" className="surface-card max-w-lg p-6"><h2 id="novo" className="mb-4 font-heading text-lg font-medium tracking-tight text-primary">Agendar reunião</h2><NewMeetingForm councils={lookups.councils.map((c) => ({ value: c.id, label: c.label }))} /></section>
            </>
          ) : null}
        </div>
      )}
    </Screen>
  );
}

export default function MeetingsPage() {
  return (<><PageHeader title="Reuniões" description="A ata de reunião só pode ser registrada depois que a reunião é realizada." /><Suspense fallback={<LoadingState />}><Content /></Suspense></>);
}
