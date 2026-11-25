import { describe, expect, it } from "vitest";
import { sumPriceResearchLines } from "./price-research";

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
