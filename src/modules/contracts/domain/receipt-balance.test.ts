import { describe, expect, it } from "vitest";
import { contractReceiptBalance } from "./receipt-balance";

describe("contractReceiptBalance", () => {
  it("separa recebimentos por contrato e por item da ata", () => {
    const items = [
      { id: "a", ataItemId: "item-1", quantity: 10, unitPrice: 5 },
      { id: "b", ataItemId: "item-2", quantity: 5, unitPrice: 8 },
    ];
    const balance = contractReceiptBalance("contract-1", items, [
      { contractId: "contract-1", ataItemId: "item-1", quantity: 4 },
      { contractId: "contract-2", ataItemId: "item-1", quantity: 3 },
      { contractId: "contract-1", ataItemId: "item-2", quantity: 2 },
    ]);
    expect(balance).toMatchObject({ registered: true, contracted: 15, received: 6, remaining: 9 });
    expect(balance.rows.map((row) => row.remaining)).toEqual([6, 3]);
  });
});
