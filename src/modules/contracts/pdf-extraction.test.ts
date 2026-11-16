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

  it("rejeita datas ou valores incompatíveis sem preencher o cadastro", () => {
    expect(parseExtractedContract(JSON.stringify({ ...valid, endDate: "31/12/2026" }))).toBeNull();
    expect(parseExtractedContract(JSON.stringify({ ...valid, value: "R$ 1.234,56" }))).toBeNull();
  });
});
