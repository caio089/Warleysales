import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import type { DetailedReport } from "./detailed";

const clean = (value: string) => value.replace(/[–—]/g, "-").replace(/[^\x20-\x7e\xa0-\xff]/g, "?");

/** A prévia e o PDF recebem exatamente o mesmo DetailedReport, sem segunda consulta ou cálculo. */
export async function detailedReportPdf(data: DetailedReport, issuedBy: string, issuedAt: Date): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const width = 595.28;
  let page = pdf.addPage([width, 841.89]);
  let y = 735;
  const line = (value: string, font: PDFFont = regular, size = 9) => {
    const text = clean(value);
    const words = text.split(/\s+/);
    let current = "";
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) > 500 && current) {
        if (y < 58) { page = pdf.addPage([width, 841.89]); y = 760; }
        page.drawText(current, { x: 48, y, size, font }); y -= 14; current = word;
      } else current = candidate;
    }
    if (y < 58) { page = pdf.addPage([width, 841.89]); y = 760; }
    page.drawText(current || "-", { x: 48, y, size, font }); y -= 16;
  };
  page.drawRectangle({ x: 0, y: 777, width, height: 65, color: rgb(0.035, 0.20, 0.18) });
  page.drawText("Warleysales", { x: 48, y: 805, size: 17, font: bold, color: rgb(1, 1, 1) });
  page.drawText(clean(data.title), { x: 48, y: 785, size: 11, font: regular, color: rgb(1, 1, 1) });
  line(`Emitido em: ${new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Fortaleza", dateStyle: "short", timeStyle: "short" }).format(issuedAt)} (Fortaleza)`);
  line(`Responsável pela emissão: ${issuedBy}`);
  line(`Filtros: ${data.filters.join("; ") || "Nenhum"}`);
  y -= 8; line("Resumo executivo", bold, 12); line(data.summary);
  y -= 8; line("Indicadores consolidados", bold, 12);
  for (const item of data.indicators) line(`${item.label}: ${item.value}`);
  y -= 8; line("Informações detalhadas", bold, 12);
  line(data.columns.join(" | "), bold, 8);
  for (const row of data.rows) line(row.join(" | "), regular, 8);
  if (data.rows.length === 0) line("Nenhum registro para os filtros selecionados.");
  if (data.limitations.length) { y -= 8; line("Limitações dos dados", bold, 12); for (const item of data.limitations) line(item); }
  const pages = pdf.getPages();
  pages.forEach((p, index) => p.drawText(`Página ${index + 1} de ${pages.length}`, { x: 468, y: 27, size: 8, font: regular }));
  return pdf.save();
}
