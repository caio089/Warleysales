import { describe, expect, it, vi } from "vitest";
import * as XLSX from "xlsx";

vi.mock("server-only", () => ({}));

import { detectRequestDocument, extractSpreadsheetText } from "./request-document-text";

function zipMagic(...rest: number[]) {
  return new Uint8Array([0x50, 0x4b, 0x03, 0x04, ...rest]);
}

describe("detectRequestDocument", () => {
  it("aceita assinatura ZIP com extensão xlsx/docx", () => {
    expect(detectRequestDocument("pedido.xlsx", zipMagic(1, 2, 3))).toBe("xlsx");
    expect(detectRequestDocument("demanda.DOCX", zipMagic(1, 2, 3))).toBe("docx");
  });

  it("rejeita extensão errada ou conteúdo não-ZIP", () => {
    expect(detectRequestDocument("pedido.pdf", zipMagic())).toBeNull();
    expect(detectRequestDocument("pedido.xlsx", new Uint8Array([0x25, 0x50, 0x44, 0x46]))).toBeNull();
  });
});

describe("extractSpreadsheetText", () => {
  it("converte abas em texto tabular", () => {
    const sheet = XLSX.utils.aoa_to_sheet([
      ["Item", "Qtd", "Unidade"],
      ["Papel A4", 10, "resma"],
      ["Caneta", 20, "un"],
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Pedidos");
    const bytes = new Uint8Array(XLSX.write(workbook, { type: "array", bookType: "xlsx" }));
    const text = extractSpreadsheetText(bytes);
    expect(text).toContain("# Aba: Pedidos");
    expect(text).toContain("Papel A4");
    expect(text).toContain("Caneta");
  });
});
