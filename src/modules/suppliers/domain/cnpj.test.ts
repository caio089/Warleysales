import { describe, expect, it } from "vitest";
import { formatCnpj, isValidCnpj, onlyDigits } from "./cnpj";

describe("CNPJ", () => {
  it("valida CNPJs reais e rejeita inválidos", () => {
    expect(isValidCnpj("11.222.333/0001-81")).toBe(true);
    expect(isValidCnpj("11222333000181")).toBe(true);
    expect(isValidCnpj("11.222.333/0001-82")).toBe(false);
    expect(isValidCnpj("00000000000000")).toBe(false);
    expect(isValidCnpj("123")).toBe(false);
  });
  it("normaliza e formata", () => {
    expect(onlyDigits("11.222.333/0001-81")).toBe("11222333000181");
    expect(formatCnpj("11222333000181")).toBe("11.222.333/0001-81");
  });
});
