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
        id: "ata-1",
        processId: "proc-1",
        createdAt: new Date("2026-01-02"),
        number: "ARP 01/2026",
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
          id: "contract-1",
          number: "CT 01/2026",
          processId: "proc-1",
          ataId: "ata-1",
          ataItems: [{ ataItemId: "ata-item-1", quantity: 4 }],
        },
      ],
    });

    expect(sources).toHaveLength(1);
    expect(sources[0]!.label).toContain("01/2026");
    expect(sources[0]).toMatchObject({
      contractId: "contract-1",
      contractLabel: "Contrato CT 01/2026",
      ataLabel: "Ata ARP 01/2026",
    });
    expect(sources[0]!.items).toHaveLength(1);
    // Pendência da solicitação era 8; contrato libera só 4 (já recebeu 2 → resto 2).
    expect(sources[0]!.items[0]).toMatchObject({
      materialLabel: "Papel A4",
      ataQuantity: 10,
      contractQuantity: 4,
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

  it("desconta recebimentos de solicitações encerradas do mesmo processo", () => {
    const request: PurchaseRequest = {
      id: "aberta",
      councilId: "c1",
      title: "Papelaria",
      status: "aprovada",
      processId: "proc-1",
      items: [{ id: "i1", materialId: "m1", ataItemId: "ata-item-1", quantity: 5, receivedTotal: 0 }],
      events: [],
      receiptKeys: [],
      createdBy: "u1",
      createdAt: new Date("2026-01-01"),
    };
    const earlierReceipt: PurchaseRequest = {
      ...request,
      id: "encerrada",
      status: "atendida",
      items: [{ ...request.items[0]!, id: "i2", receivedTotal: 0.375 }],
    };
    const otherProcess = { ...earlierReceipt, id: "outro", processId: "proc-2" };
    const sources = (contracted: number) => buildStockEntrySources({
      requests: [request, earlierReceipt, otherProcess],
      processes: [{ process: { id: "proc-1", contractingMode: "registro_precos" } } as ProcessView],
      atas: [{ ata: { id: "ata-1", number: "ARP 01/2026", processId: "proc-1", createdAt: new Date("2026-01-02"), items: [{ id: "ata-item-1", materialId: "m1", unitPrice: 1, registeredQuantity: 1 }] } } as AtaView],
      materialLabel: {},
      contracts: [{
        id: "contract-1",
        number: "CT 01/2026",
        processId: "proc-1",
        ataId: "ata-1",
        ataItems: [{ ataItemId: "ata-item-1", quantity: contracted }],
      }],
    });
    expect(sources(0.5)).toMatchObject([{ requestId: "aberta", items: [{ pending: 0.125, suggested: 0.125 }] }]);
    expect(sources(0.375)).toEqual([]);
  });

  it("ao substituir a ata usa somente os valores e quantidades da nova ata e seu contrato", () => {
    const request = {
      id: "request-1", councilId: "c1", title: "Veículos", status: "aprovada",
      processId: "process-1", items: [{ id: "request-item", materialId: "m1", ataItemId: "old-item", quantity: 10, receivedTotal: 0 }],
      events: [], receiptKeys: [], createdBy: "u1", createdAt: new Date("2026-11-01"),
    } as PurchaseRequest;
    const process = { process: { id: "process-1", number: "01/2026", title: "Veículos", contractingMode: "registro_precos" } } as ProcessView;
    const ata = (id: string, itemId: string, quantity: number, price: number, date: string) => ({
      ata: { id, processId: "process-1", number: id, status: "vigente", createdAt: new Date(date),
        items: [{ id: itemId, materialId: "m1", registeredQuantity: quantity, unitPrice: price }] },
      validity: "vigente",
    }) as AtaView;
    const contracts = [
      { id: "old-contract", number: "CT antigo", processId: "process-1", ataId: "old-ata", ataItems: [{ ataItemId: "old-item", quantity: 10 }] },
      { id: "new-contract", number: "CT novo", processId: "process-1", ataId: "new-ata", ataItems: [{ ataItemId: "new-item", quantity: 5 }] },
    ];
    const input = { requests: [request], processes: [process], atas: [
      ata("old-ata", "old-item", 10, 100, "2026-11-01"),
      ata("new-ata", "new-item", 5, 80, "2026-11-27"),
    ], contracts, materialLabel: { m1: "Veículo" } };

    expect(buildStockEntrySources(input)).toMatchObject([{
      contractId: "new-contract", ataLabel: "Ata new-ata", contractLabel: "Contrato CT novo",
      items: [{ ataQuantity: 5, contractQuantity: 5, unitPrice: 80, pending: 5, lineTotal: 400 }],
    }]);
    expect(buildStockEntrySources({ ...input, contracts: contracts.slice(0, 1) })).toEqual([]);
  });
  it("mostra um contrato por vencedor com apenas seus itens", () => {
    const request = { id: "req", councilId: "c1", status: "aprovada", processId: "proc",
      items: [
        { id: "r1", materialId: "m1", ataItemId: null, quantity: 10, receivedTotal: 0 },
        { id: "r2", materialId: "m2", ataItemId: null, quantity: 5, receivedTotal: 0 },
      ] } as PurchaseRequest;
    const atas = [
      { ata: { id: "a1", number: "ARP-A", processId: "proc", createdAt: new Date("2026-11-01"), items: [{ id: "i1", materialId: "m1", unitPrice: 10, registeredQuantity: 10 }] } },
      { ata: { id: "a2", number: "ARP-B", processId: "proc", createdAt: new Date("2026-11-02"), items: [{ id: "i2", materialId: "m2", unitPrice: 20, registeredQuantity: 5 }] } },
    ] as AtaView[];
    const sources = buildStockEntrySources({ requests: [request], atas,
      processes: [{ process: { id: "proc", number: "1", title: "Compra", contractingMode: "registro_precos" } } as ProcessView],
      materialLabel: { m1: "Papel", m2: "Caneta" },
      contracts: [
        { id: "c1", number: "1", processId: "proc", ataId: "a1", ataItems: [{ ataItemId: "i1", quantity: 10 }] },
        { id: "c2", number: "2", processId: "proc", ataId: "a2", ataItems: [{ ataItemId: "i2", quantity: 5 }] },
      ] });
    expect(sources).toHaveLength(2);
    expect(sources.map((source) => [source.contractId, source.items.map((item) => item.materialId)])).toEqual([
      ["c1", ["m1"]], ["c2", ["m2"]],
    ]);
  });
});
