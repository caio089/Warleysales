import { describe, expect, it } from "vitest";
import { calculateContractAtaValue } from "./ata-value";

describe("calculateContractAtaValue", () => {
  it("soma os produtos antes de arredondar os subtotais fracionários", () => {
    expect(calculateContractAtaValue([
      { quantity: 0.5, unitPrice: 0.01 },
      { quantity: 0.5, unitPrice: 0.01 },
    ])).toBe(0.01);
  });

  it("arredonda meio centavo no total e mantém o padrão de preço ausente", () => {
    expect(calculateContractAtaValue([{ quantity: 0.125, unitPrice: 8.04 }, { quantity: 2 }])).toBe(1.01);
  });
});
