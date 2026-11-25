import { describe, expect, it } from "vitest";
import { parseExtractedAta } from "./pdf-extraction";

const valid = {
  supplierName: "Fornecedor Alfa Ltda",
  supplierCnpj: "12.345.678/0001-00",
  number: "ARP 01/2026",
  startDate: "2026-01-01",
  endDate: "2026-12-31",
  totalValue: null,
  items: [
    { description: "Papel A4", quantity: 10, unitPrice: 12.5, lineTotal: null },
    { description: "Caneta", quantity: 20, unitPrice: 1.5, lineTotal: null },
  ],
};

describe("parseExtractedAta", () => {
  it("calcula totais por item e total geral quando a IA omite as somas", () => {
    const parsed = parseExtractedAta(JSON.stringify(valid));
    expect(parsed?.items[0]?.lineTotal).toBe(125);
    expect(parsed?.items[1]?.lineTotal).toBe(30);
    expect(parsed?.totalValue).toBe(155);
  });

  it("rejeita datas inválidas", () => {
    expect(parseExtractedAta(JSON.stringify({ ...valid, startDate: "01/01/2026" }))).toBeNull();
  });
});
