import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { buttonVariants } from "@/components/ui/button";
import { localTime, type AgendaEvent } from "@/modules/calendar/agenda";
import { buildCalendarReport } from "@/modules/calendar/calendar-report";
import { calendarMarks, PLAN_YEAR } from "@/modules/calendar/plan-calendar";
import { loadScreen } from "@/server/screen";
import { createSessionClient } from "@/server/supabase/session-client";
import { can } from "@/shared/lib/authz/policy";
import { fail, ok } from "@/shared/lib/result";
import { isValidDateOnly, toFortalezaDate } from "@/shared/lib/time";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { AgendaBoard } from "./agenda-board";
import { CalendarOrgFilter } from "./calendar-org-filter";
import { CalendarReportPanel } from "./calendar-report-panel";

export const metadata: Metadata = { title: "Calendário" };

type Query = { mes?: string; ano?: string; orgao?: string; dia?: string };
interface AppointmentRow {
  id: string;
  council_id: string;
  created_by: string;
  title: string;
  description: string;
  starts_at: string;
  ends_at: string;
}

async function Content({ searchParams }: { searchParams: Promise<Query> }) {
  const raw = await searchParams;
  const result = await loadScreen(async ({ actor, services }) => {
    const db = await createSessionClient();
    const appointments: AppointmentRow[] = [];
    for (let from = 0; ; from += 500) {
      const response = await db.from("calendar_appointments").select("id,council_id,created_by,title,description,starts_at,ends_at")
        .order("id").range(from, from + 499).returns<AppointmentRow[]>();
      if (response.error) return fail("INTERNAL", "Não foi possível consultar os compromissos do calendário.");
      appointments.push(...response.data);
      if (response.data.length < 500) break;
    }
    const [requests, councils, meetings, contracts, atas, processes] = await Promise.all([
      services.purchases.list(actor), services.councils.list(actor), services.meetings.list(actor),
      services.contracts.list(actor), services.atas.list(actor), services.processes.list(actor),
    ]);
    if (!requests.ok) return requests;
    if (!councils.ok) return councils;
    if (!meetings.ok) return meetings;
    if (!contracts.ok) return contracts;
    if (!atas.ok) return atas;
    if (!processes.ok) return processes;

    const options = councils.data.map((c) => ({ value: c.id, label: c.acronym }));
    const writable = options.filter((c) => can(actor, "meeting.manage", c.value));
    const people = (await Promise.all(options.map(async (c) => (
      await services.memberships.processAssignees(actor, c.value)
    ).map((p) => ({ councilId: c.value, value: p.id, label: p.fullName || p.id }))))).flat();
    const processesById = new Map(processes.data.map(({ process }) => [process.id, process]));
    const requestsById = new Map(requests.data.map((request) => [request.id, request]));
    const marks = calendarMarks(requests.data.map((request) => ({
      id: request.id, councilId: request.councilId, title: request.title,
      estimatedValue: request.estimatedValue, notes: request.events.map((event) => event.note),
    })));
    const events: AgendaEvent[] = [];
    const monthPlans: { id: string; month: string; councilId: string; title: string; href: string; personId?: string }[] = [];
    for (const mark of marks) {
      const request = requestsById.get(mark.requestId);
      const process = request?.processId ? processesById.get(request.processId) : undefined;
      mark.href = process ? `/solicitacoes/processos/${process.id}` : `/solicitacoes/${mark.requestId}`;
      if (process) mark.processNumber = process.number;
      if (mark.day) events.push({ id: `plan:${mark.id}`, type: "processo", councilId: mark.councilId,
        title: mark.title, day: mark.day, href: mark.href, description: mark.detail, personId: process?.responsibleId ?? undefined });
      else monthPlans.push({ id: mark.id, month: `${mark.year}-${String(mark.month + 1).padStart(2, "0")}`,
        councilId: mark.councilId, title: mark.title, href: mark.href, personId: process?.responsibleId ?? undefined });
    }
    const addSource = (event: AgendaEvent, origin: string, includeInReport = true) => {
      if (!isValidDateOnly(event.day)) return;
      events.push(event);
      if (includeInReport) {
        const [year, month] = event.day.split("-").map(Number);
        marks.push({ id: event.id, requestId: event.id, councilId: event.councilId, title: event.title,
          day: event.day, year, month: month - 1, kind: event.type === "reuniao" ? "concluir" : "vencimento",
          detail: event.day, priority: "Não informado", origin, href: event.href });
      }
    };
    for (const meeting of meetings.data) {
      const href = `/reunioes?reuniao=${meeting.id}`;
      if (meeting.status !== "cancelada") addSource({
        id: `meeting:${meeting.id}`, type: "reuniao", councilId: meeting.councilId, title: meeting.title,
        day: toFortalezaDate(meeting.scheduledAt), time: localTime(meeting.scheduledAt), href,
        personId: meeting.responsibleId ?? undefined,
        personIds: [meeting.createdBy, ...(meeting.participantIds ?? []), ...(meeting.attendance ?? []).map((row) => row.participantId)],
        description: meeting.agenda ?? undefined,
      }, "Reunião");
      for (const task of meeting.actionItems) {
        if (task.dueDate) addSource({
          id: `task:${task.id}`, type: "tarefa", councilId: meeting.councilId, title: task.description,
          day: task.dueDate, href, personId: task.responsibleId ?? undefined,
          description: task.done ? "Tarefa concluída." : "Tarefa pendente.",
        }, "Prazo de tarefa", false);
      }
    }
    for (const { contract, terms } of contracts.data) addSource({
      id: `contract:${contract.id}`, type: "contrato", councilId: contract.councilId,
      title: `Contrato ${contract.number}`, description: contract.object, day: terms.endDate, href: `/contratos/${contract.id}`,
    }, "Vencimento de contrato");
    for (const { ata, endDate } of atas.data) addSource({
      id: `ata:${ata.id}`, type: "ata", councilId: ata.councilId,
      title: `Ata ${ata.number}`, day: endDate, href: `/atas/${ata.id}`,
    }, "Vencimento de ata");
    for (const appointment of appointments) {
      const start = new Date(appointment.starts_at), end = new Date(appointment.ends_at);
      events.push({
        id: appointment.id, type: "compromisso", councilId: appointment.council_id,
        title: appointment.title, description: appointment.description, day: toFortalezaDate(start),
        personId: appointment.created_by, time: localTime(start), until: localTime(end),
        startsAt: appointment.starts_at, endsAt: appointment.ends_at,
        editable: can(actor, "meeting.manage", appointment.council_id),
      });
    }

    const today = toFortalezaDate(new Date());
    const dayLink = typeof raw.dia === "string" && isValidDateOnly(raw.dia) ? raw.dia : null;
    const initialDate = dayLink ?? (typeof raw.mes === "string" && isValidDateOnly(`${raw.mes}-01`) ? `${raw.mes}-01`
      : typeof raw.ano === "string" && isValidDateOnly(`${raw.ano}-01-01`) ? `${raw.ano}-01-01` : today);
    const initialCouncil = options.some((c) => c.value === raw.orgao) ? raw.orgao! : "";
    const reportYear = raw.ano || raw.mes ? Number(initialDate.slice(0, 4)) : PLAN_YEAR;
    return ok({ today, initialDate, initialCouncil, events, councils: options, writable, people, monthPlans, initialView: dayLink ? "dia" as const : "mes" as const,
      reportYears: [...new Set([today.slice(0, 4), String(PLAN_YEAR), ...marks.map((m) => String(m.year))])].sort(),
      report: buildCalendarReport(marks.filter((m) => !initialCouncil || initialCouncil === m.councilId), reportYear),
      councilLabels: Object.fromEntries(options.map((c) => [c.value, c.label])),
    });
  });
  return <Screen result={result}>{({ report, reportYears, councilLabels, ...agenda }) => <>
    <PageHeader eyebrow="Agenda" title="Calendário" description="Acompanhe compromissos e prazos em horário de Fortaleza."
      actions={<Link href="#relatorio" className={buttonVariants({ variant: "outline" })}>Ver relatório do plano</Link>} />
    <AgendaBoard {...agenda} />
    <div className="flex flex-wrap items-center gap-3 print:hidden">
      <nav aria-label="Ano do relatório do plano" className="flex flex-wrap gap-2">
        {reportYears.map((year) => {
          const params = new URLSearchParams({ ano: year });
          if (agenda.initialCouncil) params.set("orgao", agenda.initialCouncil);
          return <Link key={year} href={`/calendario?${params}#relatorio`}
            aria-current={Number(year) === report.year ? "page" : undefined}
            className={buttonVariants({ variant: Number(year) === report.year ? "default" : "outline", size: "sm" })}>{year}</Link>;
        })}
      </nav>
      {agenda.councils.length > 1 && <CalendarOrgFilter
        councils={agenda.councils.map(({ value, label }) => ({ id: value, label }))}
        councilId={agenda.initialCouncil || null} preserved={`ano=${report.year}`} allLabel="Todos os órgãos do relatório" />}
    </div>
    <CalendarReportPanel report={report} councilLabel={councilLabels} scopeLabel={councilLabels[agenda.initialCouncil] ?? "Órgãos acessíveis"} />
  </>}</Screen>;
}

export default function CalendarioPage({ searchParams }: { searchParams: Promise<Query> }) {
  return <Suspense fallback={<LoadingState title="Carregando calendário…" />}><Content searchParams={searchParams} /></Suspense>;
}
