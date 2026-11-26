import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { detailedReportPdf } from "./detailed-pdf";
import type { DetailedReport } from "./detailed";

describe("relatório detalhado em PDF", () => {
  it("gera PDF paginado a partir dos mesmos dados da prévia", async () => {
    const preview: DetailedReport = {
      title: "Relatório de processos",
      filters: ["De: 2026-11-01", "Até: 2026-11-30"],
      summary: "80 registros encontrados para os filtros selecionados.",
      indicators: [{ label: "Concluídos", value: "12" }],
      columns: ["Número", "Situação"],
      rows: Array.from({ length: 80 }, (_, i) => [`${i + 1}/2026`, "concluido"]),
      limitations: [],
    };
    const bytes = await detailedReportPdf(preview, "Gestor de teste", new Date("2026-11-26T12:00:00Z"));
    const pdf = await PDFDocument.load(bytes);
    expect(pdf.getPageCount()).toBeGreaterThan(1);
    expect(new TextDecoder().decode(bytes.subarray(0, 5))).toBe("%PDF-");
  });
});
