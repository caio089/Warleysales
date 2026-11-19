import "server-only";
import mammoth from "mammoth";
import * as XLSX from "xlsx";

export type RequestDocumentKind = "xlsx" | "docx";

const ZIP_MAGIC = [0x50, 0x4b, 0x03, 0x04] as const;

/** Detecta Excel (.xlsx) ou Word (.docx) por extensão e assinatura ZIP (OOXML). */
export function detectRequestDocument(fileName: string, bytes: Uint8Array): RequestDocumentKind | null {
  if (bytes.length < 4 || ZIP_MAGIC.some((value, index) => bytes[index] !== value)) return null;
  const extension = fileName.includes(".") ? fileName.slice(fileName.lastIndexOf(".") + 1).toLowerCase() : "";
  if (extension === "xlsx") return "xlsx";
  if (extension === "docx") return "docx";
  return null;
}

/** Converte planilha em texto tabular legível para a IA (abas separadas). */
export function extractSpreadsheetText(bytes: Uint8Array): string {
  const workbook = XLSX.read(bytes, { type: "array", cellDates: true });
  const parts: string[] = [];
  for (const sheetName of workbook.SheetNames.slice(0, 8)) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;
    const csv = XLSX.utils.sheet_to_csv(sheet, { blankrows: false }).trim();
    if (!csv) continue;
    parts.push(`# Aba: ${sheetName}\n${csv}`);
  }
  return parts.join("\n\n").trim();
}

/** Extrai texto de um .docx (parágrafos e tabelas). */
export async function extractWordText(bytes: Uint8Array): Promise<string> {
  const result = await mammoth.extractRawText({ buffer: Buffer.from(bytes) });
  return String(result.value ?? "").trim();
}

export async function extractRequestDocumentText(kind: RequestDocumentKind, bytes: Uint8Array): Promise<string> {
  return kind === "xlsx" ? extractSpreadsheetText(bytes) : extractWordText(bytes);
}
