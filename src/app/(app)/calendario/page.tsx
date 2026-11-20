import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Building2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buildCalendarReport } from "@/modules/calendar/calendar-report";
import {
  MONTH_TITLE,
  PLAN_YEAR,
  calendarMarks,
  countsByMonth,
  marksInMonth,
  parseCalendarMonth,
  resolveCalendarCouncil,
  type CalendarMark,
} from "@/modules/calendar/plan-calendar";
import { loadLookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { ok } from "@/shared/lib/result";
import { toFortalezaDate } from "@/shared/lib/time";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { CalendarOrgFilter } from "./calendar-org-filter";
import { MonthDialog } from "./month-dialog";
import { CalendarReportPanel } from "./calendar-report-panel";

export const metadata: Metadata = { title: "Calendário" };


const MONTH_SHORT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function monthKey(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

function calendarHref(year: number, month: number, councilId: string | null): string {
  const params = new URLSearchParams({ mes: monthKey(year, month) });
  if (councilId) params.set("orgao", councilId);
  return `/calendario?${params.toString()}`;
}

function yearHref(year: number, councilId: string | null): string {
  const params = new URLSearchParams({ ano: String(year) });
  if (councilId) params.set("orgao", councilId);
  return `/calendario?${params.toString()}`;
}

function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const date = new Date(Date.UTC(year, month + delta, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() };
}

function parseYear(raw: string | undefined): number | null {
  if (!raw || !/^\d{4}$/.test(raw)) return null;
  return Number(raw);
}

function sortMarks(marks: readonly CalendarMark[]): CalendarMark[] {
  return [...marks].sort((left, right) => {
    const leftDay = left.day ?? "99";
    const rightDay = right.day ?? "99";
    if (leftDay !== rightDay) return leftDay.localeCompare(rightDay);
    if (left.kind !== right.kind) return left.kind === "concluir" ? -1 : 1;
    return left.title.localeCompare(right.title, "pt-BR");
  });
}

async function Content({ searchParams }: { searchParams: Promise<{ mes?: string; ano?: string; orgao?: string }> }) {
  const raw = await searchParams;
  await connection();
  const todayParts = toFortalezaDate(new Date());
  const [todayYear, todayMonth] = todayParts.split("-").map(Number);
  const monthView = raw.mes ? parseCalendarMonth(raw.mes, { year: PLAN_YEAR, month: 0 }) : null;
  const year = monthView?.year ?? parseYear(raw.ano) ?? PLAN_YEAR;

  const result = await loadScreen(async (ctx) => {
    const [requests, lookups, meetings, contracts, atas, processes] = await Promise.all([
      ctx.services.purchases.list(ctx.actor),
      loadLookups(ctx),
      ctx.services.meetings.list(ctx.actor),
      ctx.services.contracts.list(ctx.actor),
      ctx.services.atas.list(ctx.actor),
      ctx.services.processes.list(ctx.actor),
    ]);
    if (!requests.ok) return requests;
    if (!lookups.ok) return lookups;
    if (!meetings.ok) return meetings;
    if (!contracts.ok) return contracts;
    if (!atas.ok) return atas;
    if (!processes.ok) return processes;

    const allowedIds = lookups.data.councils.map((council) => council.id);
    const councilId = resolveCalendarCouncil(allowedIds, raw.orgao);
    const visible = councilId ? requests.data.filter((request) => request.councilId === councilId) : requests.data;
    const marks = calendarMarks(visible.map((request) => ({
      id: request.id,
      councilId: request.councilId,
      title: request.title,
      estimatedValue: request.estimatedValue,
      notes: request.events.map((event) => event.note),
    })));
    const processById = new Map(processes.data.map(({ process }) => [process.id, process]));
    const requestById = new Map(visible.map((request) => [request.id, request]));
    for (const mark of marks) {
      const processId = requestById.get(mark.requestId)?.processId;
      const process = processId ? processById.get(processId) : undefined;
      if (process) {
        mark.processNumber = process.number;
        mark.href = `/processos/${process.id}`;
      }
    }
    function addEvent(id: string, owner: string, title: string, date: string, href: string, origin: string, kind: CalendarMark["kind"]) {
      if (councilId && owner !== councilId) return;
      const [eventYear, eventMonth] = date.split("-").map(Number);
      if (!eventYear || !eventMonth) return;
      marks.push({ id, requestId: id, councilId: owner, title, day: date, year: eventYear,
        month: eventMonth - 1, kind, detail: date, priority: "Não informado", origin, href });
    }
    for (const meeting of meetings.data) {
      if (meeting.status !== "cancelada") addEvent(`meeting:${meeting.id}`, meeting.councilId, meeting.title,
        toFortalezaDate(meeting.scheduledAt), `/reunioes?reuniao=${meeting.id}`, "Reunião", "concluir");
    }
    for (const entry of contracts.data) {
      addEvent(`contract:${entry.contract.id}`, entry.contract.councilId,
        `Contrato ${entry.contract.number} — ${entry.contract.object}`, entry.terms.endDate,
        `/contratos/${entry.contract.id}`, "Vencimento de contrato", "vencimento");
    }
    for (const entry of atas.data) {
      addEvent(`ata:${entry.ata.id}`, entry.ata.councilId, `Ata ${entry.ata.number}`, entry.endDate,
        `/atas/${entry.ata.id}`, "Vencimento de ata", "vencimento");
    }

    return ok({
      lookups: lookups.data,
      councilId,
      locked: allowedIds.length <= 1,
      isCentralAdmin: ctx.actor.isCentralAdmin,
      marks,
    });
  });

  const preserved = monthView ? `mes=${monthKey(monthView.year, monthView.month)}` : `ano=${year}`;

  return (
    <Screen result={result}>
      {({ lookups, councilId, locked, isCentralAdmin, marks }) => {
        const councilName = councilId ? lookups.councilLabel[councilId] : null;
        const counts = countsByMonth(marks, year);
        const report = buildCalendarReport(marks, year);
        const years = [...new Set([2026, PLAN_YEAR, ...marks.map((mark) => mark.year)])].sort((left, right) => left - right);
        const monthMarks = monthView ? sortMarks(marksInMonth(marks, monthView.year, monthView.month)) : [];
        const previous = monthView ? shiftMonth(year, monthView.month, -1) : null;
        const next = monthView ? shiftMonth(year, monthView.month, 1) : null;

        return (
          <>
            <PageHeader
              eyebrow="Acompanhamento · Plano"
              title={councilName ? `Calendário · ${councilName}` : "Calendário"}
              description={locked
                ? "Demandas, reuniões e vencimentos do seu órgão."
                : "Demandas, reuniões e vencimentos dos órgãos que você acompanha."}
              actions={
                <Link href="#relatorio" className={`${buttonVariants({ variant: "outline", size: "sm" })} print:hidden`}>
                  Ver relatório
                </Link>
              }
            />

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-sm">
              <div className="flex flex-wrap items-center gap-1">
                {years.map((option) => (
                  <Link
                    key={option}
                    href={yearHref(option, councilId)}
                    className={cn(buttonVariants({ variant: option === year && !monthView ? "default" : "outline", size: "sm" }))}
                    aria-current={option === year && !monthView ? "page" : undefined}
                  >
                    {option}
                  </Link>
                ))}
                <Link href={calendarHref(todayYear ?? year, (todayMonth ?? 1) - 1, councilId)} className={buttonVariants({ variant: "outline", size: "sm" })}>
                  Hoje
                </Link>
              </div>

              {locked ? (
                <p className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700">
                  <Building2 className="size-4 text-slate-400" aria-hidden />
                  {councilName ?? "Nenhum órgão no seu acesso"}
                </p>
              ) : (
                <CalendarOrgFilter
                  councils={lookups.councils}
                  councilId={councilId}
                  preserved={preserved}
                  allLabel={isCentralAdmin ? "Todos os órgãos" : "Todos os meus órgãos"}
                />
              )}
            </div>

            <nav aria-label="Meses do ano" className="mb-4 grid grid-cols-4 gap-1.5 sm:grid-cols-6 lg:grid-cols-12">
              {MONTH_SHORT.map((label, month) => {
                const count = counts[month] ?? 0;
                const active = monthView?.month === month && monthView.year === year;
                return (
                  <Link
                    key={label}
                    href={calendarHref(year, month, councilId)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "rounded-xl px-2 py-4 text-center text-sm font-semibold transition hover:ring-2 hover:ring-sky-600 focus-visible:ring-2 focus-visible:ring-sky-600",
                      active ? "bg-[#0F2942] text-white" : count > 0 ? "bg-white text-slate-800 ring-1 ring-slate-200" : "bg-slate-100 text-slate-600",
                    )}
                  >
                    {label}
                    <span className="mt-0.5 block text-[10px] font-medium">{count}</span>
                  </Link>
                );
              })}
            </nav>

            {monthView && previous && next ? (
              <MonthDialog
                title={`${MONTH_TITLE[monthView.month]} de ${year}`}
                year={year}
                month={monthView.month}
                today={todayParts}
                marks={monthMarks}
                councilLabels={lookups.councilLabel}
                previousHref={calendarHref(previous.year, previous.month, councilId)}
                nextHref={calendarHref(next.year, next.month, councilId)}
                todayHref={calendarHref(todayYear, todayMonth - 1, councilId)}
                closeHref={yearHref(year, councilId)}
              >
                {locked ? <p className="text-sm">{councilName}</p> : (
                  <CalendarOrgFilter councils={lookups.councils} councilId={councilId} preserved={preserved}
                    allLabel={isCentralAdmin ? "Todos os órgãos" : "Todos os meus órgãos"} />
                )}
              </MonthDialog>
            ) : null}
            <CalendarReportPanel
              report={report}
              councilLabel={lookups.councilLabel}
              scopeLabel={councilName ?? (isCentralAdmin ? "Todos os órgãos" : "Meus órgãos")}
            />
          </>
        );
      }}
    </Screen>
  );
}

export default function CalendarioPage({ searchParams }: { searchParams: Promise<{ mes?: string; ano?: string; orgao?: string }> }) {
  return (
    <Suspense fallback={<LoadingState />}>
      <Content searchParams={searchParams} />
    </Suspense>
  );
}
