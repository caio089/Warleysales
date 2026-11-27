"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { SelectField, TextAreaField, TextField } from "@/shared/ui/forms/fields";
import { addDays, formatDateOnly, isValidDateOnly } from "@/shared/lib/time";
import { categories, localInput, period, selectEvents, shiftPeriod, type AgendaEvent, type EventType, type View } from "@/modules/calendar/agenda";
import { saveAppointment } from "@/modules/calendar/appointment-actions";
import { cn } from "@/lib/utils";

const views: Record<View, string> = { mes: "Mês", semana: "Semana", dia: "Dia", agenda: "Agenda" };
const tones: Record<EventType, string> = {
  reuniao: "border-blue-400 bg-blue-500/10", contrato: "border-amber-500 bg-amber-500/10",
  ata: "border-violet-500 bg-violet-500/10", processo: "border-sky-500 bg-sky-500/10",
  tarefa: "border-emerald-600 bg-emerald-500/10", compromisso: "border-rose-400 bg-rose-500/10",
};
const dateLabel = (day: string) => new Intl.DateTimeFormat("pt-BR", {
  timeZone: "UTC", weekday: "short", day: "numeric", month: "short",
}).format(new Date(day));
const monthLabel = (day: string) => new Intl.DateTimeFormat("pt-BR", {
  timeZone: "UTC", month: "long", year: "numeric",
}).format(new Date(day));
const hours = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, "0")}:00`);
type FormState = { day: string; time: string; event?: AgendaEvent };
type Option = { value: string; label: string };
type Person = Option & { councilId: string };
type MonthPlan = {
  id: string; month: string; councilId: string; title: string; href: string; personId?: string;
};

export function AgendaBoard({ today, initialDate, initialCouncil, events, councils, writable, people, monthPlans, initialView = "mes" }: {
  today: string; initialDate: string; initialCouncil: string; events: AgendaEvent[];
  councils: Option[]; writable: Option[]; people: Person[];
  monthPlans: MonthPlan[];
  initialView?: View;
}) {
  const [view, setView] = useState<View>(initialView);
  const [date, setDate] = useState(initialDate);
  const [council, setCouncil] = useState(initialCouncil);
  const [type, setType] = useState("");
  const [person, setPerson] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState<FormState | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const editedStart = useRef("");
  const writableCouncils = writable.filter((option) => !council || option.value === council);
  const scopedPeople = [...new Map(people.filter((p) => !council || p.councilId === council).map((p) => [p.value, p])).values()];
  const { first, count } = period(date, view);
  const days = Array.from({ length: count }, (_, i) => addDays(first, i));
  const filtered = useMemo(() => selectEvents(events, type, person, council), [events, type, person, council]);
  const byDay = useMemo(() => {
    const grouped = new Map<string, AgendaEvent[]>();
    for (const event of filtered) {
      const endDay = event.endsAt ? localInput(new Date(new Date(event.endsAt).getTime() - 1).toISOString()).slice(0, 10) : event.day;
      for (let day = event.day < first ? first : event.day; day <= endDay && day <= addDays(first, count - 1); day = addDays(day, 1)) {
        if (!grouped.has(day)) grouped.set(day, []);
        grouped.get(day)!.push(event);
      }
    }
    return grouped;
  }, [filtered, first, count]);
  const selected = events.find((event) => event.id === selectedId);
  const open = Boolean(form || selected);
  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
    if (!open && dialog.current?.open) dialog.current.close();
  }, [open]);
  const close = () => { setForm(null); setSelectedId(""); };
  const create = (day: string, time = "09:00") => {
    editedStart.current = "";
    setSelectedId("");
    setForm({ day, time });
  };
  const show = (event: AgendaEvent) => { setForm(null); setSelectedId(event.id); };

  const eventButton = (event: AgendaEvent, compact = false) => (
    <button key={event.id} type="button" onClick={() => show(event)}
      className={cn("block w-full min-w-0 rounded-md border-l-4 px-2 py-1.5 text-left focus-visible:outline-2 focus-visible:outline-ring", tones[event.type])}>
      <span className="block text-xs font-semibold">{event.time ? `${event.time} · ` : ""}{categories[event.type]}</span>
      <span className={cn("block break-words text-sm", compact && "line-clamp-2")}>{event.title}</span>
    </button>
  );

  const agendaDays = days.filter((day) => byDay.has(day));
  const undatedPlans = type && type !== "processo" ? [] : monthPlans.filter((plan) =>
    plan.month === date.slice(0, 7) && (!council || plan.councilId === council) && (!person || plan.personId === person));
  const formStart = form?.event?.startsAt ? localInput(form.event.startsAt) : form ? `${form.day}T${form.time}` : "";
  const formEnd = form?.event?.endsAt ? localInput(form.event.endsAt) : form ? localInput(new Date(new Date(`${formStart}:00-03:00`).getTime() + 30 * 60_000).toISOString()) : "";
  return (
    <section aria-label="Agenda do calendário" className="mb-8 min-w-0 space-y-4 print:hidden">
      <div className="surface-card space-y-3 p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="icon" aria-label="Período anterior" onClick={() => setDate(shiftPeriod(date, view, -1))}><ChevronLeft /></Button>
            <Button variant="outline" onClick={() => setDate(today)}>Hoje</Button>
            <Button variant="outline" size="icon" aria-label="Próximo período" onClick={() => setDate(shiftPeriod(date, view, 1))}><ChevronRight /></Button>
          </div>
          {writableCouncils.length > 0 && <Button onClick={() => create(date)}><Plus /> Novo compromisso</Button>}
        </div>
        <h2 className="text-xl font-semibold capitalize" aria-live="polite">
          {view === "mes" ? monthLabel(date) : view === "dia" ? dateLabel(date) : `${formatDateOnly(first)} – ${formatDateOnly(days.at(-1)!)}`}
        </h2>
        <div className="flex flex-wrap gap-1" role="group" aria-label="Visualização">
          {Object.entries(views).map(([key, label]) => (
            <Button key={key} aria-pressed={key === view} variant={key === view ? "default" : "outline"} onClick={() => setView(key as View)}>{label}</Button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="grid gap-1 text-sm">Ir para data
            <Input type="date" value={date} onChange={(e) => { if (isValidDateOnly(e.target.value)) setDate(e.target.value); }} />
          </label>
          <label className="grid gap-1 text-sm">Órgão
            <select className="min-w-0 rounded-lg border bg-card p-2" value={council} onChange={(e) => { setCouncil(e.target.value); setPerson(""); }}>
              <option value="">Órgãos acessíveis</option>{councils.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-sm">Tipo de evento
            <select className="min-w-0 rounded-lg border bg-card p-2" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">Todos</option>{Object.entries(categories).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-sm">Colaborador
            <select className="min-w-0 rounded-lg border bg-card p-2" value={person} onChange={(e) => setPerson(e.target.value)}>
              <option value="">Todos</option>{scopedPeople.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </label>
        </div>
      </div>

      {view === "mes" && <>
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((weekday) => <span className="text-center text-xs font-semibold text-muted-foreground" key={weekday}>{weekday}</span>)}
          {days.map((day) => {
            const entries = byDay.get(day) ?? [];
            return <div key={day} className={cn("min-w-0 rounded-lg border p-1 sm:p-2", day === date ? "border-primary bg-primary/5" : "bg-card", !day.startsWith(date.slice(0, 7)) && "text-muted-foreground")}>
              <button type="button" aria-label={`${dateLabel(day)}: ${entries.length} eventos`} aria-pressed={day === date} aria-current={day === today ? "date" : undefined}
                className="w-full rounded p-1 text-center font-semibold focus-visible:outline-2 focus-visible:outline-ring" onClick={() => setDate(day)}>
                {Number(day.slice(-2))}<span className="block text-xs font-normal lg:hidden">{entries.length || "\u00a0"}</span>
              </button>
              <div className="hidden space-y-1 lg:block">{entries.slice(0, 3).map((event) => eventButton(event, true))}
                {entries.length > 3 && <button className="rounded p-1 text-xs underline" onClick={() => setDate(day)}>+{entries.length - 3} eventos</button>}
              </div>
            </div>;
          })}
        </div>
        <section className="surface-card space-y-2 p-3 sm:p-4" aria-label="Eventos do dia selecionado">
          <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">{dateLabel(date)}</h3>
            {writableCouncils.length > 0 && <Button variant="outline" size="sm" onClick={() => create(date)}>Adicionar neste dia</Button>}
          </div>
          {(byDay.get(date) ?? []).map((event) => eventButton(event))}
          {!byDay.has(date) && <p className="text-sm text-muted-foreground">Nenhum evento neste dia.</p>}
        </section>
        {undatedPlans.length > 0 && <section className="surface-card space-y-2 p-4" aria-label="Prazos sem dia definido">
          <h3 className="font-semibold">Prazos sem dia definido</h3>
          <ul className="space-y-2 text-sm">
            {undatedPlans.map((plan) => <li key={plan.id}><Link className="rounded underline focus-visible:outline-2 focus-visible:outline-ring" href={plan.href}>{plan.title}</Link></li>)}
          </ul>
        </section>}
      </>}

      {(view === "semana" || view === "dia") && <div className={cn("grid min-w-0 gap-2", view === "semana" && "md:grid-cols-2 xl:grid-cols-7")}>
        {days.map((day) => {
          const entries = byDay.get(day) ?? [];
          const showSlotsOnMobile = view !== "semana" || day === date;
          return <section key={day} className="surface-card min-w-0 space-y-2 p-2" aria-label={dateLabel(day)}>
            <h3 className="font-semibold capitalize">{dateLabel(day)}</h3>
            {entries.filter((event) => !event.time).map((event) => eventButton(event, true))}
            {view === "semana" && !showSlotsOnMobile && <div className="space-y-2 md:hidden">
              {entries.filter((event) => event.time).map((event) => eventButton(event, true))}
              <Button size="sm" variant="outline" onClick={() => setDate(day)}>Ver horários</Button>
            </div>}
            <div className={cn("space-y-1", !showSlotsOnMobile && "hidden md:block")}>
              {hours.map((hour) => {
                const hourEvents = entries.filter((e) => e.time && (e.day < day ? hour === "00:00" : e.time.slice(0, 2) === hour.slice(0, 2)));
                const occupied = entries.some((e) => {
                  if (!e.time) return false;
                  const start = e.day < day ? "00:00" : e.time;
                  const end = e.endsAt ? localInput(e.endsAt) : null;
                  const endTime = end && end.slice(0, 10) === day ? end.slice(-5) : "24:00";
                  return start.slice(0, 2) === hour.slice(0, 2) || Boolean(end && start <= hour && hour < endTime);
                });
                return <div key={hour} className="space-y-1 border-t pt-1">
                  {writableCouncils.length > 0 ? <button type="button" aria-label={`Adicionar em ${dateLabel(day)} às ${hour}`} onClick={() => create(day, hour)}
                    className="flex w-full justify-between gap-1 rounded px-1 py-1 text-xs focus-visible:outline-2 focus-visible:outline-ring"><span>{hour}</span><span className="text-muted-foreground">{occupied ? "Ocupado" : "Livre"}</span></button>
                    : <p className="flex justify-between gap-1 px-1 text-xs"><span>{hour}</span><span>{occupied ? "Ocupado" : "Livre"}</span></p>}
                  {hourEvents.map((event) => eventButton(event, true))}
                </div>;
              })}
            </div>
          </section>;
        })}
      </div>}

      {view === "agenda" && <div className="space-y-3">
        {agendaDays.length === 0 && <p className="surface-card p-4 text-muted-foreground">Nenhum evento no período.</p>}
        {agendaDays.map((day) => <section key={day} className="surface-card space-y-2 p-4">
          <h3 className="font-semibold capitalize">{dateLabel(day)}</h3>
          {byDay.get(day)!.map((event) => eventButton(event))}
        </section>)}
      </div>}

      <dialog ref={dialog} onClose={close} aria-labelledby="agenda-dialog-heading"
        className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-2xl border bg-popover p-4 text-popover-foreground shadow-xl backdrop:bg-black/40 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 id="agenda-dialog-heading" className="text-lg font-semibold">{form ? form.event ? "Editar compromisso" : "Novo compromisso" : selected?.title}</h2>
          <Button variant="outline" size="sm" onClick={close}>Fechar</Button>
        </div>
        {form ? <ActionForm key={form.event?.id ?? formStart} action={saveAppointment} submitLabel="Salvar compromisso" onSuccess={() => { setDate((editedStart.current || formStart).slice(0, 10)); close(); }}
          hiddenFields={form.event ? { id: form.event.id, councilId: form.event.councilId } : undefined}>
          {(errors) => <>
            {form.event ? <p className="text-sm">{councils.find((c) => c.value === form.event!.councilId)?.label}</p>
              : <SelectField name="councilId" label="Órgão" required options={writableCouncils} defaultValue={council || (writableCouncils.length === 1 ? writableCouncils[0].value : "")} errors={errors.councilId} />}
            <TextField name="title" label="Título" required defaultValue={form.event?.title} errors={errors.title} />
            <TextAreaField name="description" label="Descrição" defaultValue={form.event?.description} errors={errors.description} />
            <div className="grid min-w-0 gap-3 sm:grid-cols-2">
              <TextField name="start" label="Início (Fortaleza)" type="datetime-local" required defaultValue={formStart} onChange={(e) => { editedStart.current = e.target.value; }} errors={errors.start} />
              <TextField name="end" label="Término (Fortaleza)" type="datetime-local" required defaultValue={formEnd} errors={errors.end} />
            </div>
          </>}
        </ActionForm> : selected && <div className="space-y-3 text-sm">
          <p>{categories[selected.type]} · {formatDateOnly(selected.day)}{selected.time ? ` às ${selected.time}` : " · Sem horário registrado"}{selected.until ? ` até ${selected.until}` : ""}</p>
          <p>{councils.find((c) => c.value === selected.councilId)?.label}</p>
          {selected.personId && people.some((p) => p.value === selected.personId) && <p>Colaborador: {people.find((p) => p.value === selected.personId)?.label}</p>}
          {selected.description && <p className="whitespace-pre-wrap break-words">{selected.description}</p>}
          {selected.href && <Link className={buttonVariants({ variant: "outline" })} href={selected.href} onClick={(event) => {
            if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) dialog.current?.close();
          }}>Abrir registro original</Link>}
          {selected.editable && <Button onClick={() => { editedStart.current = ""; setForm({ day: selected.day, time: selected.time ?? "09:00", event: selected }); }}>Editar ou reagendar</Button>}
        </div>}
      </dialog>
    </section>
  );
}
