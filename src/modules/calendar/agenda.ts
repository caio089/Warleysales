import { addDays, addMonths, APP_TIME_ZONE, isValidDateOnly, toFortalezaDate } from "@/shared/lib/time";

export const categories = {
  reuniao: "Reunião", contrato: "Contrato", ata: "Ata", processo: "Processo",
  tarefa: "Tarefa", compromisso: "Compromisso",
} as const;
export type EventType = keyof typeof categories;
export type View = "mes" | "semana" | "dia" | "agenda";
export interface AgendaEvent {
  id: string;
  type: EventType;
  councilId: string;
  day: string;
  title: string;
  time?: string;
  until?: string;
  personId?: string;
  personIds?: string[];
  description?: string;
  href?: string;
  editable?: boolean;
  startsAt?: string;
  endsAt?: string;
}

export const localTime = (date: Date) => new Intl.DateTimeFormat("pt-BR", {
  timeZone: APP_TIME_ZONE, hour: "2-digit", minute: "2-digit", hourCycle: "h23",
}).format(date);

export function parseLocalInstant(date: string, time: string) {
  if (!isValidDateOnly(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return null;
  return new Date(`${date}T${time}:00-03:00`).toISOString();
}

export function localInput(instant: string) {
  const time = new Date(instant);
  return `${toFortalezaDate(time)}T${localTime(time)}`;
}

export function period(date: string, view: View) {
  if (view === "mes") {
    const first = `${date.slice(0, 7)}-01`;
    const offset = new Date(first).getUTCDay();
    const length = Number(addDays(addMonths(first, 1), -1).slice(-2));
    return { first: addDays(first, -offset), count: Math.ceil((offset + length) / 7) * 7 };
  }
  if (view === "semana") return { first: addDays(date, -new Date(date).getUTCDay()), count: 7 };
  return { first: date, count: view === "agenda" ? 30 : 1 };
}

export function shiftPeriod(date: string, view: View, direction: -1 | 1) {
  return view === "mes" ? addMonths(date, direction) : addDays(date, direction * (view === "semana" ? 7 : view === "agenda" ? 30 : 1));
}

export function selectEvents(events: AgendaEvent[], type: string, personId: string, councilId: string) {
  return events.filter((e) => (!type || e.type === type) && (!personId || e.personId === personId || e.personIds?.includes(personId)) && (!councilId || e.councilId === councilId))
    .sort((a, b) => a.day.localeCompare(b.day) || (a.time ?? "").localeCompare(b.time ?? "") || a.title.localeCompare(b.title, "pt-BR"));
}
