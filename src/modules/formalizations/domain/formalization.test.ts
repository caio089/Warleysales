import { describe, expect, it } from "vitest";
import {
  calculateSavings,
  submitFormalizationSchema,
  homologateFormalizationSchema,
  rejectFormalizationSchema,
} from "./formalization";

describe("Formalização — cálculo de economia (calculateSavings)", () => {
  it("calcula economia positiva quando contratado < estimado", () => {
    const res = calculateSavings(1000, 850);
    expect(res.savingsValue).toBe(150);
    expect(res.savingsPercent).toBe(15);
  });

  it("calcula economia percentual com 2 casas decimais", () => {
    const res = calculateSavings(300, 200);
    // 100 / 300 = 33.3333... -> 33.33%
    expect(res.savingsValue).toBe(100);
    expect(res.savingsPercent).toBe(33.33);
  });

  it("calcula zero quando estimado é zero", () => {
    const res = calculateSavings(0, 0);
    expect(res.savingsValue).toBe(0);
    expect(res.savingsPercent).toBe(0);
  });

  it("calcula valor negativo quando contratado > estimado (estouro)", () => {
    const res = calculateSavings(100, 120);
    expect(res.savingsValue).toBe(-20);
    expect(res.savingsPercent).toBe(-20);
  });

  it("calcula zero de economia quando contratado == estimado", () => {
    const res = calculateSavings(500, 500);
    expect(res.savingsValue).toBe(0);
    expect(res.savingsPercent).toBe(0);
  });
});

describe("Formalização — validação de schemas", () => {
  const validUuid = "11111111-1111-4111-8111-111111111111";

  it("valida submissão com campos válidos", () => {
    const valid = submitFormalizationSchema.safeParse({
      processId: validUuid,
      requestId: validUuid,
      councilId: validUuid,
      supplierId: validUuid,
      instrumentType: "ata",
      instrumentNumber: "ATA-001/2026",
      estimatedValue: 10000,
      contractedValue: 8500,
    });
    expect(valid.success).toBe(true);
  });

  it("rejeita tipo de instrumento inválido", () => {
    const invalid = submitFormalizationSchema.safeParse({
      processId: validUuid,
      councilId: validUuid,
      supplierId: validUuid,
      instrumentType: "outro",
      instrumentNumber: "123",
      estimatedValue: 100,
      contractedValue: 100,
    });
    expect(invalid.success).toBe(false);
  });

  it("rejeita valores negativos", () => {
    const invalid = submitFormalizationSchema.safeParse({
      processId: validUuid,
      councilId: validUuid,
      supplierId: validUuid,
      instrumentType: "contrato",
      instrumentNumber: "123",
      estimatedValue: -1,
      contractedValue: 100,
    });
    expect(invalid.success).toBe(false);
  });

  it("valida homologação e rejeição", () => {
    expect(homologateFormalizationSchema.safeParse({ processId: validUuid }).success).toBe(true);
    expect(rejectFormalizationSchema.safeParse({ processId: validUuid, note: "" }).success).toBe(false);
    expect(rejectFormalizationSchema.safeParse({ processId: validUuid, note: "Documento ilegível" }).success).toBe(true);
  });
});
