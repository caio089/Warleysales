import { describe, expect, it } from "vitest";
import { parseExtractedPurchaseRequest } from "./request-extraction";

const valid = {
  title: "Material de escritório — CRQ",
  estimatedValue: 1500.5,
  items: [
    { description: "Papel A4", quantity: 10, unit: "resma" },
    { description: "Caneta azul", quantity: 50, unit: "un" },
  ],
};

describe("parseExtractedPurchaseRequest", () => {
  it("aceita JSON válido e campos nulos", () => {
    const parsed = parseExtractedPurchaseRequest(JSON.stringify({ ...valid, estimatedValue: null, title: null }));
    expect(parsed?.title).toBeNull();
    expect(parsed?.estimatedValue).toBeNull();
    expect(parsed?.items[0]).toMatchObject({ description: "Papel A4", quantity: 10, unit: "resma" });
  });

  it("aceita bloco markdown com json", () => {
    const wrapped = "```json\n" + JSON.stringify(valid) + "\n```";
    expect(parseExtractedPurchaseRequest(wrapped)?.title).toBe(valid.title);
  });

  it("rejeita itens sem descrição ou quantidade inválida", () => {
    expect(parseExtractedPurchaseRequest(JSON.stringify({ ...valid, items: [] }))).toBeNull();
    expect(parseExtractedPurchaseRequest(JSON.stringify({
      ...valid,
      items: [{ description: "X", quantity: 0, unit: "un" }],
    }))).toBeNull();
    expect(parseExtractedPurchaseRequest(JSON.stringify({
      ...valid,
      estimatedValue: "R$ 10",
    }))).toBeNull();
  });
});
