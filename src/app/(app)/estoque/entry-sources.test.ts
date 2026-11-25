import { describe, expect, it } from "vitest";
import type { AtaView } from "@/modules/atas/service";
import type { PurchaseRequest } from "@/modules/purchases/schemas";
import type { ProcessView } from "@/modules/processes/service";
import { buildStockEntrySources } from "./entry-sources";

describe("buildStockEntrySources", () => {
  it("puxa itens pendentes do processo com valores", () => {
    const request: PurchaseRequest = {
      id: "req-1",
      councilId: "c1",
      title: "Papelaria",
      status: "aprovada",
      processId: "proc-1",
      estimatedValue: 1000,
      items: [
        { id: "i1", materialId: "m1", quantity: 10, ataItemId: "ata-item-1", receivedTotal: 2 },
        { id: "i2", materialId: "m2", quantity: 5, ataItemId: null, receivedTotal: 5 },
      ],
      events: [],
      receiptKeys: [],
      createdBy: "u1",
      createdAt: new Date("2026-01-01"),
    };
    const process = {
      process: {
        id: "proc-1",
        councilId: "c1",
        number: "01/2026",
        title: "Aquisição de papel",
        estimatedValue: 1000,
      },
    } as unknown as ProcessView;
    const ata = {
      ata: {
        items: [{ id: "ata-item-1", unitPrice: 12.5, registeredQuantity: 10, description: "A4", materialId: "m1", allocations: [] }],
      },
      endDate: "2027-01-01",
      validity: "vigente",
      items: [],
    } as unknown as AtaView;

    const withoutContract = buildStockEntrySources({
      requests: [request],
      processes: [process],
      atas: [ata],
      materialLabel: { m1: "Papel A4", m2: "Caneta" },
      contracts: [],
    });
    expect(withoutContract).toEqual([]);

    const sources = buildStockEntrySources({
      requests: [request],
      processes: [process],
      atas: [ata],
      materialLabel: { m1: "Papel A4", m2: "Caneta" },
      contracts: [
        {
          processId: "proc-1",
          ataId: "ata-1",
          ataItems: [{ ataItemId: "ata-item-1", quantity: 4 }],
        },
      ],
    });

    expect(sources).toHaveLength(1);
    expect(sources[0]!.label).toContain("01/2026");
    expect(sources[0]!.items).toHaveLength(1);
    // Pendência da solicitação era 8; contrato libera só 4 (já recebeu 2 → resto 2).
    expect(sources[0]!.items[0]).toMatchObject({
      materialLabel: "Papel A4",
      pending: 2,
      unitPrice: 12.5,
      lineTotal: 25,
    });
  });

  it("ignora solicitações sem saldo a receber", () => {
    const request: PurchaseRequest = {
      id: "req-2",
      councilId: "c1",
      title: "Ok",
      status: "aprovada",
      processId: "proc-2",
      estimatedValue: 10,
      items: [{ id: "i1", materialId: "m1", quantity: 2, ataItemId: null, receivedTotal: 2 }],
      events: [],
      receiptKeys: [],
      createdBy: "u1",
      createdAt: new Date("2026-01-01"),
    };
    expect(
      buildStockEntrySources({
        requests: [request],
        processes: [{ process: { id: "proc-2", councilId: "c1", number: "02/2026", title: "X" } } as unknown as ProcessView],
        atas: [],
        materialLabel: { m1: "Item" },
      }),
    ).toEqual([]);
  });
});
