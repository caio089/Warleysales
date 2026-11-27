import { describe, expect, it } from "vitest";
import { suggestContractNumber } from "./suggest-number";

describe("número sugerido para contrato", () => {
  it("não repete um número usado por outra ata do órgão", () => {
    expect(suggestContractNumber("002/2026", ["CTR 002/2026"])).toBe("CTR 002/2026 (2)");
    expect(suggestContractNumber("002/2026", ["CTR 002/2026", "CTR 002/2026 (2)"])).toBe("CTR 002/2026 (3)");
    expect(suggestContractNumber("003/2026", ["CTR 002/2026"])).toBe("CTR 003/2026");
  });
});
