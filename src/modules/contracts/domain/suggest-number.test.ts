import { describe, expect, it } from "vitest";
import { suggestContractNumber } from "./suggest-number";

describe("número sugerido para contrato", () => {
  it("segue a sequência do órgão no ano sem usar o número do processo ou da ata", () => {
    expect(suggestContractNumber(2026, ["CTR 002/2026"])).toBe("CTR 003/2026");
    expect(suggestContractNumber(2026, ["CTR 001/2026", "CTR 002/2026", "CTR 002/2026 (2)"])).toBe("CTR 003/2026");
    expect(suggestContractNumber(2026, ["CTR 004/2025", "CT 01/2026", "2/2026"])).toBe("CTR 003/2026");
    expect(suggestContractNumber(2027, ["CTR 002/2026"])).toBe("CTR 001/2027");
  });
});
