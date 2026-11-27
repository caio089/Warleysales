import { describe, expect, it } from "vitest";
import { parseLocalInstant, period, selectEvents, shiftPeriod } from "./agenda";

describe("agenda do calendário", () => {
  it("inclui todos os dias de um mês bissexto e completa as semanas", () => {
    expect(period("2028-02-29", "mes")).toEqual({ first: "2028-01-30", count: 35 });
    expect(shiftPeriod("2028-01-31", "mes", 1)).toBe("2028-02-29");
  });

  it("navega por semana, dia e lista de 30 dias", () => {
    expect(period("2026-11-26", "semana")).toEqual({ first: "2026-11-22", count: 7 });
    expect(shiftPeriod("2026-11-26", "semana", -1)).toBe("2026-11-19");
    expect(shiftPeriod("2026-11-26", "dia", 1)).toBe("2026-11-27");
    expect(shiftPeriod("2026-11-26", "agenda", 1)).toBe("2026-12-26");
  });

  it("converte o horário civil de Fortaleza e rejeita datas ou horas impossíveis", () => {
    expect(parseLocalInstant("2026-11-26", "23:30")).toBe("2026-11-27T02:30:00.000Z");
    expect(parseLocalInstant("2026-02-30", "09:30")).toBeNull();
    expect(parseLocalInstant("2026-11-26", "24:00")).toBeNull();
  });

  it("combina filtros e mantém ordenação por data e hora", () => {
    const common = { day: "2026-11-26", councilId: "a", personId: "p", type: "tarefa" as const };
    const events = [
      { ...common, id: "late", time: "14:00", title: "Prazo A" },
      { ...common, id: "other-org", councilId: "b", title: "Prazo B" },
      { ...common, id: "early", time: "09:00", title: "Prazo C" },
      { ...common, id: "other-person", personId: "q", title: "Prazo D" },
      { ...common, id: "other-type", type: "ata" as const, title: "Prazo E" },
    ];
    expect(selectEvents(events, "tarefa", "p", "a").map((e) => e.id)).toEqual(["early", "late"]);
  });

  it("encontra reuniões pelos colaboradores relacionados e pelo responsável", () => {
    const meeting = { id: "meeting", type: "reuniao" as const, councilId: "a", day: "2026-11-26",
      title: "Reunião", personId: "responsavel", personIds: ["participante", "autor"] };
    for (const id of ["responsavel", "participante", "autor"]) {
      expect(selectEvents([meeting], "reuniao", id, "a")).toEqual([meeting]);
    }
    expect(selectEvents([meeting], "reuniao", "participante", "b")).toEqual([]);
  });
});
