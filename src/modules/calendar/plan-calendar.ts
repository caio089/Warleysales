import { planDossier } from "@/app/(app)/solicitacoes/request-facets";

/** Ano das conclusões previstas no PCA quando o plano só informa o mês. */
export const PLAN_YEAR = 2027;

const MONTH_TOKEN: Record<string, number> = {
  jan: 0, fev: 1, mar: 2, abr: 3, mai: 4, jun: 5,
  jul: 6, ago: 7, set: 8, out: 9, nov: 10, dez: 11,
};

export type CalendarKind = "concluir" | "vencimento";

export interface CalendarSource {
  id: string;
  councilId: string;
  title: string;
  estimatedValue?: number | null;
  notes: readonly (string | null | undefined)[];
}

export interface CalendarMark {
  id: string;
  requestId: string;
  councilId: string;
  title: string;
  kind: CalendarKind;
  /** Dia fechado, AAAA-MM-DD. Ausente quando o plano só fecha o mês. */
  day: string | null;
  year: number;
  month: number;
  detail: string;
  priority: string;
  origin: string;
}

function stripAccents(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

/** Tira acento e o ordinal (2º, 1ª) para comparar mês, semestre e trimestre. */
function normalizePlanLabel(value: string): string {
  return stripAccents(value).replace(/[ºª°]/g, "").replace(/\./g, "").trim();
}

/** Meses (0–11) em que o plano manda concluir a contratação. */
export function plannedMonthIndexes(label: string): number[] {
  const text = normalizePlanLabel(label);
  if (!text || text === "nao informado" || text === "a definir" || text === "—" || /ao longo/.test(text)) return [];
  if (/1\s*sem/.test(text)) return [0, 1, 2, 3, 4, 5];
  if (/2\s*sem/.test(text)) return [6, 7, 8, 9, 10, 11];
  if (/1\s*trim/.test(text)) return [0, 1, 2];
  if (/2\s*trim/.test(text)) return [3, 4, 5];
  if (/3\s*trim/.test(text)) return [6, 7, 8];
  if (/4\s*trim/.test(text)) return [9, 10, 11];

  const tokens = [...text.matchAll(/\b(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\b/g)].map((match) => MONTH_TOKEN[match[1]!]);
  if (tokens.length === 0) return [];
  const joinedByRange = /\b(?:a|-)\b/.test(text) && tokens.length === 2;
  if (!joinedByRange) return [...new Set(tokens)];

  const [start, end] = tokens as [number, number];
  const span: number[] = [];
  let cursor = start;
  for (let step = 0; step < 12; step += 1) {
    span.push(cursor);
    if (cursor === end) break;
    cursor = (cursor + 1) % 12;
  }
  return span;
}

const MONTH_FROM_LABEL: Record<string, number> = {
  janeiro: 0, fevereiro: 1, março: 2, marco: 2, abril: 3, maio: 4, junho: 5,
  julho: 6, agosto: 7, setembro: 8, outubro: 9, novembro: 10, dezembro: 11,
};

function monthFromLabel(label: string | null): { year: number; month: number } | null {
  if (!label) return null;
  const match = stripAccents(label).match(/\b(janeiro|fevereiro|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s+de\s+(\d{4})\b/);
  if (!match) return null;
  return { year: Number(match[2]), month: MONTH_FROM_LABEL[match[1]!] ?? 0 };
}

/** Uma marca por data que o plano realmente informa. Sem mês, a contratação fica fora do calendário. */
export function calendarMarks(sources: readonly CalendarSource[], planYear = PLAN_YEAR): CalendarMark[] {
  const marks: CalendarMark[] = [];
  for (const source of sources) {
    const dossier = planDossier(source.notes, source.estimatedValue, source.title);
    if (!dossier.itemNumber) continue;

    for (const month of plannedMonthIndexes(dossier.plannedMonth)) {
      marks.push({
        id: `${source.id}:concluir:${planYear}-${month}`,
        requestId: source.id,
        councilId: source.councilId,
        title: source.title,
        kind: "concluir",
        day: null,
        year: planYear,
        month,
        detail: dossier.plannedMonth,
        priority: dossier.priority,
        origin: dossier.origin,
      });
    }

    if (dossier.expiry?.day) {
      const [year, month] = dossier.expiry.day.split("-").map(Number);
      if (year && month) {
        marks.push({
          id: `${source.id}:vencimento:${dossier.expiry.day}`,
          requestId: source.id,
          councilId: source.councilId,
          title: source.title,
          kind: "vencimento",
          day: dossier.expiry.day,
          year,
          month: month - 1,
          detail: dossier.expiry.raw,
          priority: dossier.priority,
          origin: dossier.origin,
        });
      }
    } else {
      const monthOnly = monthFromLabel(dossier.expiry?.monthLabel ?? null);
      if (monthOnly) {
        marks.push({
          id: `${source.id}:vencimento:${monthOnly.year}-${monthOnly.month}`,
          requestId: source.id,
          councilId: source.councilId,
          title: source.title,
          kind: "vencimento",
          day: null,
          year: monthOnly.year,
          month: monthOnly.month,
          detail: dossier.expiry?.raw ?? "",
          priority: dossier.priority,
          origin: dossier.origin,
        });
      }
    }
  }
  return marks;
}

export function marksInMonth(marks: readonly CalendarMark[], year: number, month: number): CalendarMark[] {
  return marks.filter((mark) => mark.year === year && mark.month === month);
}

/** Grade do mês começando na segunda-feira. Null é dia de outro mês. */
export function monthWeeks(year: number, month: number): (number | null)[][] {
  const startWeekday = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: (number | null)[] = Array.from({ length: startWeekday }, () => null);
  for (let day = 1; day <= days; day += 1) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let index = 0; index < cells.length; index += 7) weeks.push(cells.slice(index, index + 7));
  return weeks;
}

/**
 * Órgão do calendário.
 * Um único órgão permitido trava a tela nele, mesmo se a URL pedir outro.
 * Vários órgãos só aceitam um id da lista; o resto mostra todos os que o usuário pode ver.
 */
export function resolveCalendarCouncil(allowedIds: readonly string[], requested: string | undefined): string | null {
  if (allowedIds.length === 1) return allowedIds[0] ?? null;
  if (requested && allowedIds.includes(requested)) return requested;
  return null;
}

export function parseCalendarMonth(raw: string | undefined, fallback: { year: number; month: number }): { year: number; month: number } {
  const match = raw?.match(/^(\d{4})-(\d{2})$/);
  if (!match) return fallback;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  if (month < 0 || month > 11) return fallback;
  return { year, month };
}

export const MONTH_TITLE = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
] as const;
