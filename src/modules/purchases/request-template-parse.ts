import type { ExtractedPurchaseRequest } from "./request-extraction";
import {
  htmlTablesToMatrices,
  parseRequestTemplateMatrix,
  spreadsheetToMatrix,
} from "./request-template";

function parseMetaFromPlainText(text: string): Pick<ExtractedPurchaseRequest, "title" | "estimatedValue"> {
  let title: string | null = null;
  let estimatedValue: number | null = null;
  for (const line of text.split(/\r?\n/).map((part) => part.trim()).filter(Boolean).slice(0, 40)) {
    const titleMatch = line.match(/^(t[ií]tulo|demanda)\s*[:\-]\s*(.+)$/i);
    if (!title && titleMatch?.[2] && titleMatch[2].trim().length >= 3) {
      title = titleMatch[2].trim().slice(0, 200);
    }
    const valueMatch = line.match(/^valor(?:\s+estimado)?(?:\s*\(r\$\))?\s*[:\-]\s*(.+)$/i);
    if (estimatedValue == null && valueMatch?.[1]) {
      const normalized = valueMatch[1].includes(",") && valueMatch[1].includes(".")
        ? valueMatch[1].replace(/\./g, "").replace(",", ".")
        : valueMatch[1].replace(",", ".");
      const value = Number(normalized.replace(/[^\d.-]/g, ""));
      if (Number.isFinite(value) && value >= 0) estimatedValue = value;
    }
  }
  return { title, estimatedValue };
}

/** Tenta ler o modelo Excel oficial (ou planilha com as mesmas colunas). */
export function tryParseExcelTemplate(bytes: Uint8Array): ExtractedPurchaseRequest | null {
  return parseRequestTemplateMatrix(spreadsheetToMatrix(bytes));
}

/**
 * Tenta ler o modelo Word: tabelas HTML (Item/Quantidade/Unidade) + metadados no texto.
 * `html` vem do mammoth.convertToHtml; `plain` do extractRawText.
 */
export function tryParseWordTemplate(html: string, plain: string): ExtractedPurchaseRequest | null {
  const meta = parseMetaFromPlainText(`${plain}\n${html.replace(/<[^>]+>/g, "\n")}`);
  for (const matrix of htmlTablesToMatrices(html)) {
    const parsed = parseRequestTemplateMatrix(matrix);
    if (!parsed) continue;
    return {
      title: meta.title ?? parsed.title,
      estimatedValue: meta.estimatedValue ?? parsed.estimatedValue,
      items: parsed.items,
    };
  }
  // Sem tabela HTML reconhecível: tenta matriz “fantasma” a partir de linhas tab-separadas.
  const looseRows = plain
    .split(/\r?\n/)
    .map((line) => line.split(/\t+/).map((cell) => cell.trim()))
    .filter((row) => row.some((cell) => cell.length > 0));
  const parsed = parseRequestTemplateMatrix(looseRows);
  if (!parsed) return null;
  return {
    title: meta.title ?? parsed.title,
    estimatedValue: meta.estimatedValue ?? parsed.estimatedValue,
    items: parsed.items,
  };
}
