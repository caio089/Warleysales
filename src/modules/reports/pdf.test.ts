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
    }, { totalEstimated: 10500.5, totalContracted: 800, totalSavings: 9700.5, averageSavingsPercent: 92.38, count: 1 }, context);
    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe("%PDF-");
    expect((await PDFDocument.load(bytes)).getPageCount()).toBeGreaterThanOrEqual(2);
    const pdf = await getDocumentProxy(bytes);
    try {
      const extracted = await extractText(pdf, { mergePages: true });
      const text = String(extracted.text);
      expect(text).toMatch(/R\$\s+10\.500,50/);
      expect(text).toContain("Processos por situação");
      expect(text).toContain("Alertas operacionais");
      expect(text).toContain("Comparativo financeiro");
    } finally {
      await pdf.destroy();
    }
  });

  it("identifica explicitamente a prévia com dados de demonstração", async () => {
    const bytes = await operationalReportPdf({
      processes: { total: 1, completed: 0, pending: 1, averageProgress: 20, byStatus: { em_andamento: 1 } },
      stock: { items: 0, critical: 0, withoutAvailability: 0 },
      contracts: { total: 0, expired: 0, expiring30: 0 },
      atas: { total: 0, expired: 0 },
    }, null, { ...context, demoPreview: true });
    const pdf = await getDocumentProxy(bytes);
    try {
      const extracted = await extractText(pdf, { mergePages: true });
      expect(String(extracted.text)).toContain("PRÉVIA DE DEMONSTRAÇÃO");
    } finally {
      await pdf.destroy();
    }
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
  it("inclui gráficos de resultados e eventos frequentes na auditoria", async () => {
    const bytes = await auditReportPdf([
      { id: "1", actorId: "user-1", action: "process.create", entity: "process", entityId: null, councilId: null, result: "success", details: {}, createdAt: new Date("2026-11-16T12:00:00Z") },
      { id: "2", actorId: "user-1", action: "document.upload", entity: "attachment", entityId: null, councilId: null, result: "denied", details: {}, createdAt: new Date("2026-11-16T12:00:00Z") },
      { id: "3", actorId: "user-1", action: "process.create", entity: "process", entityId: null, councilId: null, result: "error", details: {}, createdAt: new Date("2026-11-16T12:00:00Z") },
    ], "Sem filtros", context);
    const pdf = await getDocumentProxy(bytes);
    try {
      const extracted = await extractText(pdf, { mergePages: true });
      const text = String(extracted.text);
      expect(text).toContain("Distribuição por resultado");
      expect(text).toContain("Eventos mais frequentes");
      expect(text).toContain("Concluídos: 1");
      expect(text).toContain("Negados: 1");
      expect(text).toContain("Erros: 1");
    } finally {
      await pdf.destroy();
    }
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
