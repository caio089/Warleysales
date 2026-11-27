import { describe, expect, it } from "vitest";
import { priceResearchLineTotal, sumPriceResearchLines } from "./price-research";

describe("priceResearchLineTotal", () => {
  it("multiplica o valor unitário pela quantidade e arredonda o subtotal", () => {
    expect(priceResearchLineTotal(1234.5, 10)).toBe(12345);
    expect(priceResearchLineTotal(2.35, 3)).toBe(7.05);
  });
});

describe("sumPriceResearchLines", () => {
  it("soma os valores de referência dos itens com 2 casas", () => {
    expect(
      sumPriceResearchLines([
        { lineTotal: 10.1 },
        { lineTotal: 20.2 },
        { lineTotal: 0.05 },
      ]),
    ).toBe(30.35);
  });

  it("trata lista vazia como zero", () => {
    expect(sumPriceResearchLines([])).toBe(0);
  });
});
