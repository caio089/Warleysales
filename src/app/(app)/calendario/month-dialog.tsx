"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { monthWeeks, type CalendarMark } from "@/modules/calendar/plan-calendar";

const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

interface MonthDialogProps {
  title: string;
  year: number;
  month: number;
  today: string;
  marks: CalendarMark[];
  councilLabels: Record<string, string>;
  previousHref: string;
  nextHref: string;
  todayHref: string;
  closeHref: string;
  children: ReactNode;
}

export function MonthDialog({
  title, year, month, today, marks, councilLabels, previousHref, nextHref, todayHref, closeHref, children,
}: MonthDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
  const [selection, setSelection] = useState("");
  const selected = selection.startsWith(monthKey) ? selection : today.startsWith(monthKey) ? today : "";
  const byDay = new Map<string, CalendarMark[]>();
  const byPeriod = new Map<string, CalendarMark[]>();

  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);

  for (const mark of marks) {
    const group = mark.day ? byDay : byPeriod;
    const key = mark.day ?? mark.detail;
    const items = group.get(key) ?? [];
    items.push(mark);
    group.set(key, items);
  }

  const items = byDay.get(selected) ?? [];
  const expiry = marks.filter((mark) => mark.kind === "vencimento").length;
  const total = new Set(marks.map((mark) => mark.requestId)).size;
  const control = buttonVariants({ variant: "outline", size: "sm" });

  function renderMarks(entries: CalendarMark[]) {
    return (
      <ul className="space-y-2">
        {entries.map((mark) => (
          <li key={mark.id}>
            <Link href={mark.href ?? `/solicitacoes/${mark.requestId}`}
              className="block rounded-xl border bg-white p-3 hover:border-sky-600">
              <p className={cn("text-xs font-semibold", mark.kind === "vencimento" ? "text-orange-800" : "text-sky-800")}>
                {mark.kind === "vencimento" ? "Vencimento" : "A concluir"} · {mark.day?.split("-").reverse().join("/") ?? mark.detail}
              </p>
              <p className="mt-1 break-words text-sm font-medium">{mark.title}</p>
              <p className="mt-1 text-xs text-slate-600">
                {councilLabels[mark.councilId] ?? "Órgão"} · {mark.origin}
                {mark.processNumber ? ` · Processo ${mark.processNumber}` : ""}
                {mark.priority === "Alta" ? " · Prioridade alta" : ""}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <dialog ref={dialog} aria-labelledby="calendar-month-title"
      onCancel={(event) => {
        event.preventDefault();
        router.replace(closeHref, { scroll: false });
      }}
      className="fixed inset-0 m-auto h-dvh max-h-none w-full max-w-none overflow-y-auto overscroll-contain bg-white text-slate-900 backdrop:bg-slate-950/60 print:hidden md:h-auto md:max-h-[90dvh] md:w-[90vw] md:rounded-2xl">
      <div className="sticky top-0 z-10 space-y-3 border-b bg-white p-3 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="calendar-month-title" className="mr-auto text-lg font-semibold text-[#0F2942]">{title}</h2>
          <Link href={previousHref} replace scroll={false} className={control} aria-label="Mês anterior"><ChevronLeft /></Link>
          <Link href={nextHref} replace scroll={false} className={control} aria-label="Próximo mês"><ChevronRight /></Link>
          <Link href={todayHref} replace scroll={false} className={control}>Mês atual</Link>
          <Link href={closeHref} replace scroll={false} className={control} aria-label="Fechar e voltar para visão anual"><X /></Link>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2 text-xs" aria-live="polite">
            <span className="rounded-lg bg-slate-100 px-2 py-1 font-semibold">{total} demandas no mês</span>
            <span className="rounded-lg bg-sky-100 px-2 py-1 text-sky-900">{marks.length - expiry} a concluir</span>
            <span className="rounded-lg bg-orange-100 px-2 py-1 text-orange-900">{expiry} vencimentos</span>
          </div>
          {children}
        </div>
      </div>
      <div className="grid gap-4 p-3 sm:p-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="grid grid-cols-7 self-start gap-px overflow-hidden rounded-xl border bg-slate-200">
          {weekdays.map((day) => <div key={day} className="bg-slate-100 py-2 text-center text-xs font-medium">{day}</div>)}
          {monthWeeks(year, month, 0).flat().map((day, index) => {
            if (!day) return <div key={`empty-${index}`} aria-hidden className="bg-slate-50" />;
            const key = `${monthKey}-${String(day).padStart(2, "0")}`;
            const entries = byDay.get(key) ?? [];
            const due = entries.filter((mark) => mark.kind === "vencimento").length;
            const pending = entries.length - due;
            const important = entries.some((mark) => mark.priority === "Alta");
            return (
              <button key={key} type="button" aria-pressed={key === selected} aria-current={key === today ? "date" : undefined}
                aria-label={`Dia ${day}, ${pending} a concluir, ${due} vencimentos${important ? ", prioridade alta" : ""}`}
                onClick={() => setSelection(key)}
                className={cn("relative flex min-h-14 flex-col items-center gap-1 p-1 text-xs hover:bg-sky-50 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-sky-700 sm:min-h-20 sm:items-start sm:p-2",
                  key === selected ? "bg-sky-100 ring-2 ring-sky-700 ring-inset" : "bg-white")}>
                <span className={cn("font-semibold", key === today && "underline")}>{day}{important && <span className="ml-1 text-orange-800" aria-hidden>!</span>}</span>
                <span className="flex flex-wrap justify-center gap-0.5" aria-hidden>
                  {pending > 0 && <span className="rounded bg-sky-100 px-1 text-sky-900">{pending}</span>}
                  {due > 0 && <span className="rounded bg-orange-100 px-1 text-orange-900">{due}</span>}
                </span>
              </button>
            );
          })}
        </div>
        <section aria-labelledby="calendar-day-title" className="rounded-xl border bg-slate-50 p-3">
          <h3 id="calendar-day-title" aria-live="polite" className="mb-3 font-semibold">
            {selected ? `Atividades de ${selected.split("-").reverse().join("/")}` : "Atividades do dia"}
          </h3>
          {items.length ? renderMarks(items) : (
            <p className="text-sm text-slate-600">{selected ? "Nenhuma atividade neste dia." : "Selecione um dia para ver as atividades."}</p>
          )}
        </section>
        <section className="space-y-3 lg:col-span-2" aria-labelledby="calendar-period-title">
          <h3 id="calendar-period-title" className="font-semibold">Demandas do período</h3>
          {byPeriod.size === 0 && <p className="text-sm text-slate-600">Nenhuma demanda sem data exata neste mês.</p>}
          {[...byPeriod].map(([period, entries]) => (
            <details key={period} className="rounded-xl border bg-slate-50 p-3">
              <summary className="cursor-pointer text-sm font-medium">{period} · {new Set(entries.map((mark) => mark.requestId)).size}</summary>
              <div className="mt-3">{renderMarks(entries)}</div>
            </details>
          ))}
        </section>
      </div>
    </dialog>
  );
}
