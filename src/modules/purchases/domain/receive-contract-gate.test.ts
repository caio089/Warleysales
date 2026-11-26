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

  it("não aceita contrato sem vínculo com o processo", () => {
    const result = assertContractAllowsReceive({
      processId: "p1",
      contractingMode: "contrato",
      requestItems: [{ id: "r1", ataItemId: null, quantity: 1, receivedTotal: 0 }],
      contracts: [{ processId: null, ataId: null, ataItems: [] }],
    });
    expect(result.ok).toBe(false);
    expect(contractedQuantityByAtaItem([{ processId: null, ataId: "a1", ataItems: [{ ataItemId: "i1", quantity: 4 }] }], "p1").size).toBe(0);
  });

  it("soma linhas e recebimentos anteriores de outras solicitações no teto do contrato", () => {
    const result = assertReceiveLinesWithinContract({
      items: [
        { id: "r1", ataItemId: "i1", quantity: 10, receivedTotal: 0 },
        { id: "r2", ataItemId: "i1", quantity: 10, receivedTotal: 0 },
      ],
      lines: [{ itemId: "r1", received: 2 }, { itemId: "r2", received: 2 }],
      contractedByAtaItem: new Map([["i1", 5]]),
      receivedByAtaItem: new Map([["i1", 2]]),
    });
    expect(result.ok).toBe(false);
  });

  it("aceita duas linhas do mesmo item de ata quando o total cabe no contrato", () => {
    const result = assertReceiveLinesWithinContract({
      items: [
        { id: "r1", ataItemId: "i1", quantity: 10, receivedTotal: 0 },
        { id: "r2", ataItemId: "i1", quantity: 10, receivedTotal: 0 },
      ],
      lines: [{ itemId: "r1", received: 1 }, { itemId: "r2", received: 2 }],
      contractedByAtaItem: new Map([["i1", 5]]),
      receivedByAtaItem: new Map([["i1", 2]]),
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
