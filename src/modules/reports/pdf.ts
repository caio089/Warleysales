import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { AuditEntry } from "@/modules/audit/schemas";
import type { OperationalSummary } from "./service";

export interface ReportBranding {
  institution: string;
  subtitle: string;
}

export interface SavingsReportData {
  totalEstimated: number;
  totalContracted: number;
  totalSavings: number;
  averageSavingsPercent: number;
  count: number;
}

export interface PdfReportContext {
  branding: ReportBranding;
  issuedAt: Date;
  issuedBy: string;
  scopeLabel: string;
}

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 48;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function safeText(value: unknown): string {
  return String(value ?? "-")
    .replace(/[–—]/g, "-")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, "?");
}

function brl(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function percent(value: number): string {
  return new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value) + "%";
}

function dateTime(value: Date): string {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Fortaleza", dateStyle: "short", timeStyle: "short" }).format(value);
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = safeText(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) line = candidate;
    else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : ["-"];
}

async function createBase(context: PdfReportContext, title: string) {
  const document = await PDFDocument.create();
  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  let pageNumber = 0;
  const addPage = () => {
    const page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pageNumber += 1;
    page.drawRectangle({ x: 0, y: PAGE_HEIGHT - 94, width: PAGE_WIDTH, height: 94, color: rgb(0.035, 0.20, 0.18) });
    page.drawText(safeText(context.branding.institution), { x: MARGIN, y: PAGE_HEIGHT - 38, size: 16, font: bold, color: rgb(1, 1, 1) });
    page.drawText(safeText(context.branding.subtitle), { x: MARGIN, y: PAGE_HEIGHT - 58, size: 9, font: regular, color: rgb(0.84, 0.93, 0.90) });
    page.drawText(safeText(title), { x: MARGIN, y: PAGE_HEIGHT - 82, size: 11, font: bold, color: rgb(1, 1, 1) });
    page.drawText(`Página ${pageNumber}`, { x: PAGE_WIDTH - 92, y: 24, size: 8, font: regular, color: rgb(0.38, 0.42, 0.42) });
    page.drawLine({ start: { x: MARGIN, y: 35 }, end: { x: PAGE_WIDTH - MARGIN, y: 35 }, thickness: 0.6, color: rgb(0.78, 0.82, 0.82) });
    return page;
  };
  const first = addPage();
  first.drawText(`Emitido em: ${dateTime(context.issuedAt)} (Fortaleza)`, { x: MARGIN, y: PAGE_HEIGHT - 116, size: 8, font: regular });
  first.drawText(`Responsável: ${safeText(context.issuedBy)}`, { x: MARGIN, y: PAGE_HEIGHT - 130, size: 8, font: regular });
  first.drawText(`Escopo: ${safeText(context.scopeLabel)}`, { x: MARGIN, y: PAGE_HEIGHT - 144, size: 8, font: regular });
  return { document, regular, bold, addPage, first };
}

function drawSection(page: PDFPage, title: string, rows: [string, string][], y: number, regular: PDFFont, bold: PDFFont): number {
  page.drawText(safeText(title), { x: MARGIN, y, size: 12, font: bold, color: rgb(0.035, 0.20, 0.18) });
  y -= 19;
  for (const [label, value] of rows) {
    page.drawRectangle({ x: MARGIN, y: y - 3, width: CONTENT_WIDTH, height: 18, color: rgb(0.95, 0.97, 0.96) });
    page.drawText(safeText(label), { x: MARGIN + 7, y: y + 2, size: 8.5, font: regular });
    const width = bold.widthOfTextAtSize(safeText(value), 8.5);
    page.drawText(safeText(value), { x: PAGE_WIDTH - MARGIN - 7 - width, y: y + 2, size: 8.5, font: bold });
    y -= 22;
  }
  return y - 12;
}

export async function operationalReportPdf(summary: OperationalSummary, savings: SavingsReportData | null, context: PdfReportContext): Promise<Uint8Array> {
  const { document, regular, bold, first } = await createBase(context, "Relatório de Indicadores Operacionais");
  let y = PAGE_HEIGHT - 176;
  y = drawSection(first, "Processos", [
    ["Total", String(summary.processes.total)], ["Concluídos", String(summary.processes.completed)],
    ["Pendentes", String(summary.processes.pending)], ["Progresso documental médio", summary.processes.averageProgress === null ? "Sem dados" : percent(summary.processes.averageProgress)],
  ], y, regular, bold);
  y = drawSection(first, "Estoque, contratos e atas", [
    ["Itens em estoque", String(summary.stock.items)], ["Itens críticos", String(summary.stock.critical)],
    ["Sem disponibilidade", String(summary.stock.withoutAvailability)], ["Contratos vencidos", String(summary.contracts.expired)],
    ["Contratos vencendo em 30 dias", String(summary.contracts.expiring30)], ["Atas vencidas", String(summary.atas.expired)],
  ], y, regular, bold);
  if (savings) {
    drawSection(first, "Economia gerada", [
      ["Valor global inicial", brl(savings.totalEstimated)], ["Valor efetivamente contratado", brl(savings.totalContracted)],
      ["Economia acumulada", brl(savings.totalSavings)], ["Redução média", percent(savings.averageSavingsPercent)],
      ["Contratações homologadas", String(savings.count)],
    ], y, regular, bold);
  }
  first.drawText("Fonte: dados autorizados dos módulos Processos, Estoque, Contratos, Atas e Formalizações.", { x: MARGIN, y: 48, size: 7.5, font: regular, color: rgb(0.35, 0.39, 0.39) });
  return document.save();
}

export async function auditReportPdf(entries: AuditEntry[], filtersLabel: string, context: PdfReportContext): Promise<Uint8Array> {
  const { document, regular, bold, addPage, first } = await createBase(context, "Relatório da Trilha de Auditoria");
  first.drawText(`Filtros: ${safeText(filtersLabel)}`, { x: MARGIN, y: PAGE_HEIGHT - 161, size: 8, font: regular });
  first.drawText(`Eventos exportados: ${entries.length}`, { x: MARGIN, y: PAGE_HEIGHT - 175, size: 8, font: bold });
  let page = first;
  let y = PAGE_HEIGHT - 204;
  for (const entry of entries) {
    const detail = Object.entries(entry.details ?? {}).filter(([, value]) => value !== null && value !== undefined && typeof value !== "object").map(([key, value]) => `${key}: ${value}`).join(", ") || "Sem detalhes";
    const lines = [
      `${dateTime(new Date(entry.createdAt))} | ${entry.result.toUpperCase()} | ${entry.action}`,
      `Órgão: ${entry.councilId ?? "Central"} | Responsável: ${entry.actorId ?? "Sistema"}`,
      `Entidade: ${entry.entity}${entry.entityId ? ` | ID: ${entry.entityId}` : ""}`,
      ...wrap(detail, regular, 7.5, CONTENT_WIDTH - 12),
    ];
    const height = 12 + lines.length * 11;
    if (y - height < 52) {
      page = addPage();
      y = PAGE_HEIGHT - 116;
    }
    page.drawRectangle({ x: MARGIN, y: y - height + 5, width: CONTENT_WIDTH, height, borderColor: rgb(0.80, 0.84, 0.83), borderWidth: 0.6 });
    lines.forEach((line, index) => page.drawText(safeText(line), { x: MARGIN + 6, y: y - 8 - index * 11, size: index === 0 ? 8 : 7.5, font: index === 0 ? bold : regular }));
    y -= height + 7;
  }
  return document.save();
}
