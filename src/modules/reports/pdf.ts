import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { formatCurrency as brl } from "@/shared/lib/format";
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
  actorNames?: Record<string, string>;
  councilNames?: Record<string, string>;
  demoPreview?: boolean;
}

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 48;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const COLORS = {
  primary: rgb(0.035, 0.20, 0.18),
  primarySoft: rgb(0.86, 0.93, 0.90),
  blue: rgb(0.16, 0.42, 0.66),
  green: rgb(0.12, 0.55, 0.39),
  amber: rgb(0.91, 0.58, 0.12),
  red: rgb(0.78, 0.23, 0.20),
  ink: rgb(0.12, 0.17, 0.16),
  muted: rgb(0.38, 0.42, 0.42),
  border: rgb(0.80, 0.84, 0.83),
  surface: rgb(0.96, 0.98, 0.97),
  white: rgb(1, 1, 1),
};

type ChartColor = ReturnType<typeof rgb>;
interface ChartDatum { label: string; value: number; displayValue?: string; color?: ChartColor }

function safeText(value: unknown): string {
  return String(value ?? "-")
    .replace(/[–—]/g, "-")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, "?");
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
    if (font.widthOfTextAtSize(word, size) > maxWidth) {
      if (line) { lines.push(line); line = ""; }
      let part = "";
      for (const character of word) {
        if (font.widthOfTextAtSize(part + character, size) > maxWidth) { lines.push(part); part = character; }
        else part += character;
      }
      line = part;
      continue;
    }
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
    page.drawRectangle({ x: 0, y: PAGE_HEIGHT - 94, width: PAGE_WIDTH, height: 94, color: COLORS.primary });
    page.drawText(safeText(context.branding.institution).slice(0, 55), { x: MARGIN, y: PAGE_HEIGHT - 38, size: 16, font: bold, color: COLORS.white });
    page.drawText(safeText(context.branding.subtitle), { x: MARGIN, y: PAGE_HEIGHT - 58, size: 9, font: regular, color: rgb(0.84, 0.93, 0.90) });
    page.drawText(safeText(title), { x: MARGIN, y: PAGE_HEIGHT - 82, size: 11, font: bold, color: COLORS.white });
    page.drawText(`Página ${pageNumber}`, { x: PAGE_WIDTH - 92, y: 24, size: 8, font: regular, color: rgb(0.38, 0.42, 0.42) });
    page.drawLine({ start: { x: MARGIN, y: 35 }, end: { x: PAGE_WIDTH - MARGIN, y: 35 }, thickness: 0.6, color: rgb(0.78, 0.82, 0.82) });
    return page;
  };
  const first = addPage();
  first.drawText(`Emitido em: ${dateTime(context.issuedAt)} (Fortaleza)`, { x: MARGIN, y: PAGE_HEIGHT - 116, size: 8, font: regular });
  first.drawText(`Emitido por: ${safeText(context.issuedBy).slice(0, 75)}`, { x: MARGIN, y: PAGE_HEIGHT - 130, size: 8, font: regular });
  first.drawText(`Escopo: ${safeText(context.scopeLabel)}`, { x: MARGIN, y: PAGE_HEIGHT - 144, size: 8, font: regular });
  return { document, regular, bold, addPage, first };
}

function drawMetricCards(page: PDFPage, metrics: { label: string; value: string; accent?: ChartColor }[], yTop: number, regular: PDFFont, bold: PDFFont): number {
  const gap = 8;
  const height = 62;
  const width = (CONTENT_WIDTH - gap * (metrics.length - 1)) / metrics.length;
  metrics.forEach((metric, index) => {
    const x = MARGIN + index * (width + gap);
    page.drawRectangle({ x, y: yTop - height, width, height, color: COLORS.surface, borderColor: COLORS.border, borderWidth: 0.6 });
    page.drawRectangle({ x, y: yTop - height, width: 4, height, color: metric.accent ?? COLORS.primary });
    page.drawText(safeText(metric.value), { x: x + 12, y: yTop - 29, size: 15, font: bold, color: COLORS.ink });
    const label = wrap(metric.label, regular, 7.5, width - 20).slice(0, 2);
    label.forEach((line, lineIndex) => page.drawText(line, { x: x + 12, y: yTop - 44 - lineIndex * 9, size: 7.5, font: regular, color: COLORS.muted }));
  });
  return yTop - height - 14;
}

function drawHorizontalBarChart(page: PDFPage, title: string, data: ChartDatum[], x: number, yTop: number, width: number, height: number, regular: PDFFont, bold: PDFFont): void {
  page.drawRectangle({ x, y: yTop - height, width, height, color: COLORS.white, borderColor: COLORS.border, borderWidth: 0.7 });
  page.drawText(safeText(title), { x: x + 12, y: yTop - 20, size: 10, font: bold, color: COLORS.primary });
  const rows = data.length ? data : [{ label: "Sem dados", value: 0, displayValue: "0" }];
  const max = Math.max(...rows.map((item) => item.value), 1);
  const rowHeight = Math.min(29, (height - 40) / rows.length);
  const labelWidth = Math.min(92, width * 0.42);
  const barX = x + 12 + labelWidth;
  const barWidth = width - labelWidth - 42;
  rows.forEach((item, index) => {
    const y = yTop - 43 - index * rowHeight;
    const label = safeText(item.label).slice(0, 24);
    page.drawText(label, { x: x + 12, y, size: 7.2, font: regular, color: COLORS.ink });
    page.drawRectangle({ x: barX, y: y - 1, width: barWidth, height: 8, color: COLORS.surface });
    if (item.value > 0) page.drawRectangle({ x: barX, y: y - 1, width: Math.max(3, barWidth * item.value / max), height: 8, color: item.color ?? COLORS.green });
    const value = safeText(item.displayValue ?? String(item.value));
    page.drawText(value, { x: x + width - 10 - bold.widthOfTextAtSize(value, 7.2), y, size: 7.2, font: bold, color: COLORS.ink });
  });
}

function drawStackedBar(page: PDFPage, title: string, data: ChartDatum[], yTop: number, regular: PDFFont, bold: PDFFont): number {
  const height = 92;
  page.drawRectangle({ x: MARGIN, y: yTop - height, width: CONTENT_WIDTH, height, color: COLORS.white, borderColor: COLORS.border, borderWidth: 0.7 });
  page.drawText(safeText(title), { x: MARGIN + 12, y: yTop - 20, size: 10, font: bold, color: COLORS.primary });
  const total = data.reduce((sum, item) => sum + Math.max(0, item.value), 0);
  const barX = MARGIN + 12;
  const barY = yTop - 48;
  const barWidth = CONTENT_WIDTH - 24;
  let cursor = barX;
  page.drawRectangle({ x: barX, y: barY, width: barWidth, height: 13, color: COLORS.surface });
  data.forEach((item) => {
    const width = total > 0 ? barWidth * item.value / total : 0;
    if (width > 0) page.drawRectangle({ x: cursor, y: barY, width, height: 13, color: item.color ?? COLORS.primary });
    cursor += width;
  });
  let legendX = barX;
  data.forEach((item) => {
    const text = `${safeText(item.label)}: ${safeText(item.displayValue ?? String(item.value))}`;
    page.drawRectangle({ x: legendX, y: yTop - 72, width: 7, height: 7, color: item.color ?? COLORS.primary });
    page.drawText(text, { x: legendX + 11, y: yTop - 73, size: 7.3, font: regular, color: COLORS.ink });
    legendX += 18 + regular.widthOfTextAtSize(text, 7.3);
  });
  return yTop - height - 14;
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
  const { document, regular, bold, addPage, first } = await createBase(context, "Relatório de Indicadores Operacionais");
  if (context.demoPreview) {
    first.drawRectangle({ x: MARGIN, y: PAGE_HEIGHT - 184, width: CONTENT_WIDTH, height: 25, color: rgb(0.99, 0.93, 0.76) });
    first.drawText("PRÉVIA DE DEMONSTRAÇÃO - não usar como prestação de contas", { x: MARGIN + 7, y: PAGE_HEIGHT - 176, size: 8, font: bold });
  }
  let y = PAGE_HEIGHT - (context.demoPreview ? 208 : 170);
  y = drawMetricCards(first, [
    { label: "Processos", value: String(summary.processes.total), accent: COLORS.blue },
    { label: "Concluídos", value: String(summary.processes.completed), accent: COLORS.green },
    { label: "Itens em estoque", value: String(summary.stock.items), accent: COLORS.primary },
    { label: "Contratos e atas", value: String(summary.contracts.total + summary.atas.total), accent: COLORS.amber },
  ], y, regular, bold);
  const chartGap = 12;
  const chartWidth = (CONTENT_WIDTH - chartGap) / 2;
  const statuses = Object.entries(summary.processes.byStatus).sort((a, b) => b[1] - a[1]);
  drawHorizontalBarChart(first, "Processos por situação", statuses.slice(0, 5).map(([status, count]) => ({
    label: status.replaceAll("_", " "), value: count, color: COLORS.blue,
  })), MARGIN, y, chartWidth, 190, regular, bold);
  drawHorizontalBarChart(first, "Alertas operacionais", [
    { label: "Estoque crítico", value: summary.stock.critical, color: COLORS.amber },
    { label: "Sem disponibilidade", value: summary.stock.withoutAvailability, color: COLORS.red },
    { label: "Contratos vencidos", value: summary.contracts.expired, color: COLORS.red },
    { label: "Vencem em 30 dias", value: summary.contracts.expiring30, color: COLORS.amber },
    { label: "Atas vencidas", value: summary.atas.expired, color: COLORS.red },
  ], MARGIN + chartWidth + chartGap, y, chartWidth, 190, regular, bold);
  y -= 204;
  if (savings) {
    y = drawStackedBar(first, "Comparativo financeiro", [
      { label: "Contratado", value: savings.totalContracted, displayValue: brl(savings.totalContracted), color: COLORS.blue },
      { label: "Economia", value: savings.totalSavings, displayValue: brl(savings.totalSavings), color: COLORS.green },
    ], y, regular, bold);
    first.drawText(`Valor inicial: ${brl(savings.totalEstimated)}  |  Redução média: ${percent(savings.averageSavingsPercent)}`, { x: MARGIN + 12, y: y + 21, size: 7.5, font: bold, color: COLORS.muted });
  } else {
    y = drawStackedBar(first, "Progresso documental médio", [
      { label: "Concluído", value: summary.processes.averageProgress ?? 0, displayValue: summary.processes.averageProgress === null ? "Sem dados" : percent(summary.processes.averageProgress), color: COLORS.green },
      { label: "Restante", value: Math.max(0, 100 - (summary.processes.averageProgress ?? 0)), displayValue: "", color: COLORS.primarySoft },
    ], y, regular, bold);
  }
  const source = context.demoPreview ? "Fonte: registros de demonstração dos módulos. Documento apenas para prévia." : "Fonte: Processos, Estoque, Contratos, Atas e Formalizações. Dados de demonstração excluídos.";
  first.drawText(source, { x: MARGIN, y: 48, size: 7.5, font: regular, color: COLORS.muted });

  let page = addPage();
  y = PAGE_HEIGHT - 122;
  page.drawText("Detalhamento dos indicadores", { x: MARGIN, y, size: 13, font: bold, color: COLORS.primary });
  y -= 25;
  const section = (title: string, rows: [string, string][]) => {
    const requiredHeight = 43 + rows.length * 22;
    if (y - requiredHeight < 52) { page = addPage(); y = PAGE_HEIGHT - 116; }
    y = drawSection(page, title, rows, y, regular, bold);
  };
  section("Processos", [
    ["Total", String(summary.processes.total)], ["Concluídos", String(summary.processes.completed)],
    ["Pendentes", String(summary.processes.pending)], ["Progresso documental médio", summary.processes.averageProgress === null ? "Sem dados" : percent(summary.processes.averageProgress)],
  ]);
  if (statuses.length) {
    section("Situação dos processos", statuses.map(([status, count]) => [status.replaceAll("_", " "), String(count)]));
  }
  section("Estoque, contratos e atas", [
    ["Itens em estoque", String(summary.stock.items)], ["Itens críticos", String(summary.stock.critical)],
    ["Sem disponibilidade", String(summary.stock.withoutAvailability)], ["Contratos vencidos", String(summary.contracts.expired)],
    ["Contratos vencendo em 30 dias", String(summary.contracts.expiring30)], ["Atas vencidas", String(summary.atas.expired)],
  ]);
  if (savings) {
    section("Economia gerada", [
      ["Valor global inicial", brl(savings.totalEstimated)], ["Valor efetivamente contratado", brl(savings.totalContracted)],
      ["Economia acumulada", brl(savings.totalSavings)], ["Redução média", percent(savings.averageSavingsPercent)],
      ["Contratações homologadas", String(savings.count)],
    ]);
  }
  if (summary.processes.total + summary.stock.items + summary.contracts.total + summary.atas.total + (savings?.count ?? 0) === 0) {
    page.drawText("Sem registros operacionais para o escopo selecionado.", { x: MARGIN, y: Math.max(y - 10, 62), size: 9, font: bold });
  }
  return document.save();
}

const ACTION_LABELS: Record<string, string> = {
  "document.upload": "Documento anexado", "process.documental_completed": "Documentação concluída",
  "process.create": "Processo criado", "request.create": "Solicitação criada",
  "contract.create": "Contrato cadastrado", "ata.create": "Ata cadastrada",
  "membership.assign": "Acesso atribuído", "notification.read": "Alerta lido",
};
const ENTITY_LABELS: Record<string, string> = {
  attachment: "Anexo", administrative_process: "Processo", process: "Processo", purchase_request: "Solicitação",
  contract: "Contrato", price_registration_ata: "Ata", council_membership: "Acesso de usuário",
};
const DETAIL_LABELS: Record<string, string> = { type: "Tipo", percent: "Conclusão (%)", number: "Número", status: "Situação", role: "Perfil", reason: "Motivo", quantity: "Quantidade" };

function auditDetails(details: Record<string, unknown>): string {
  return Object.entries(details).filter(([key, value]) => key in DETAIL_LABELS && value !== null && value !== undefined && typeof value !== "object")
    .map(([key, value]) => `${DETAIL_LABELS[key]}: ${String(value)}`).join("; ") || "Sem informações adicionais relevantes";
}

export async function auditReportPdf(entries: AuditEntry[], filtersLabel: string, context: PdfReportContext): Promise<Uint8Array> {
  const { document, regular, bold, addPage, first } = await createBase(context, "Relatório da Trilha de Auditoria");
  const filterLines = wrap(`Filtros: ${filtersLabel}`, regular, 8, CONTENT_WIDTH);
  filterLines.forEach((line, index) => first.drawText(line, { x: MARGIN, y: PAGE_HEIGHT - 161 - index * 11, size: 8, font: regular }));
  const summaryY = PAGE_HEIGHT - 169 - filterLines.length * 11;
  const successes = entries.filter((entry) => entry.result === "success").length;
  const denied = entries.filter((entry) => entry.result === "denied").length;
  const errors = entries.filter((entry) => entry.result === "error").length;
  let overviewY = drawMetricCards(first, [
    { label: "Eventos", value: String(entries.length), accent: COLORS.blue },
    { label: "Concluídos", value: String(successes), accent: COLORS.green },
    { label: "Negados", value: String(denied), accent: COLORS.amber },
    { label: "Erros", value: String(errors), accent: COLORS.red },
  ], summaryY, regular, bold);
  overviewY = drawStackedBar(first, "Distribuição por resultado", [
    { label: "Concluídos", value: successes, color: COLORS.green },
    { label: "Negados", value: denied, color: COLORS.amber },
    { label: "Erros", value: errors, color: COLORS.red },
  ], overviewY, regular, bold);
  const actions = Object.entries(entries.reduce<Record<string, number>>((totals, entry) => {
    totals[entry.action] = (totals[entry.action] ?? 0) + 1;
    return totals;
  }, {})).sort((a, b) => b[1] - a[1]).slice(0, 6);
  drawHorizontalBarChart(first, "Eventos mais frequentes", actions.map(([action, count]) => ({
    label: ACTION_LABELS[action] ?? action.replaceAll("_", " ").replaceAll(".", " · "), value: count, color: COLORS.blue,
  })), MARGIN, overviewY, CONTENT_WIDTH, 205, regular, bold);
  let page = first;
  let y = overviewY - 225;
  if (entries.length === 0) first.drawText("Nenhum evento encontrado para os filtros informados.", { x: MARGIN, y, size: 9, font: regular });
  else {
    page = addPage();
    y = PAGE_HEIGHT - 118;
    page.drawText("Detalhamento dos eventos", { x: MARGIN, y, size: 13, font: bold, color: COLORS.primary });
    y -= 24;
  }
  for (const entry of entries) {
    const resultLabel = { success: "Concluído", denied: "Negado", error: "Erro" }[entry.result];
    const title = `${dateTime(new Date(entry.createdAt))}  |  ${resultLabel}  |  ${ACTION_LABELS[entry.action] ?? entry.action.replaceAll("_", " ").replaceAll(".", " · ")}`;
    const organization = entry.councilId ? context.councilNames?.[entry.councilId] ?? `ID ${entry.councilId.slice(0, 8)}` : "Central";
    const actor = entry.actorId ? context.actorNames?.[entry.actorId] || `ID ${entry.actorId.slice(0, 8)}` : "Sistema";
    const lines = [
      ...wrap(title, bold, 8, CONTENT_WIDTH - 14),
      ...wrap(`Órgão: ${organization}  |  Responsável: ${actor}  |  Registro: ${ENTITY_LABELS[entry.entity] ?? entry.entity}`, regular, 7.5, CONTENT_WIDTH - 14),
      ...wrap(auditDetails(entry.details ?? {}), regular, 7.5, CONTENT_WIDTH - 14),
      ...wrap(`Ref. evento: ${entry.id}${entry.entityId ? `  |  Ref. registro: ${entry.entityId}` : ""}`, regular, 7, CONTENT_WIDTH - 14),
    ];
    const height = 13 + lines.length * 11;
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
