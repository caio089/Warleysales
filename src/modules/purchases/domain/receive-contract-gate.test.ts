import { describe, expect, it } from "vitest";
import {
  assertContractAllowsReceive,
  assertReceiveLinesWithinContract,
  contractedQuantityByAtaItem,
  maxReceivableAgainstContract,
} from "./receive-contract-gate";

describe("receive-contract-gate", () => {
  it("soma quantidades de vários contratos por item da ata", () => {
    const map = contractedQuantityByAtaItem(
      [
        { processId: "p1", ataId: "a1", ataItems: [{ ataItemId: "i1", quantity: 3 }] },
        { processId: "p1", ataId: "a1", ataItems: [{ ataItemId: "i1", quantity: 2 }, { ataItemId: "i2", quantity: 1 }] },
      ],
      "p1",
    );
    expect(map.get("i1")).toBe(5);
    expect(map.get("i2")).toBe(1);
  });

  it("bloqueia registro de preços sem contrato da ata", () => {
    const result = assertContractAllowsReceive({
      processId: "p1",
      contractingMode: "registro_precos",
      requestItems: [{ id: "r1", ataItemId: "i1", quantity: 5, receivedTotal: 0 }],
      contracts: [],
    });
    expect(!result.ok && result.code).toBe("INVALID_STATE");
  });

  it("libera quando há contrato com quantidade do item", () => {
    const result = assertContractAllowsReceive({
      processId: "p1",
      contractingMode: "registro_precos",
      requestItems: [{ id: "r1", ataItemId: "i1", quantity: 5, receivedTotal: 0 }],
      contracts: [{ processId: "p1", ataId: "a1", ataItems: [{ ataItemId: "i1", quantity: 2 }] }],
    });
    expect(result.ok).toBe(true);
  });

  it("limita recebimento ao contratado", () => {
    const item = { id: "r1", ataItemId: "i1", quantity: 10, receivedTotal: 1 };
    const map = new Map([["i1", 4]]);
    expect(maxReceivableAgainstContract(item, map)).toBe(3);
    const over = assertReceiveLinesWithinContract({
      items: [item],
      lines: [{ itemId: "r1", received: 4 }],
      contractedByAtaItem: map,
    });
    expect(over.ok).toBe(false);
    const okLine = assertReceiveLinesWithinContract({
      items: [item],
      lines: [{ itemId: "r1", received: 3 }],
      contractedByAtaItem: map,
    });
    expect(okLine.ok).toBe(true);
  });
});
