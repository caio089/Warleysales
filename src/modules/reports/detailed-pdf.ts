import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { DetailedReport } from "./detailed";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const LEFT = 48;
const RIGHT = PAGE_WIDTH - LEFT;
const WIDTH = RIGHT - LEFT;
const NAVY = rgb(0.06, 0.10, 0.22);
const ORANGE = rgb(248 / 255, 112 / 255, 4 / 255);
const MUTED = rgb(0.34, 0.39, 0.46);
const LIGHT = rgb(0.94, 0.95, 0.97);

const clean = (value: string) => String(value ?? "-")
  .replace(/[–—]/g, "-").replace(/[“”]/g, '"').replace(/[‘’]/g, "'")
  .replace(/\u00a0/g, " ").replace(/[^\x20-\x7e\xa1-\xff]/g, " ").trim() || "-";

function wrap(value: string, font: PDFFont, size: number, width: number): string[] {
  const result: string[] = [];
  for (const paragraph of clean(value).split(/\r?\n/)) {
    let line = "";
    for (const word of paragraph.split(/\s+/)) {
      const candidate = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= width) { line = candidate; continue; }
      if (line) { result.push(line); line = ""; }
      for (const char of word) {
        if (font.widthOfTextAtSize(line + char, size) > width && line) { result.push(line); line = ""; }
        line += char;
      }
    }
    result.push(line || "-");
  }
  return result;
}

/** A prévia e o PDF recebem o mesmo DetailedReport, sem outra consulta ou cálculo. */
export async function detailedReportPdf(data: DetailedReport, issuedBy: string, issuedAt: Date): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(clean(data.title));
  pdf.setAuthor("Warley Sales");
  pdf.setCreationDate(issuedAt);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const letterhead = await pdf.embedPng(await readFile(join(process.cwd(), "public", "brand", "papel-timbrado.png")));
  const issued = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Fortaleza", dateStyle: "short", timeStyle: "short" }).format(issuedAt);
  let page!: PDFPage;
  let y = 690;

  const addPage = () => {
    page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    page.drawImage(letterhead, { x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT });
    y = 690;
  };
  const ensure = (height: number) => { if (y - height < 87) addPage(); };
  const drawLines = (value: string, x: number, width: number, font: PDFFont, size: number, color = NAVY, leading = 13) => {
    const result = wrap(value, font, size, width);
    ensure(result.length * leading);
    for (const text of result) {
      page.drawText(text, { x, y, size, font, color });
      y -= leading;
    }
  };
  const section = (title: string) => {
    ensure(36);
    y -= 10;
    page.drawRectangle({ x: LEFT, y: y - 3, width: 3, height: 16, color: ORANGE });
    page.drawText(title, { x: LEFT + 11, y, size: 11.5, font: bold, color: NAVY });
    y -= 28;
  };

  addPage();
  drawLines(data.title, LEFT, WIDTH, bold, 17, NAVY, 21);
  y -= 5;
  drawLines(`Emitido em ${issued} (Fortaleza)  |  Responsável: ${issuedBy}`, LEFT, WIDTH, regular, 8.5, MUTED, 12);
  y -= 4;
  page.drawLine({ start: { x: LEFT, y }, end: { x: RIGHT, y }, thickness: 0.8, color: ORANGE });
  y -= 9;

  section("Resumo");
  drawLines(data.summary, LEFT, WIDTH, regular, 10, NAVY, 15);
  y -= 8;

  if (data.filters.length) {
    section("Filtros aplicados");
    for (const filter of data.filters) {
      ensure(wrap(filter, regular, 9, WIDTH - 15).length * 13 + 4);
      page.drawRectangle({ x: LEFT + 1, y: y + 2, width: 3, height: 3, color: ORANGE });
      drawLines(filter, LEFT + 13, WIDTH - 15, regular, 9, MUTED);
      y -= 4;
    }
  }

  if (data.indicators.length) {
    section("Indicadores");
    const gap = 12;
    const cardWidth = (WIDTH - gap) / 2;
    for (let i = 0; i < data.indicators.length; i += 2) {
      const pair = data.indicators.slice(i, i + 2);
      const height = Math.max(54, ...pair.map(({ label, value }) => 18 + wrap(label, regular, 8.5, cardWidth - 20).length * 11 + wrap(value, bold, 13, cardWidth - 20).length * 16));
      ensure(height + 10);
      pair.forEach(({ label, value }, column) => {
        const x = LEFT + column * (cardWidth + gap);
        page.drawRectangle({ x, y: y - height, width: cardWidth, height, color: LIGHT });
        const labelLines = wrap(label, regular, 8.5, cardWidth - 20);
        labelLines.forEach((text, j) => page.drawText(text, { x: x + 10, y: y - 15 - j * 11, size: 8.5, font: regular, color: MUTED }));
        wrap(value, bold, 13, cardWidth - 20).forEach((text, j) => page.drawText(text, { x: x + 10, y: y - 19 - labelLines.length * 11 - j * 16, size: 13, font: bold, color: NAVY }));
      });
      y -= height + 10;
    }
  }

  section(`Registros detalhados (${data.rows.length})`);
  if (!data.rows.length) drawLines("Nenhum registro para os filtros selecionados.", LEFT, WIDTH, regular, 9, MUTED);
  const gap = 16;
  const fieldWidth = (WIDTH - gap - 24) / 2;
  for (const [index, row] of data.rows.entries()) {
    const fields = data.columns.map((label, i) => ({ label, value: row[i] || "-" }));
    const heights: number[] = [];
    for (let i = 0; i < fields.length; i += 2) {
      heights.push(Math.max(...fields.slice(i, i + 2).map(({ label, value }) =>
        wrap(label, bold, 7.5, fieldWidth).length * 10 + wrap(value, regular, 9, fieldWidth).length * 12 + 8)));
    }
    const totalHeight = heights.reduce((sum, height) => sum + height, 0) + 35;
    ensure(Math.min(totalHeight, 600));
    page.drawRectangle({ x: LEFT, y: y - 25, width: WIDTH, height: 25, color: NAVY });
    page.drawText(`REGISTRO ${index + 1} DE ${data.rows.length}`, { x: LEFT + 11, y: y - 17, size: 8, font: bold, color: rgb(1, 1, 1) });
    y -= 39;
    for (let i = 0; i < fields.length; i += 2) {
      ensure(heights[i / 2]);
      fields.slice(i, i + 2).forEach(({ label, value }, column) => {
        const x = LEFT + 12 + column * (fieldWidth + gap);
        const labels = wrap(label.toUpperCase(), bold, 7.5, fieldWidth);
        labels.forEach((text, j) => page.drawText(text, { x, y: y - j * 10, size: 7.5, font: bold, color: MUTED }));
        wrap(value, regular, 9, fieldWidth).forEach((text, j) => page.drawText(text, { x, y: y - labels.length * 10 - j * 12, size: 9, font: regular, color: NAVY }));
      });
      y -= heights[i / 2];
    }
    y -= 7;
    page.drawLine({ start: { x: LEFT, y }, end: { x: RIGHT, y }, thickness: 0.7, color: LIGHT });
    y -= 15;
  }

  if (data.limitations.length) {
    section("Observações sobre os dados");
    for (const item of data.limitations) {
      drawLines(item, LEFT, WIDTH, regular, 8.5, MUTED, 13);
      y -= 8;
    }
  }

  const pages = pdf.getPages();
  pages.forEach((p, index) => {
    const label = `Página ${index + 1} de ${pages.length}`;
    p.drawText(label, { x: RIGHT - regular.widthOfTextAtSize(label, 8), y: 60, size: 8, font: regular, color: MUTED });
  });
  return pdf.save();
}
