import { describe, expect, it } from "vitest";
import { calendarMarks, countsByMonth, monthWeeks, plannedMonthIndexes, resolveCalendarCouncil } from "./plan-calendar";

const note = [
  "PCA 2027, item 3.",
  "Grupo: A. Administração.",
  "Prioridade Alta.",
  "Mês previsto: Out.",
  "Vencimento atual: 24/10/2026 [VERIFICAR].",
  "Forma prevista: Nova licitação.",
  "Valor no plano: R$ 10,00.",
  "Valor estimado gravado: R$ 10,00.",
].join(" ");

describe("calendário do plano", () => {
  it("entende mês, faixa e trimestre", () => {
    expect(plannedMonthIndexes("Out")).toEqual([9]);
    expect(plannedMonthIndexes("Mai/Jun")).toEqual([4, 5]);
    expect(plannedMonthIndexes("2º trim")).toEqual([3, 4, 5]);
    expect(plannedMonthIndexes("1º sem")).toEqual([0, 1, 2, 3, 4, 5]);
    expect(plannedMonthIndexes("A definir")).toEqual([]);
  });

  it("marca a conclusão em 2027 e o vencimento no dia informado", () => {
    const marks = calendarMarks([{ id: "req-1", councilId: "org-1", title: "Locação", notes: [note] }]);
    expect(marks).toEqual([
      expect.objectContaining({ kind: "concluir", year: 2027, month: 9, day: null }),
      expect.objectContaining({ kind: "vencimento", day: "2026-10-24", year: 2026, month: 9 }),
    ]);
  });

  it("trava o calendário no único órgão do usuário", () => {
    expect(resolveCalendarCouncil(["sfapi"], "outro-orgao")).toBe("sfapi");
    expect(resolveCalendarCouncil(["sfapi", "crcpi"], "crcpi")).toBe("crcpi");
    expect(resolveCalendarCouncil(["sfapi", "crcpi"], "alheio")).toBeNull();
  });

  it("conta as contratações de cada mês do ano", () => {
    const marks = calendarMarks([{ id: "req-1", councilId: "org-1", title: "Locação", notes: [note] }]);
    const counts = countsByMonth(marks, 2027);
    expect(counts[9]).toBe(1);
    expect(counts.reduce((total, count) => total + count, 0)).toBe(1);
  });

  it("começa a semana na segunda-feira", () => {
    const weeks = monthWeeks(2026, 10);
    expect(weeks[0]?.[0]).toBeNull();
    expect(weeks[0]?.[6]).toBe(1);
  });

  it("abre a grade mensal no domingo e preserva datas e períodos sem duplicar a demanda", () => {
    expect(monthWeeks(2026, 10, 0)[0]?.[0]).toBe(1);
    const notes = [note.replace("Out.", "02/01/2027.").replace("24/10/2026 [VERIFICAR]", "DEZ/JAN")];
    const marks = calendarMarks([{ id: "req-1", councilId: "org-1", title: "Locação", notes }]);
    expect(marks[0]?.day).toBe("2027-01-02");
    expect(marks.filter((mark) => mark.kind === "vencimento")).toEqual([
      expect.objectContaining({ month: 11, day: null, detail: "DEZ/JAN" }),
      expect.objectContaining({ month: 0, day: null, detail: "DEZ/JAN" }),
    ]);
    expect(countsByMonth(marks, 2027)[0]).toBe(1);
  });
});
