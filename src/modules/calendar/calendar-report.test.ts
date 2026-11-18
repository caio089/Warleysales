import { describe, expect, it } from "vitest";
import { buildCalendarReport } from "./calendar-report";
import type { CalendarMark } from "./plan-calendar";

const mark = (partial: Partial<CalendarMark> & Pick<CalendarMark, "id" | "councilId" | "kind" | "month">): CalendarMark => ({
  requestId: partial.requestId ?? "req",
  title: partial.title ?? "Item",
  day: partial.day ?? null,
  year: partial.year ?? 2027,
  detail: partial.detail ?? "Mai",
  priority: partial.priority ?? "Alta",
  origin: partial.origin ?? "Demanda do PCA 2027",
  ...partial,
});

describe("relatório do calendário", () => {
  it("soma concluir e vencimento por órgão e por mês", () => {
    const report = buildCalendarReport([
      mark({ id: "1", councilId: "a", kind: "concluir", month: 4 }),
      mark({ id: "2", councilId: "a", kind: "vencimento", month: 4 }),
      mark({ id: "3", councilId: "b", kind: "concluir", month: 5 }),
    ], 2027);

    expect(report.total).toBe(3);
    expect(report.conclude).toBe(2);
    expect(report.expiry).toBe(1);
    expect(report.byMonth[4]).toEqual(expect.objectContaining({ total: 2, conclude: 1, expiry: 1 }));
    expect(report.byCouncil[0]).toEqual(expect.objectContaining({ councilId: "a", total: 2 }));
  });
});
