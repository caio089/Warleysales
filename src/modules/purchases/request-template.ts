import * as XLSX from "xlsx";
import { z } from "zod";
import type { ExtractedPurchaseRequest } from "./request-extraction";

/** Cabeçalhos oficiais do modelo — a importação compara com estes nomes (e aliases). */
export const TEMPLATE_HEADERS = {
  title: "Título",
  estimatedValue: "Valor estimado (R$)",
  item: "Item",
  quantity: "Quantidade",
  unit: "Unidade",
} as const;

const ITEM_ALIASES = ["item", "produto", "descricao", "descrição", "material", "nome"];
const QTY_ALIASES = ["quantidade", "qtd", "qtde", "qty", "qtde."];
const UNIT_ALIASES = ["unidade", "un", "und", "u.m.", "um"];

const parsedItemSchema = z.object({
  description: z.string().trim().min(2).max(160),
  quantity: z.number().positive(),
  unit: z.string().trim().min(1).max(20).nullable(),
});

function normalizeHeader(value: unknown): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function parseNumber(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  const text = String(raw ?? "").trim();
  if (!text) return null;
  const normalized = text.includes(",") && text.includes(".")
    ? text.replace(/\./g, "").replace(",", ".")
    : text.replace(",", ".");
  const cleaned = normalized.replace(/[^\d.-]/g, "");
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

function matchAlias(header: string, aliases: string[]): boolean {
  return aliases.some((alias) => header === alias || header.startsWith(`${alias} `));
}

/**
 * Localiza a linha de cabeçalho Item/Quantidade/Unidade e lê todas as linhas seguintes.
 * Também captura Título e Valor estimado se estiverem nas primeiras linhas no formato rótulo|valor.
 */
export function parseRequestTemplateMatrix(rows: unknown[][]): ExtractedPurchaseRequest | null {
  if (rows.length === 0) return null;

  let title: string | null = null;
  let estimatedValue: number | null = null;
  let headerIndex = -1;
  let itemCol = -1;
  let qtyCol = -1;
  let unitCol = -1;

  for (let index = 0; index < Math.min(rows.length, 40); index += 1) {
    const row = rows[index] ?? [];
    const cells = row.map((cell) => normalizeHeader(cell));
    const itemIdx = cells.findIndex((cell) => matchAlias(cell, ITEM_ALIASES));
    const qtyIdx = cells.findIndex((cell) => matchAlias(cell, QTY_ALIASES));
    const unitIdx = cells.findIndex((cell) => matchAlias(cell, UNIT_ALIASES));
    if (itemIdx >= 0 && qtyIdx >= 0) {
      headerIndex = index;
      itemCol = itemIdx;
      qtyCol = qtyIdx;
      unitCol = unitIdx;
      break;
    }

    const label = cells[0] ?? "";
    const rawValue = row[1];
    if (!title && (label === "titulo" || label === "titulo da solicitacao" || label === "demanda")) {
      const value = String(rawValue ?? "").trim();
      if (value.length >= 3) title = value.slice(0, 200);
    }
    if (estimatedValue == null && (label.startsWith("valor estimado") || label === "valor" || label === "valor total")) {
      estimatedValue = parseNumber(rawValue);
      if (estimatedValue != null && estimatedValue < 0) estimatedValue = null;
    }
  }

  if (headerIndex < 0 || itemCol < 0 || qtyCol < 0) return null;

  const items: ExtractedPurchaseRequest["items"] = [];
  for (const row of rows.slice(headerIndex + 1)) {
    const description = String(row[itemCol] ?? "").trim();
    const quantity = parseNumber(row[qtyCol]);
    if (!description && (quantity == null || quantity <= 0)) continue;
    const unitRaw = unitCol >= 0 ? String(row[unitCol] ?? "").trim() : "";
    const candidate = {
      description,
      quantity: quantity ?? 0,
      unit: unitRaw ? unitRaw.slice(0, 20) : "un",
    };
    const parsed = parsedItemSchema.safeParse(candidate);
    if (parsed.success) items.push({ ...parsed.data, unit: parsed.data.unit });
    if (items.length >= 80) break;
  }

  if (items.length === 0) return null;
  if (!title) title = `Solicitação com ${items.length} itens`;
  return { title, estimatedValue, items };
}

/** Gera o modelo Excel oficial (várias linhas de item de uma vez). */
export function buildRequestExcelTemplate(): Uint8Array {
  const sheet = XLSX.utils.aoa_to_sheet([
    [TEMPLATE_HEADERS.title, ""],
    [TEMPLATE_HEADERS.estimatedValue, ""],
    [],
    [TEMPLATE_HEADERS.item, TEMPLATE_HEADERS.quantity, TEMPLATE_HEADERS.unit],
    ["Papel A4", 100, "resma"],
    ["Caneta azul", 50, "un"],
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ]);
  sheet["!cols"] = [{ wch: 40 }, { wch: 14 }, { wch: 12 }];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Solicitacao");
  return new Uint8Array(XLSX.write(workbook, { type: "array", bookType: "xlsx" }));
}

/** Lê a primeira aba de um .xlsx como matriz de células. */
export function spreadsheetToMatrix(bytes: Uint8Array): unknown[][] {
  const workbook = XLSX.read(bytes, { type: "array", cellDates: true });
  const first = workbook.SheetNames[0];
  if (!first) return [];
  const sheet = workbook.Sheets[first];
  if (!sheet) return [];
  return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", blankrows: false }) as unknown[][];
}

/** Converte tabela HTML (Word via mammoth) em matriz. */
export function htmlTablesToMatrices(html: string): unknown[][][] {
  const tables: unknown[][][] = [];
  const tableRegex = /<table[\s\S]*?<\/table>/gi;
  const matches = html.match(tableRegex) ?? [];
  for (const tableHtml of matches.slice(0, 5)) {
    const rows: unknown[][] = [];
    const rowRegex = /<tr[\s\S]*?<\/tr>/gi;
    for (const rowHtml of tableHtml.match(rowRegex) ?? []) {
      const cells: string[] = [];
      const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
      let cellMatch: RegExpExecArray | null;
      while ((cellMatch = cellRegex.exec(rowHtml))) {
        const text = cellMatch[1]
          .replace(/<[^>]+>/g, " ")
          .replace(/&nbsp;/gi, " ")
          .replace(/&amp;/gi, "&")
          .replace(/\s+/g, " ")
          .trim();
        cells.push(text);
      }
      if (cells.some((cell) => cell.length > 0)) rows.push(cells);
    }
    if (rows.length > 0) tables.push(rows);
  }
  return tables;
}

/**
 * Monta um .docx mínimo com título, valor e tabela de itens (modelo oficial).
 * Usa JSZip já presente como dependência transitiva do mammoth.
 */
export async function buildRequestWordTemplate(): Promise<Uint8Array> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  const rows = [
    ["Papel A4", "100", "resma"],
    ["Caneta azul", "50", "un"],
    ["", "", ""],
    ["", "", ""],
  ];
  const tableRowsXml = [
    tableRowXml([TEMPLATE_HEADERS.item, TEMPLATE_HEADERS.quantity, TEMPLATE_HEADERS.unit], true),
    ...rows.map((row) => tableRowXml(row, false)),
  ].join("");

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>Modelo de solicitação — preencha vários itens na tabela</w:t></w:r></w:p>
    <w:p><w:r><w:t>${TEMPLATE_HEADERS.title}: </w:t></w:r><w:r><w:t></w:t></w:r></w:p>
    <w:p><w:r><w:t>${TEMPLATE_HEADERS.estimatedValue}: </w:t></w:r><w:r><w:t></w:t></w:r></w:p>
    <w:tbl>
      <w:tblPr><w:tblW w:w="5000" w:type="pct"/></w:tblPr>
      ${tableRowsXml}
    </w:tbl>
    <w:p><w:r><w:t>Apague as linhas de exemplo e inclua quantos itens precisar. Depois importe o arquivo na tela Nova solicitação.</w:t></w:r></w:p>
  </w:body>
</w:document>`;

  zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);
  zip.folder("_rels")?.file(".rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);
  zip.folder("word")?.file("document.xml", documentXml);
  zip.folder("word")?.folder("_rels")?.file("document.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>`);

  const buffer = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
  return buffer;
}

function tableRowXml(cells: string[], header: boolean): string {
  const cellXml = cells
    .map((text) => {
      const safe = escapeXml(text);
      const run = header
        ? `<w:r><w:rPr><w:b/></w:rPr><w:t>${safe}</w:t></w:r>`
        : `<w:r><w:t>${safe}</w:t></w:r>`;
      return `<w:tc><w:tcPr><w:tcW w:w="2000" w:type="dxa"/></w:tcPr><w:p>${run}</w:p></w:tc>`;
    })
    .join("");
  return `<w:tr>${cellXml}</w:tr>`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
