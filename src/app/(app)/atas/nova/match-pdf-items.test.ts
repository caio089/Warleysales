import { describe, expect, it } from "vitest";
import { matchPdfItems } from "./match-pdf-items";

describe("matchPdfItems", () => {
  it("associa pela descrição mesmo em ordem diferente", () => {
    expect(matchPdfItems([["Resina"], ["Luva de procedimento"]], ["Luva de procedimento", "Resina"]))
      .toEqual([1, 0]);
  });

  it("não associa descrições ausentes ou ambíguas", () => {
    expect(matchPdfItems([["Resina"], ["Luva"]], ["Resina", "Resina"]))
      .toEqual([null, null]);
    expect(matchPdfItems([["Resina"], ["Luva"]], [null, "Outro item"]))
      .toEqual([null, null]);
  });
});
