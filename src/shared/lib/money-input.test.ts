import { describe, expect, it } from "vitest";
import {
  formatCurrencyDraft,
  normalizeCurrencyDecimal,
  parseCurrencyInput,
  updateCurrencyDraft,
} from "./money-input";

describe("normalizeCurrencyDecimal", () => {
  it("mantém vírgula de centavos e milhar com ponto", () => {
    expect(normalizeCurrencyDecimal("10.000,50")).toBe("10.000,50");
    expect(normalizeCurrencyDecimal("10.000")).toBe("10.000");
  });

  it("trata o último ponto como centavos após milhar", () => {
    expect(normalizeCurrencyDecimal("10.000.")).toBe("10.000,");
    expect(normalizeCurrencyDecimal("10.000.5")).toBe("10.000,5");
    expect(normalizeCurrencyDecimal("10.000.50")).toBe("10.000,50");
    expect(normalizeCurrencyDecimal("1.250.000.99")).toBe("1.250.000,99");
  });

  it("trata ponto único sem milhar como centavos", () => {
    expect(normalizeCurrencyDecimal("12.5")).toBe("12,5");
    expect(normalizeCurrencyDecimal("12.50")).toBe("12,50");
    expect(normalizeCurrencyDecimal("0.99")).toBe("0,99");
  });
});

describe("parseCurrencyInput", () => {
  it("aceita milhar com ponto e centavos com vírgula ou ponto", () => {
    expect(parseCurrencyInput("10.000,50")).toBe("10000.50");
    expect(parseCurrencyInput("10.000.50")).toBe("10000.50");
    expect(parseCurrencyInput("R$ 1.250.000,99")).toBe("1250000.99");
    expect(parseCurrencyInput("12.50")).toBe("12.50");
  });
});

describe("updateCurrencyDraft", () => {
  it("ao digitar ponto depois do milhar, abre os centavos com vírgula", () => {
    const next = updateCurrencyDraft("10000", "10.000.", 7, "insertText");
    expect(next).toEqual({ value: "10000.", display: "10.000,", caret: 7 });
  });

  it("aceita ponto como centavos em valores sem milhar", () => {
    const next = updateCurrencyDraft("12", "12.5", 4, "insertText");
    expect(next).toEqual({ value: "12.5", display: "12,5", caret: 4 });
  });

  it("formata milhar e centavos juntos", () => {
    expect(formatCurrencyDraft("10000.50")).toBe("10.000,50");
  });
});
