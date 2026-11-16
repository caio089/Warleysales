import { PDFDocument } from "pdf-lib";
import { extractText, getDocumentProxy } from "unpdf";
import { describe, expect, it } from "vitest";
import { auditReportPdf, operationalReportPdf } from "./pdf";

const context = {
  branding: { institution: "Instituição Teste", subtitle: "Papel timbrado" },
  issuedAt: new Date("2026-11-16T12:00:00Z"),
  issuedBy: "user-1",
  scopeLabel: "Órgão TESTE",
};

describe("PDF de relatórios", () => {
  it("gera um PDF operacional válido", async () => {
    const bytes = await operationalReportPdf({
      processes: { total: 2, completed: 1, pending: 1, averageProgress: 50, byStatus: { aberto: 2 } },
      stock: { items: 3, critical: 1, withoutAvailability: 0 },
      contracts: { total: 1, expired: 0, expiring30: 1 },
      atas: { total: 1, expired: 0 },
    }, { totalEstimated: 1000, totalContracted: 800, totalSavings: 200, averageSavingsPercent: 20, count: 1 }, context);
    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe("%PDF-");
    expect((await PDFDocument.load(bytes)).getPageCount()).toBe(1);
  });

  it("pagina a trilha extensa de auditoria", async () => {
    const entries = Array.from({ length: 60 }, (_, index) => ({
      id: String(index + 1), actorId: "user-1", action: "process.create", entity: "process",
      entityId: `process-${index}`, councilId: "council-1", result: "success" as const,
      details: { number: index + 1 }, createdAt: new Date("2026-11-16T12:00:00Z"),
    }));
    const document = await PDFDocument.load(await auditReportPdf(entries, "Sem filtros", context));
    expect(document.getPageCount()).toBeGreaterThan(1);
  });
  it("apresenta eventos de auditoria em linguagem legível e preserva as referências", async () => {
    const id = "12345678-1234-1234-1234-123456789012";
    const bytes = await auditReportPdf([{
      id, actorId: id, action: "document.upload", entity: "attachment", entityId: id,
      councilId: id, result: "success", details: { type: "ETP", sha256: "hash-tecnico-oculto" },
      createdAt: new Date("2026-11-16T12:00:00Z"),
    }], "Sem filtros", { ...context, actorNames: { [id]: "Maria Silva" }, councilNames: { [id]: "CRM" } });
    const pdf = await getDocumentProxy(bytes);
    try {
      const extracted = await extractText(pdf, { mergePages: true });
      const text = String(extracted.text);
      expect(text).toContain("Documento anexado");
      expect(text).toContain("Maria Silva");
      expect(text).toContain("CRM");
      expect(text).toContain(id);
      expect(text).not.toContain("hash-tecnico-oculto");
    } finally {
      await pdf.destroy();
    }
  });
});
