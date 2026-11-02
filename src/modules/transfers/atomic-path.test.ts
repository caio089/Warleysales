import { describe, expect, it, vi } from "vitest";
import { InMemoryAuditRepository } from "@/modules/audit/repository.memory";
import { AuditService } from "@/modules/audit/service";
import { InMemoryInventoryRepository } from "@/modules/inventory/repository.memory";
import { InventoryService } from "@/modules/inventory/service";
import { fail, ok } from "@/shared/lib/result";
import { COUNCIL_A, COUNCIL_B, makeActor, makeRuntime, managerOf } from "@/shared/testing/fixtures";
import type { TransferRepository } from "./repository";
import { InMemoryTransferRepository } from "./repository.memory";
import { TransferService } from "./service";

const MATERIAL = "33333333-3333-4333-8333-333333333333";

function setup() {
  const runtime = makeRuntime();
  const audit = new AuditService(new InMemoryAuditRepository(runtime.now));
  const inventory = new InventoryService(new InMemoryInventoryRepository(runtime.now), audit, runtime);
  const repository: TransferRepository = new InMemoryTransferRepository();
  const reserveSpy = vi.spyOn(inventory, "reserveInternal");
  return { repository, reserveSpy, service: new TransferService(repository, inventory, audit, runtime) };
}
const originManager = () => makeActor({ memberships: [{ councilId: COUNCIL_A, role: "council_manager" }] });

async function inReview(ctx: ReturnType<typeof setup>) {
  const created = await ctx.service.request(managerOf(COUNCIL_B), { originCouncilId: COUNCIL_A, destinationCouncilId: COUNCIL_B, items: [{ materialId: MATERIAL, quantity: 5 }] });
  if (!created.ok) throw new Error(created.message);
  await ctx.service.advance(originManager(), { transferId: created.data.id, to: "em_analise" });
  return created.data.id;
}

describe("TransferService — caminho transacional (RPC advance_transfer)", () => {
  it("delega o efeito de estoque ao repositório atômico (sem compensação em TypeScript)", async () => {
    const ctx = setup();
    const id = await inReview(ctx);
    const current = (await ctx.repository.findById(id))!;
    ctx.repository.advanceAtomically = vi.fn(async () => ok({ ...current, status: "aprovada" as const }));

    const result = await ctx.service.advance(originManager(), { transferId: id, to: "aprovada" });
    expect(result.ok && result.data.status).toBe("aprovada");
    expect(ctx.repository.advanceAtomically).toHaveBeenCalledWith(expect.objectContaining({ transferId: id, to: "aprovada" }));
    expect(ctx.reserveSpy).not.toHaveBeenCalled();
  });

  it("falha transacional é devolvida e o estado local não muda", async () => {
    const ctx = setup();
    const id = await inReview(ctx);
    ctx.repository.advanceAtomically = vi.fn(async () => fail("INSUFFICIENT_BALANCE", "Quantidade disponível insuficiente para reserva."));

    const result = await ctx.service.advance(originManager(), { transferId: id, to: "aprovada" });
    expect(!result.ok && result.code).toBe("INSUFFICIENT_BALANCE");
    expect((await ctx.repository.findById(id))!.status).toBe("em_analise");
  });
});
