import { describe, expect, it } from "vitest";
import { COUNCIL_A, COUNCIL_B, makeActor, managerOf, viewerOf } from "@/shared/testing/fixtures";
import { InMemoryTransferRepository } from "./repository.memory";
import { TransferService } from "./service";

async function setup() {
  const repository = new InMemoryTransferRepository();
  const transfer = await repository.insert({
    id: "historical-transfer",
    originCouncilId: COUNCIL_A,
    destinationCouncilId: COUNCIL_B,
    status: "recebida",
    createdAt: new Date("2026-01-01"),
    items: [{ materialId: "historical-material", quantity: 10, receivedQuantity: 7 }],
    events: [],
  });

  return { service: new TransferService(repository), transfer };
}

describe("TransferService — histórico", () => {
  it("preserva o detalhe para origem e destino e a listagem para administrador", async () => {
    const { service, transfer } = await setup();

    expect(await service.get(managerOf(COUNCIL_A), transfer.id)).toEqual({ ok: true, data: transfer });
    expect(await service.get(viewerOf(COUNCIL_B), transfer.id)).toEqual({ ok: true, data: transfer });
    expect(await service.list(makeActor({ isCentralAdmin: true }))).toEqual({ ok: true, data: [transfer] });
  });

  it("não expõe transferências a um órgão que não participou", async () => {
    const { service, transfer } = await setup();
    const actor = managerOf("33333333-3333-4333-8333-333333333333");

    expect(await service.list(actor)).toEqual({ ok: true, data: [] });
    expect(await service.get(actor, transfer.id)).toMatchObject({ ok: false, code: "NOT_FOUND" });
  });
});
