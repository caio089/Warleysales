import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  MONTH_TITLE,
  calendarMarks,
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

export const metadata: Metadata = { title: "Calendário" };

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function monthKey(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

function calendarHref(year: number, month: number, councilId: string | null): string {
  const params = new URLSearchParams({ mes: monthKey(year, month) });
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

function sortMarks(marks: readonly CalendarMark[]): CalendarMark[] {
  return [...marks].sort((left, right) => {
    const leftDay = left.day ?? "99";
    const rightDay = right.day ?? "99";
    if (leftDay !== rightDay) return leftDay.localeCompare(rightDay);
    if (left.kind !== right.kind) return left.kind === "concluir" ? -1 : 1;
    return left.title.localeCompare(right.title, "pt-BR");
  });
}

function MarkLink({ mark, compact = false }: { mark: CalendarMark; compact?: boolean }) {
  const label = mark.kind === "concluir" ? "Concluir" : "Vence";
  return (
    <Link
      href={`/solicitacoes/${mark.requestId}`}
      title={`${label}: ${mark.title}`}
      className={cn(
        "block truncate rounded px-1 py-0.5 font-medium leading-tight",
        compact ? "text-[10px]" : "text-xs",
        mark.kind === "concluir" ? "bg-sky-100 text-sky-950 hover:bg-sky-200" : "bg-amber-100 text-amber-950 hover:bg-amber-200",
      )}
    >
      {label} · {mark.title}
    </Link>
  );
}

async function Content({ searchParams }: { searchParams: Promise<{ mes?: string; orgao?: string }> }) {
  const raw = await searchParams;
  await connection();
  const todayParts = toFortalezaDate(new Date());
  const [todayYear, todayMonth] = todayParts.split("-").map(Number);
  const viewed = parseCalendarMonth(raw.mes, { year: todayYear ?? 2027, month: (todayMonth ?? 1) - 1 });

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
      marks: marksInMonth(marks, viewed.year, viewed.month),
    });
  });

  const previous = shiftMonth(viewed.year, viewed.month, -1);
  const next = shiftMonth(viewed.year, viewed.month, 1);
  const weeks = monthWeeks(viewed.year, viewed.month);

  return (
    <Screen result={result}>
      {({ lookups, councilId, locked, isCentralAdmin, marks }) => {
        const councilName = councilId ? lookups.councilLabel[councilId] : null;
        const byDay = new Map<string, CalendarMark[]>();
        const monthOnly: CalendarMark[] = [];
        for (const mark of marks) {
          if (!mark.day) {
            monthOnly.push(mark);
            continue;
          }
          const bucket = byDay.get(mark.day) ?? [];
          bucket.push(mark);
          byDay.set(mark.day, bucket);
        }
        const ordered = sortMarks(marks);
        const seenDays = new Set<string>();
        const anchors = new Map<string, string>();
        for (const mark of ordered) {
          if (mark.day && !seenDays.has(mark.day)) {
            seenDays.add(mark.day);
            anchors.set(mark.id, `dia-${mark.day}`);
          } else {
            anchors.set(mark.id, `marca-${mark.id}`);
          }
        }
        const concludeCount = marks.filter((mark) => mark.kind === "concluir").length;
        const expiryCount = marks.filter((mark) => mark.kind === "vencimento").length;

        return (
          <>
            <PageHeader
              eyebrow="Acompanhamento · Plano"
              title={councilName ? `Calendário · ${councilName}` : "Calendário do plano"}
              description={locked
                ? "Só as contratações do seu órgão. O mês previsto é para concluir; o vencimento é a data que o plano já registra."
                : "Mês previsto para concluir e vencimento de cada contratação do plano. O filtro mostra apenas órgãos que você pode acompanhar."}
            />

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-sm">
              <div className="flex items-center gap-1">
                <Link href={calendarHref(previous.year, previous.month, councilId)} className={buttonVariants({ variant: "ghost", size: "icon" })} aria-label="Mês anterior">
                  <ChevronLeft />
                </Link>
                <p className="min-w-40 text-center text-sm font-semibold text-slate-800">
                  {MONTH_TITLE[viewed.month]} de {viewed.year}
                </p>
                <Link href={calendarHref(next.year, next.month, councilId)} className={buttonVariants({ variant: "ghost", size: "icon" })} aria-label="Próximo mês">
                  <ChevronRight />
                </Link>
                <Link href={calendarHref(todayYear ?? viewed.year, (todayMonth ?? 1) - 1, councilId)} className={buttonVariants({ variant: "outline", size: "sm" })}>
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
                  mes={monthKey(viewed.year, viewed.month)}
                  allLabel={isCentralAdmin ? "Todos os órgãos" : "Todos os meus órgãos"}
                />
              )}
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-sky-400" aria-hidden /> Concluir no mês ({concludeCount})</span>
              <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-amber-400" aria-hidden /> Vencimento ({expiryCount})</span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="min-w-[720px]">
                <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                  {WEEKDAYS.map((weekday) => <div key={weekday} className="px-2 py-2">{weekday}</div>)}
                </div>
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="grid grid-cols-7 border-b border-slate-100 last:border-b-0">
                    {week.map((day, dayIndex) => {
                      if (!day) return <div key={`${weekIndex}-${dayIndex}`} className="min-h-24 bg-slate-50/60" />;
                      const key = dayKey(viewed.year, viewed.month, day);
                      const dayMarks = byDay.get(key) ?? [];
                      const visible = dayMarks.slice(0, 2);
                      const hidden = dayMarks.length - visible.length;
                      const isToday = key === todayParts;
                      return (
                        <div key={key} className={cn("min-h-24 border-l border-slate-100 p-1.5 first:border-l-0", isToday && "bg-sky-50/70")}>
                          <p className={cn("mb-1 text-xs font-semibold", isToday ? "text-sky-800" : "text-slate-500")}>{day}</p>
                          <div className="space-y-1">
                            {visible.map((mark) => <MarkLink key={mark.id} mark={mark} compact />)}
                            {hidden > 0 ? <a href={`#dia-${key}`} className="block px-1 text-[10px] font-semibold text-slate-500 hover:text-slate-800">+{hidden}</a> : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <section className="mt-6" aria-labelledby="lista-do-mes">
              <h2 id="lista-do-mes" className="mb-3 text-sm font-semibold text-slate-800">Contratações de {MONTH_TITLE[viewed.month].toLowerCase()}</h2>
              {ordered.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-sm text-slate-500">Nenhuma contratação do plano neste mês.</p>
              ) : (
                <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  {ordered.map((mark) => (
                    <li key={mark.id} id={anchors.get(mark.id)} className="flex flex-wrap items-center gap-3 px-4 py-3">
                      <span className="w-28 shrink-0 text-xs font-medium text-slate-500">{mark.day ? mark.day.split("-").reverse().join("/") : "Mês inteiro"}</span>
                      <span className="min-w-0 flex-1">
                        <MarkLink mark={mark} />
                        <span className="mt-1 block text-[11px] text-slate-500">
                          {lookups.councilLabel[mark.councilId] ?? "Órgão"} · {mark.detail} · {mark.origin}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {monthOnly.length > 0 ? (
                <p className="mt-2 text-xs text-slate-500">Itens em “Mês inteiro” têm mês no plano, sem um dia fechado.</p>
              ) : null}
            </section>
          </>
        );
      }}
    </Screen>
  );
}

export default function CalendarioPage({ searchParams }: { searchParams: Promise<{ mes?: string; orgao?: string }> }) {
  return (
    <Suspense fallback={<LoadingState />}>
      <Content searchParams={searchParams} />
    </Suspense>
  );
}
