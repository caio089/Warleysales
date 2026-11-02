/**
 * Utilitários de data/hora.
 * Regra R15: instantes são guardados em UTC; a exibição e o "dia corrente"
 * de regras de negócio usam o fuso America/Fortaleza (UTC-3, sem horário de verão).
 * Datas de vigência são strings "AAAA-MM-DD" (tipo `date` no banco), sem fuso.
 */
export const APP_TIME_ZONE = "America/Fortaleza";

const MS_PER_DAY = 86_400_000;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Data civil no formato AAAA-MM-DD. */
export type DateOnly = string;

/** Converte um instante para a data civil em Fortaleza (ex.: 02:00Z do dia 3 => dia 2). */
export function toFortalezaDate(instant: Date): DateOnly {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
  return parts; // en-CA já produz AAAA-MM-DD
}

/** Valida e converte AAAA-MM-DD em milissegundos UTC (meia-noite). Retorna null se inválida. */
function parseDateOnly(value: DateOnly): number | null {
  const match = DATE_PATTERN.exec(value);
  if (!match) return null;
  const [, y, m, d] = match.map(Number) as [number, number, number, number];
  const time = Date.UTC(y, m - 1, d);
  const check = new Date(time);
  const valid = check.getUTCFullYear() === y && check.getUTCMonth() === m - 1 && check.getUTCDate() === d;
  return valid ? time : null;
}

export function isValidDateOnly(value: string): boolean {
  return parseDateOnly(value) !== null;
}

function requireTime(value: DateOnly): number {
  const time = parseDateOnly(value);
  if (time === null) throw new RangeError(`Data inválida: ${value}`);
  return time;
}

function formatTime(time: number): DateOnly {
  return new Date(time).toISOString().slice(0, 10);
}

/** Diferença em dias corridos (to - from). Positivo quando `to` é posterior. */
export function diffInDays(from: DateOnly, to: DateOnly): number {
  return Math.round((requireTime(to) - requireTime(from)) / MS_PER_DAY);
}

export function addDays(date: DateOnly, days: number): DateOnly {
  return formatTime(requireTime(date) + days * MS_PER_DAY);
}

/** Soma meses preservando o último dia do mês quando o dia não existe (31/01 + 1m = 28/02). */
export function addMonths(date: DateOnly, months: number): DateOnly {
  const base = new Date(requireTime(date));
  const day = base.getUTCDate();
  const target = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + months, 1));
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(day, lastDay));
  return formatTime(target.getTime());
}

export const addYears = (date: DateOnly, years: number): DateOnly => addMonths(date, years * 12);

/** Soma dias corridos a um instante (usado na janela de 30 dias da limpeza documental). */
export function addDaysToInstant(instant: Date, days: number): Date {
  return new Date(instant.getTime() + days * MS_PER_DAY);
}

/** Formata para exibição em pt-BR no fuso de Fortaleza. */
export function formatDateTimeFortaleza(instant: Date | string): string {
  const date = typeof instant === "string" ? new Date(instant) : instant;
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: APP_TIME_ZONE,
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

/** Formata uma data civil AAAA-MM-DD como DD/MM/AAAA, sem conversão de fuso. */
export function formatDateOnly(date: DateOnly): string {
  const [y, m, d] = date.split("-");
  return `${d}/${m}/${y}`;
}
