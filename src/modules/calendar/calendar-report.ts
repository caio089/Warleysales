import type { CalendarMark } from "./plan-calendar";
import { MONTH_TITLE } from "./plan-calendar";

export interface CalendarCouncilSummary {
  councilId: string;
  conclude: number;
  expiry: number;
  total: number;
}

export interface CalendarMonthSummary {
  month: number;
  label: string;
  conclude: number;
  expiry: number;
  total: number;
}

export interface CalendarReport {
  year: number;
  conclude: number;
  expiry: number;
  total: number;
  byCouncil: CalendarCouncilSummary[];
  byMonth: CalendarMonthSummary[];
}

/** Consolida o plano em números para o relatório do calendário. */
export function buildCalendarReport(marks: readonly CalendarMark[], year: number): CalendarReport {
  const inYear = marks.filter((mark) => mark.year === year);
  const byCouncil = new Map<string, CalendarCouncilSummary>();
  const byMonth = MONTH_TITLE.map((label, month) => ({
    month,
    label,
    conclude: 0,
    expiry: 0,
    total: 0,
  }));

  let conclude = 0;
  let expiry = 0;

  for (const mark of inYear) {
    if (mark.kind === "concluir") conclude += 1;
    else expiry += 1;

    const monthRow = byMonth[mark.month];
    if (monthRow) {
      if (mark.kind === "concluir") monthRow.conclude += 1;
      else monthRow.expiry += 1;
      monthRow.total += 1;
    }

    const current = byCouncil.get(mark.councilId) ?? {
      councilId: mark.councilId,
      conclude: 0,
      expiry: 0,
      total: 0,
    };
    if (mark.kind === "concluir") current.conclude += 1;
    else current.expiry += 1;
    current.total += 1;
    byCouncil.set(mark.councilId, current);
  }

  return {
    year,
    conclude,
    expiry,
    total: inYear.length,
    byCouncil: [...byCouncil.values()].sort((left, right) => right.total - left.total),
    byMonth,
  };
}
