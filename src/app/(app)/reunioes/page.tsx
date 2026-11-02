import type { Metadata } from "next";
import { Suspense } from "react";
import { loadLookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
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
    return ok({ meetings: meetings.data, lookups: lookups.data });
  });
  return (
    <Screen result={result}>
      {({ meetings, lookups }) => (
        <div className="space-y-8">
          <SimpleTable
            caption="Reuniões"
            rows={meetings.map((m) => ({ id: m.id, title: m.title, council: lookups.councilLabel[m.councilId] ?? "—", scheduledAt: m.scheduledAt.toISOString(), status: m.status, minutes: m.minutes ? "Registrada" : "—" }))}
            columns={[{ key: "title", header: "Reunião" }, { key: "council", header: "Conselho" }, { key: "scheduledAt", header: "Data e hora (Fortaleza)", kind: "datetime" }, { key: "status", header: "Status", kind: "status", dictionary: "meeting" }, { key: "minutes", header: "Ata da reunião" }]}
            filterKeys={[{ key: "status", label: "Status", dictionary: "meeting" }]}
            emptyTitle="Nenhuma reunião agendada"
          />
          <MeetingActions meetings={meetings.filter((m) => m.status === "agendada").map((m) => ({ value: m.id, label: m.title }))} done={meetings.filter((m) => m.status === "realizada").map((m) => ({ value: m.id, label: m.title }))} />
          <section aria-labelledby="novo" className="max-w-lg rounded-lg border p-4"><h2 id="novo" className="mb-4 text-base font-semibold">Agendar reunião</h2><NewMeetingForm councils={lookups.councils.map((c) => ({ value: c.id, label: c.label }))} /></section>
        </div>
      )}
    </Screen>
  );
}

export default function MeetingsPage() {
  return (<><PageHeader title="Reuniões" description="A ata de reunião só pode ser registrada depois que a reunião é realizada." /><Suspense fallback={<LoadingState />}><Content /></Suspense></>);
}
