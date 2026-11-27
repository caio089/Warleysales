import { describe, expect, it } from "vitest";
import { presentDetailedReport } from "./presentation";

describe("presentDetailedReport", () => {
  it("substitui IDs e códigos técnicos por nomes legíveis", () => {
    const data = presentDetailedReport({
      title: "Relatório de processos", summary: "1 registro", limitations: [],
      filters: ["Órgão: org-1", "De: 2026-11-01"],
      indicators: [{ label: "em_andamento", value: "1" }],
      columns: ["Número", "Órgão", "Situação", "Modalidade", "Criação", "Criado por"],
      rows: [["003/2026", "org-1", "em_andamento", "registro_precos", "2026-11-27", "user-1"]],
    }, { councils: [{ id: "org-1", label: "CRCPI" }], suppliers: [], materials: [], atas: [], people: [{ id: "user-1", label: "Ana Silva" }] });
    expect(data.rows[0]).toEqual(["003/2026", "CRCPI", "Em andamento", "Registro de preços", "27/11/2026", "Ana Silva"]);
    expect(data.indicators[0]?.label).toBe("Em andamento");
    expect(data.filters).toEqual(["Órgão: CRCPI", "De: 01/11/2026"]);
  });
});
