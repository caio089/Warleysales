import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { writeFile } from "node:fs/promises";
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

  it("mantém o papel timbrado e pagina registros com muitas informações", async () => {
    const report: DetailedReport = {
      title: "Relatório de contratos",
      filters: ["Órgão: CRCPI", "De: 2026-11-01", "Até: 2026-11-30"],
      summary: "8 contratos encontrados para os filtros selecionados.",
      indicators: [{ label: "Valor contratado", value: "R$ 150.000,00" }, { label: "Vigentes", value: "8" }],
      columns: ["Contrato", "Empresa", "Processo", "Objeto", "Situação", "Valor", "Quantidade", "Recebido", "Pendente", "Fim"],
      rows: Array.from({ length: 8 }, (_, i) => [`CTR ${i + 1}/2026`, "Fornecedor de móveis e equipamentos", "002/2026", "Cadeiras para o auditório e salas de reunião", "Vigente", "R$ 18.750,00", "30", "10", "20", "26/11/2027"]),
      limitations: ["Quantidades recebidas dependem dos lançamentos registrados no sistema."],
    };
    const bytes = await detailedReportPdf(report, "Gestor de teste", new Date("2026-11-27T15:00:00Z"));
    const pdf = await PDFDocument.load(bytes);
    expect(pdf.getPageCount()).toBeGreaterThan(1);
    expect(pdf.getPage(0).getSize().width).toBeCloseTo(595.28);
    if (process.env.PDF_PREVIEW_PATH) await writeFile(process.env.PDF_PREVIEW_PATH, bytes);
  });
});
