import { describe, expect, it } from "vitest";
import { isProcessContractingMode, needsAta } from "./contracting-mode";

describe("contracting-mode", () => {
  it("reconhece os modos válidos", () => {
    expect(isProcessContractingMode("registro_precos")).toBe(true);
    expect(isProcessContractingMode("contrato")).toBe(true);
    expect(isProcessContractingMode("outra")).toBe(false);
  });

  it("exige ata salvo quando o modo é somente contrato", () => {
    expect(needsAta("registro_precos")).toBe(true);
    expect(needsAta(null)).toBe(true);
    expect(needsAta("contrato")).toBe(false);
  });
});
