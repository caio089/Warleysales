import { describe, expect, it } from "vitest";
import { parseExtractedContract } from "./pdf-extraction";

const valid = {
  supplierName: "Empresa Exemplo Ltda",
  supplierCnpj: "12.345.678/0001-00",
  number: "24/2026",
  object: "Aquisição de materiais",
  startDate: "2026-01-01",
  endDate: "2026-12-31",
  value: 1234.56,
};

describe("parseExtractedContract", () => {
  it("aceita JSON e campos ausentes marcados como nulos", () => {
    expect(parseExtractedContract(JSON.stringify({ ...valid, value: null }))).toMatchObject({ value: null, number: "24/2026" });
  });

  it("soma itens quando o valor global vem nulo", () => {
    const parsed = parseExtractedContract(
      JSON.stringify({
        ...valid,
        value: null,
        items: [
          { description: "Papel", quantity: 10, unitPrice: 2, lineTotal: null },
          { description: "Caneta", quantity: 5, unitPrice: 1, lineTotal: null },
        ],
      }),
    );
    expect(parsed?.value).toBe(25);
    expect(parsed?.items[0]?.lineTotal).toBe(20);
  });

  it("rejeita datas ou valores incompatíveis sem preencher o cadastro", () => {
    expect(parseExtractedContract(JSON.stringify({ ...valid, endDate: "31/12/2026" }))).toBeNull();
    expect(parseExtractedContract(JSON.stringify({ ...valid, value: "R$ 1.234,56" }))).toBeNull();
  });
});
