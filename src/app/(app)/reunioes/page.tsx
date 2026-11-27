import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CalendarClock, CalendarDays, FileCheck2, ListTodo } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Meeting } from "@/modules/meetings/schemas";
import { loadScreen } from "@/server/screen";
import { createSessionClient } from "@/server/supabase/session-client";
import { selectAll } from "@/server/supabase/db";
import { can } from "@/shared/lib/authz/policy";
import { fail, ok } from "@/shared/lib/result";
import { systemRuntime } from "@/shared/lib/service-support";
import { formatDateOnly, formatDateTimeFortaleza, toFortalezaDate } from "@/shared/lib/time";
import { LoadingState } from "@/shared/ui/feedback-states";
import { KpiCard } from "@/shared/ui/kpi-card";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { StatusBadge } from "@/shared/ui/status-badge";
import { MEETING_STATUS, presentationOf } from "@/shared/ui/status-presentation";
import { MeetingEvidenceForm, NewMeetingForm } from "./meeting-forms";
import { MeetingDetailsEditor, MeetingFile, MeetingMinutesEditor, MeetingStatusEditor, MeetingTaskEditor } from "./meeting-detail-controls";

import { MeetingMediaPanel } from "./meeting-media-panel";
import { MeetingReview } from "./meeting-review";

export const metadata: Metadata = { title: "Reuniões" };

type Query = { reuniao?: string; busca?: string; situacao?: string };
type Option = { value: string; label: string };
type AttachmentRow = { id: string; file_name: string };
const detailHref = (id: string) => `/reunioes?reuniao=${id}`;
const calendarHref = (meeting: Meeting) => `/calendario?dia=${toFortalezaDate(meeting.scheduledAt)}&orgao=${meeting.councilId}`;
const meetingStatus = (meeting: Meeting) => presentationOf(MEETING_STATUS, meeting.status);

function MeetingCard({ meeting, council, names, selected, highlight }: {
  meeting: Meeting; council: string; names: Record<string, string>; selected?: boolean; highlight?: boolean;
}) {
  const status = meetingStatus(meeting);
  const pending = meeting.actionItems.filter((item) => !item.done).length;
  return <article className={`surface-card flex min-w-0 flex-col gap-3 border-l-4 p-4 ${highlight ? "border-l-highlight" : "border-l-border"}`}>
    <div className="flex flex-wrap items-center justify-between gap-2">
      <time dateTime={meeting.scheduledAt.toISOString()} className="text-sm font-semibold">{formatDateTimeFortaleza(meeting.scheduledAt)}</time>
      <StatusBadge {...status} />
    </div>
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{council}</p>
      <h3 className="break-words text-lg font-semibold leading-tight">{meeting.title}</h3>
      <p className="text-sm text-muted-foreground">Responsável: {meeting.responsibleId ? names[meeting.responsibleId] ?? "Nome indisponível" : "Não definido"}</p>
      {meeting.agenda && <p className="line-clamp-2 break-words text-sm">{meeting.agenda}</p>}
    </div>
    <p className="text-sm text-muted-foreground">
      {meeting.participantIds?.length ?? 0} relacionados · {meeting.attendance?.length ?? 0} presenças confirmadas · {pending} atividades abertas
    </p>
    <div className="mt-auto flex flex-wrap gap-2">
      <Link href={`${detailHref(meeting.id)}#reuniao-selecionada`} aria-current={selected ? "page" : undefined}
        className={buttonVariants({ variant: highlight ? "default" : "outline", size: "sm" })}>Abrir reunião</Link>
      {meeting.minutes && <Link href={`${detailHref(meeting.id)}#ata-reuniao`} className={buttonVariants({ variant: "ghost", size: "sm" })}>Consultar ata</Link>}
    </div>
  </article>;
}

function TextOrEmpty({ value, empty }: { value?: string | null; empty: string }) {
  return <p className={`whitespace-pre-wrap break-words text-sm leading-relaxed ${value ? "" : "text-muted-foreground"}`}>{value || empty}</p>;
}

function MeetingDetail({ meeting, council, names, people, attendanceOptions, docs, manage }: {
  meeting: Meeting; council: string; names: Record<string, string>; people: Option[]; attendanceOptions: Option[];
  docs: AttachmentRow[]; manage: boolean;
}) {
  const linked = meeting.participantIds ?? [];
  const confirmed = new Map((meeting.attendance ?? []).map((record) => [record.participantId, record]));
  const participantIds = [...new Set([...linked, ...confirmed.keys()])];
  const name = (id: string) => names[id] ?? "Nome indisponível";
  const linkedDocs = (meeting.attachmentIds ?? []).map((id) => ({ id, fileName: docs.find((doc) => doc.id === id)?.file_name }));
  return <section id="reuniao-selecionada" aria-labelledby="reuniao-titulo" className="scroll-mt-20 space-y-5">
    <div className="surface-card border-l-4 border-l-highlight p-4 sm:p-6">
      <p className="text-sm font-medium text-muted-foreground">{council} · {formatDateTimeFortaleza(meeting.scheduledAt)} (Fortaleza)</p>
      <div className="my-2 flex flex-wrap items-center gap-3">
        <h2 id="reuniao-titulo" className="min-w-0 break-words text-2xl font-semibold">{meeting.title}</h2>
        <StatusBadge {...meetingStatus(meeting)} />
      </div>
      <p className="mb-4 text-sm">Responsável: {meeting.responsibleId ? name(meeting.responsibleId) : "Não definido"}</p>
      <nav aria-label="Navegação da reunião" className="flex flex-wrap gap-2">
        <Link href={calendarHref(meeting)} className={buttonVariants({ variant: "outline", size: "sm" })}>Ver data no calendário</Link>
        <a href="#atividades-reuniao" className={buttonVariants({ variant: "ghost", size: "sm" })}>Atividades</a>
        <a href="#ata-reuniao" className={buttonVariants({ variant: "ghost", size: "sm" })}>Ata da reunião</a>
        <Link href="/reunioes" className={buttonVariants({ variant: "ghost", size: "sm" })}>Todas as reuniões</Link>
      </nav>
    </div>

    {manage && <>
      <MeetingDetailsEditor key={meeting.id} id={meeting.id} title={meeting.title} agenda={meeting.agenda ?? ""} decisions={meeting.decisions ?? ""}
        responsibleId={meeting.responsibleId ?? ""} participantIds={linked} attachmentIds={meeting.attachmentIds ?? []}
        people={meeting.responsibleId && !people.some((p) => p.value === meeting.responsibleId)
          ? [...people, { value: meeting.responsibleId, label: name(meeting.responsibleId) }] : people}
        attachments={docs.map((doc) => ({ value: doc.id, label: doc.file_name }))} />
      {meeting.status === "agendada" && <MeetingStatusEditor id={meeting.id} />}
    </>}

    <div className="grid gap-4 lg:grid-cols-2">
      <section className="surface-card space-y-3 p-4 sm:p-5" aria-labelledby="pauta-reuniao">
        <h3 id="pauta-reuniao" className="text-lg font-semibold">Pauta</h3>
        <TextOrEmpty value={meeting.agenda} empty="Nenhuma pauta registrada." />
        <h3 className="border-t pt-3 text-lg font-semibold">Decisões tomadas</h3>
        <TextOrEmpty value={meeting.decisions} empty="Nenhuma decisão registrada neste campo. Consulte a ata, quando disponível." />
      </section>
      <section className="surface-card space-y-3 p-4 sm:p-5" aria-labelledby="participantes-reuniao">
        <h3 id="participantes-reuniao" className="text-lg font-semibold">Participantes e presença</h3>
        {!participantIds.length && <p className="text-sm text-muted-foreground">Nenhum participante ou presença registrado.</p>}
        <ul className="divide-y">
          {participantIds.map((id) => {
            const record = confirmed.get(id);
            return <li key={id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
              <div className="min-w-0 break-words"><p className="font-medium">{name(id)}</p>
                <p className="text-xs text-muted-foreground">{linked.includes(id) ? "Participante relacionado" : "Presença registrada sem vínculo prévio"}</p>
                {record && <p className="text-xs text-muted-foreground">{formatDateTimeFortaleza(record.at)} · {name(record.recordedBy)}</p>}
              </div>
              <StatusBadge label={record ? "Presença confirmada" : "Presença não confirmada"} tone={record ? "success" : "neutral"} />
            </li>;
          })}
        </ul>
        {manage && meeting.status === "realizada" && <MeetingEvidenceForm meetingId={meeting.id} kind="attendance"
          options={attendanceOptions.filter((person) => !confirmed.has(person.value))} />}
      </section>
    </div>

    <section id="atividades-reuniao" className="surface-card scroll-mt-20 space-y-4 p-4 sm:p-5" aria-labelledby="atividades-titulo">
      <h3 id="atividades-titulo" className="text-lg font-semibold">Atividades da reunião</h3>
      {!meeting.actionItems.length && <p className="text-sm text-muted-foreground">Nenhuma atividade registrada.</p>}
      <ul className="grid gap-3 md:grid-cols-2">
        {meeting.actionItems.map((item) => <li key={item.id} className="min-w-0 space-y-2 rounded-lg border p-3 text-sm">
          <p className="break-words font-semibold">{item.description}</p>
          <StatusBadge label={item.done ? "Concluída" : "Pendente"} tone={item.done ? "success" : "warning"} />
          <p>Responsável: {item.responsibleId ? name(item.responsibleId) : "Não definido"}</p>
          <p>Prazo: {item.dueDate ? formatDateOnly(item.dueDate) : "Não definido"}</p>
          {item.completion && <p className="text-xs text-muted-foreground">Conclusão registrada por {name(item.completion.actorId)} em {formatDateTimeFortaleza(item.completion.at)}.
            {item.completion.dueDate ? ` Prazo registrado na conclusão: ${formatDateOnly(item.completion.dueDate)}.` : ""}</p>}
        </li>)}
      </ul>
      {manage && <MeetingEvidenceForm meetingId={meeting.id} kind="completion"
        options={meeting.actionItems.filter((item) => !item.done).map((item) => ({ value: item.id, label: item.description }))} />}
      {manage && (meeting.status === "agendada" || meeting.status === "realizada") && <details className="mt-3 rounded-lg border p-3">
        <summary className="cursor-pointer rounded font-medium focus-visible:outline-2 focus-visible:outline-ring">Adicionar atividade</summary>
        <div className="pt-3"><MeetingTaskEditor id={meeting.id} people={people} /></div>
      </details>}
    </section>

    <div className="grid gap-4 lg:grid-cols-2">
      <section id="ata-reuniao" className="surface-card scroll-mt-20 space-y-3 p-4 sm:p-5" aria-labelledby="ata-titulo">
        <h3 id="ata-titulo" className="text-lg font-semibold">Ata da reunião</h3>
        <TextOrEmpty value={meeting.minutes?.text} empty="Nenhuma ata registrada." />
        {meeting.minutes && <p className="text-sm text-muted-foreground">Registrada por {name(meeting.minutes.registeredBy)} em {formatDateTimeFortaleza(meeting.minutes.registeredAt)}.</p>}
        {manage && meeting.status === "realizada" && meeting.minutes && !meeting.minutesApprovedAt && <MeetingMinutesEditor key={meeting.id} id={meeting.id} text={meeting.minutes?.text} />}
      </section>
      <section className="surface-card min-w-0 space-y-3 p-4 sm:p-5" aria-labelledby="materiais-reuniao">
        <h3 id="materiais-reuniao" className="text-lg font-semibold">Anexos</h3>
        {!linkedDocs.length && <p className="text-sm text-muted-foreground">Nenhum anexo vinculado.</p>}
        <ul className="space-y-2">{linkedDocs.map((doc) => <li key={doc.id} className="space-y-1 rounded-lg border p-2">
          <p className="break-words text-sm">{doc.fileName ?? "Anexo indisponível"}</p>
          {doc.fileName && <MeetingFile attachmentId={doc.id} />}
        </li>)}</ul>
        <h3 className="border-t pt-3 text-lg font-semibold">Gravação e transcrição</h3>
        <MeetingMediaPanel key={meeting.id} meetings={[meeting]} manageableMeetingIds={manage ? [meeting.id] : []} />
        {meeting.transcript ? <details className="rounded-lg border p-3">
          <summary className="cursor-pointer rounded font-medium focus-visible:outline-2 focus-visible:outline-ring">Ler transcrição registrada</summary>
          <div className="pt-2"><TextOrEmpty value={meeting.transcript} empty="" /></div>
        </details> : <p className="text-sm text-muted-foreground">Nenhuma transcrição registrada.</p>}
      </section>
    </div>
    <MeetingReview id={meeting.id} canManage={manage && meeting.status !== "cancelada"} realized={meeting.status === "realizada"}
      hasAudio={Boolean(meeting.audioPath)} hasTranscript={Boolean(meeting.transcript)} hasMinutes={Boolean(meeting.minutes)}
      approved={Boolean(meeting.minutesApprovedAt)} draft={meeting.minutesDraft} reviewed={Boolean(meeting.minutesReviewedAt)}
      suggestions={meeting.minutesSuggestions ?? []} people={people} state={meeting.aiState} stage={meeting.aiStage} />
  </section>;
}

async function Content({ searchParams }: { searchParams: Promise<Query> }) {
  const raw = await searchParams;
  const selectedId = typeof raw.reuniao === "string" ? raw.reuniao : undefined;
  const search = typeof raw.busca === "string" ? raw.busca.trim().slice(0, 200) : "";
  const statusFilter = typeof raw.situacao === "string" && Object.hasOwn(MEETING_STATUS, raw.situacao) ? raw.situacao : "";
  const result = await loadScreen(async ({ services, actor }) => {
    const [meetings, councils] = await Promise.all([services.meetings.list(actor), services.councils.list(actor)]);
    if (!meetings.ok) return meetings;
    if (!councils.ok) return councils;
    const selected = meetings.data.find((meeting) => meeting.id === selectedId);
    if (selectedId && !selected) return fail("NOT_FOUND", "Reunião não encontrada.");
    const manageable = councils.data.filter((council) => can(actor, "meeting.manage", council.id));
    const manageSelected = Boolean(selected && can(actor, "meeting.manage", selected.councilId));
    const councilIds = [...new Set(meetings.data.map((m) => m.councilId))];
    const catalog = await Promise.all(councilIds.map(async (id) => ({
      id, people: await services.memberships.meetingDirectory(actor, id),
    })));
    const names = Object.fromEntries(catalog.flatMap(({ people }) => people.map((person) => [person.id, person.fullName || "Nome indisponível"])));
    const localDirectory = catalog.find((entry) => entry.id === selected?.councilId)?.people ?? [];
    const toOption = (p: typeof localDirectory[number]) => ({ value: p.id, label: p.fullName || "Nome indisponível" });
    const people = localDirectory.filter((p) => p.active).map(toOption);
    const attendanceOptions = localDirectory.map(toOption);
    let docs: AttachmentRow[] = [];
    if (selected && (manageSelected || selected.attachmentIds?.length)) {
      const db = await createSessionClient();
      docs = await selectAll<AttachmentRow>("meetings.attachments", (from, to) => {
        const base = db.from("attachments").select("id,file_name").eq("council_id", selected.councilId)
          .eq("upload_status", "confirmed").neq("retention_state", "disposed").order("file_name").order("id").range(from, to);
        return manageSelected ? base : base.in("id", selected.attachmentIds ?? []);
      });
    }
    return ok({ meetings: meetings.data, selected, manageSelected, people, attendanceOptions, names, docs, now: systemRuntime.now().getTime(),
      labels: Object.fromEntries(councils.data.map((council) => [council.id, council.acronym])),
      manageable: manageable.map((council) => ({ value: council.id, label: council.acronym })),
    });
  });
  return <Screen result={result}>{({ meetings, selected, manageSelected, people, attendanceOptions, names, docs, labels, manageable, now }) => {
    const ordered = [...meetings].sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
    const future = ordered.filter((m) => m.status === "agendada" && m.scheduledAt.getTime() >= now);
    const finished = meetings.filter((m) => m.status === "realizada");
    const other = meetings.filter((m) => !future.includes(m) && !finished.includes(m));
    const matches = (meeting: Meeting) =>
      (!statusFilter || meeting.status === statusFilter)
      && (!search || [meeting.title, meeting.agenda, labels[meeting.councilId]].some((text) => text?.toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR"))));
    return <div className="space-y-6">
      <PageHeader eyebrow="Agenda · Governança" title="Reuniões" description="Organize encontros e acompanhe decisões, atividades e atas."
        actions={<><Link href="/calendario" className={buttonVariants({ variant: "outline" })}>Abrir calendário</Link>
          {manageable.length > 0 && <a href="#agendar-reuniao" className={buttonVariants()}>Agendar reunião</a>}</>} />
      {selected && <MeetingDetail key={selected.id} meeting={selected} council={labels[selected.councilId] ?? "Órgão"}
        names={names} people={people} attendanceOptions={attendanceOptions} docs={docs} manage={manageSelected} />}
      <section aria-label="Resumo de reuniões" className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-4">
        <KpiCard icon={<CalendarDays size={16} aria-hidden />} label="Reuniões" value={meetings.length} />
        <KpiCard icon={<CalendarClock size={16} aria-hidden />} label="Próximas" value={future.length} />
        <KpiCard icon={<FileCheck2 size={16} aria-hidden />} label="Realizadas com ata" value={finished.filter((m) => m.minutes).length} />
        <KpiCard icon={<ListTodo size={16} aria-hidden />} label="Atividades abertas" value={meetings.flatMap((m) => m.actionItems).filter((i) => !i.done).length} />
      </section>
      <form action="/reunioes" className="surface-card flex flex-wrap items-end gap-3 p-3" role="search" aria-label="Filtrar reuniões">
        <label className="grid min-w-0 flex-1 basis-full gap-1 text-sm sm:basis-56">Buscar reuniões
          <Input name="busca" defaultValue={search} maxLength={200} />
        </label>
        <label className="grid gap-1 text-sm">Situação
          <select name="situacao" defaultValue={statusFilter} className="h-10 rounded-lg border border-input bg-card px-2">
            <option value="">Todas</option>
            {Object.entries(MEETING_STATUS).map(([id, presentation]) => <option key={id} value={id}>{presentation.label}</option>)}
          </select>
        </label>
        <Button type="submit" variant="outline">Filtrar</Button>
        {(search || statusFilter) && <Link className={buttonVariants({ variant: "ghost" })} href="/reunioes">Limpar filtros</Link>}
      </form>
      {[
        { title: "Próximas reuniões", id: "proximas-reunioes", entries: future, empty: "Nenhuma reunião futura." },
        { title: "Reuniões concluídas", id: "reunioes-concluidas", entries: finished, empty: "Nenhuma reunião concluída." },
        { title: "Outras reuniões", id: "outras-reunioes", entries: other, empty: "" },
      ].filter((group) => group.empty || group.entries.length).map((group) => (
        <section key={group.id} aria-labelledby={group.id} className="space-y-3">
          <h2 id={group.id} className="text-xl font-semibold">{group.title}</h2>
          {!group.entries.length && <p className="surface-card p-4 text-sm text-muted-foreground">{group.empty}</p>}
          <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {group.entries.filter(matches).map((meeting, index) => <MeetingCard key={meeting.id} meeting={meeting}
              council={labels[meeting.councilId] ?? "Órgão"} names={names} selected={selected?.id === meeting.id}
              highlight={group.id === "proximas-reunioes" && index === 0} />)}
          </div>
          {group.entries.length > 0 && !group.entries.some(matches) && <p className="text-sm text-muted-foreground">Nenhuma reunião corresponde aos filtros neste grupo.</p>}
        </section>
      ))}
      {manageable.length > 0 && <section id="agendar-reuniao" aria-labelledby="novo" className="surface-card w-full max-w-3xl scroll-mt-20 p-4 sm:p-6">
        <h2 id="novo" className="mb-3 text-xl font-semibold">Agendar reunião</h2>
        <p className="mb-4 text-sm text-muted-foreground">Defina o órgão, o título e o horário. A pauta e os participantes podem ser incluídos no detalhe.</p>
        <NewMeetingForm councils={manageable} defaultCouncilId={manageable.length === 1 ? manageable[0].value : undefined} openDetails />
      </section>}
    </div>;
  }}</Screen>;
}

export default function MeetingsPage({ searchParams }: { searchParams: Promise<Query> }) {
  return <Suspense fallback={<LoadingState title="Carregando reuniões…" />}><Content searchParams={searchParams} /></Suspense>;
}
