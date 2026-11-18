import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buildCalendarReport } from "@/modules/calendar/calendar-report";
import {
  MONTH_TITLE,
  PLAN_YEAR,
  calendarMarks,
  countsByMonth,
  marksInMonth,
  monthWeeks,
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
import { CalendarReportPanel } from "./calendar-report-panel";

export const metadata: Metadata = { title: "Calendário" };

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
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

function dayKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
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

function MarkCard({ mark, council }: { mark: CalendarMark; council: string }) {
  const when = mark.day ? mark.day.split("-").reverse().join("/") : mark.detail;
  const conclude = mark.kind === "concluir";
  return (
    <Link
      href={`/solicitacoes/${mark.requestId}`}
      className="block rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-colors hover:border-slate-300"
    >
      <p className={cn("text-[11px] font-semibold tracking-wide uppercase", conclude ? "text-sky-800" : "text-amber-800")}>
        {conclude ? "Concluir" : "Vence"} · {when}
      </p>
      <p className="mt-1 line-clamp-2 text-sm font-medium text-slate-900">{mark.title}</p>
      <p className="mt-1 text-[11px] text-slate-500">{council} · {mark.origin}</p>
    </Link>
  );
}

function MarkCards({ marks, councilLabel }: { marks: readonly CalendarMark[]; councilLabel: Record<string, string> }) {
  if (marks.length === 0) {
    return <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-sm text-slate-500">Nenhuma contratação do plano neste mês.</p>;
  }
  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {marks.map((mark) => (
        <li key={mark.id}>
          <MarkCard mark={mark} council={councilLabel[mark.councilId] ?? "Órgão"} />
        </li>
      ))}
    </ul>
  );
}

async function Content({ searchParams }: { searchParams: Promise<{ mes?: string; ano?: string; orgao?: string }> }) {
  const raw = await searchParams;
  await connection();
  const todayParts = toFortalezaDate(new Date());
  const [todayYear, todayMonth] = todayParts.split("-").map(Number);
  const monthView = raw.mes ? parseCalendarMonth(raw.mes, { year: PLAN_YEAR, month: 0 }) : null;
  const year = monthView?.year ?? parseYear(raw.ano) ?? PLAN_YEAR;

  const result = await loadScreen(async (ctx) => {
    const [requests, lookups] = await Promise.all([
      ctx.services.purchases.list(ctx.actor),
      loadLookups(ctx),
    ]);
    if (!requests.ok) return requests;
    if (!lookups.ok) return lookups;

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
        const dayMarks = monthMarks.filter((mark) => mark.day);
        const concludeCount = monthView
          ? monthMarks.filter((mark) => mark.kind === "concluir").length
          : report.conclude;
        const expiryCount = monthView
          ? monthMarks.filter((mark) => mark.kind === "vencimento").length
          : report.expiry;
        const previous = monthView ? shiftMonth(monthView.year, monthView.month, -1) : null;
        const next = monthView ? shiftMonth(monthView.year, monthView.month, 1) : null;
        const weeks = monthView ? monthWeeks(monthView.year, monthView.month) : [];
        const byDay = new Map<string, CalendarMark[]>();
        for (const mark of dayMarks) {
          const bucket = byDay.get(mark.day!) ?? [];
          bucket.push(mark);
          byDay.set(mark.day!, bucket);
        }

        return (
          <>
            <PageHeader
              eyebrow="Acompanhamento · Plano"
              title={councilName ? `Calendário · ${councilName}` : "Calendário do plano"}
              description={locked
                ? "Só as contratações do seu órgão. Cada cartão é uma data do plano: mês para concluir ou vencimento."
                : "Cada cartão é uma contratação do plano, no mês em que ela deve ser concluída ou vence. O filtro mostra apenas órgãos que você pode acompanhar."}
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
                {monthView && previous && next ? (
                  <>
                    <Link href={calendarHref(previous.year, previous.month, councilId)} className={buttonVariants({ variant: "ghost", size: "icon" })} aria-label="Mês anterior">
                      <ChevronLeft />
                    </Link>
                    <p className="min-w-36 text-center text-sm font-semibold text-slate-800">{MONTH_TITLE[monthView.month]} de {monthView.year}</p>
                    <Link href={calendarHref(next.year, next.month, councilId)} className={buttonVariants({ variant: "ghost", size: "icon" })} aria-label="Próximo mês">
                      <ChevronRight />
                    </Link>
                  </>
                ) : (
                  <p className="px-2 text-sm font-semibold text-slate-800">Ano {year}</p>
                )}
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
                      "rounded-xl px-1 py-2 text-center text-[11px] font-semibold",
                      active ? "bg-[#0F2942] text-white" : count > 0 ? "bg-white text-slate-800 ring-1 ring-slate-200" : "bg-slate-100 text-slate-400",
                    )}
                  >
                    {label}
                    <span className="mt-0.5 block text-[10px] font-medium">{count}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-sky-400" aria-hidden /> Concluir ({concludeCount})</span>
              <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-amber-400" aria-hidden /> Vencimento ({expiryCount})</span>
            </div>

            {monthView ? (
              <section aria-labelledby="lista-do-mes">
                <h2 id="lista-do-mes" className="mb-3 text-sm font-semibold text-slate-800">
                  Contratações de {MONTH_TITLE[monthView.month].toLowerCase()}
                </h2>
                <MarkCards marks={monthMarks} councilLabel={lookups.councilLabel} />
              </section>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {MONTH_TITLE.map((title, month) => {
                  const items = sortMarks(marksInMonth(marks, year, month));
                  const preview = items.slice(0, 4);
                  return (
                    <section key={title} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
                        <Link href={calendarHref(year, month, councilId)} className="text-xs font-semibold text-slate-500 hover:text-slate-800">
                          {items.length === 0 ? "Vazio" : `${items.length} no mês`}
                        </Link>
                      </div>
                      {preview.length === 0 ? (
                        <p className="text-xs text-slate-400">Nenhuma contratação neste mês.</p>
                      ) : (
                        <ul className="space-y-2">
                          {preview.map((mark) => (
                            <li key={mark.id}>
                              <MarkCard mark={mark} council={lookups.councilLabel[mark.councilId] ?? "Órgão"} />
                            </li>
                          ))}
                          {items.length > preview.length ? (
                            <li>
                              <Link href={calendarHref(year, month, councilId)} className="text-xs font-semibold text-slate-600 hover:text-slate-900">
                                Ver as {items.length} contratações
                              </Link>
                            </li>
                          ) : null}
                        </ul>
                      )}
                    </section>
                  );
                })}
              </div>
            )}

            {monthView && dayMarks.length > 0 ? (
              <section className="mt-6 print:hidden" aria-labelledby="dias-fechados">
                <h2 id="dias-fechados" className="mb-3 text-sm font-semibold text-slate-800">Dias com data fechada</h2>
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="min-w-[720px]">
                    <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                      {WEEKDAYS.map((weekday) => <div key={weekday} className="px-2 py-2">{weekday}</div>)}
                    </div>
                    {weeks.map((week, weekIndex) => (
                      <div key={weekIndex} className="grid grid-cols-7 border-b border-slate-100 last:border-b-0">
                        {week.map((day, dayIndex) => {
                          if (!day) return <div key={`${weekIndex}-${dayIndex}`} className="min-h-16 bg-slate-50/60" />;
                          const key = dayKey(monthView.year, monthView.month, day);
                          const items = byDay.get(key) ?? [];
                          const isToday = key === todayParts;
                          return (
                            <div key={key} className={cn("min-h-16 border-l border-slate-100 p-1.5 first:border-l-0", isToday && "bg-sky-50/70")}>
                              <p className={cn("text-xs font-semibold", isToday ? "text-sky-800" : "text-slate-500")}>{day}</p>
                              {items.slice(0, 2).map((mark) => (
                                <Link key={mark.id} href={`/solicitacoes/${mark.requestId}`} className="mt-1 block truncate rounded bg-amber-100 px-1 text-[10px] font-medium text-amber-950">
                                  {mark.title}
                                </Link>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
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
