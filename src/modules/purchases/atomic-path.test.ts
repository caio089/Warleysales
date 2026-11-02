import { describe, expect, it, vi } from "vitest";
import { InMemoryAtaRepository } from "@/modules/atas/repository.memory";
import { AtaService } from "@/modules/atas/service";
import { InMemoryAuditRepository } from "@/modules/audit/repository.memory";
import { AuditService } from "@/modules/audit/service";
import { InMemoryInventoryRepository } from "@/modules/inventory/repository.memory";
import { InventoryService } from "@/modules/inventory/service";
import { fail, ok } from "@/shared/lib/result";
import { COUNCIL_A, makeRuntime, managerOf, operatorOf } from "@/shared/testing/fixtures";
import type { PurchaseRequestRepository } from "./repository";
import { InMemoryPurchaseRequestRepository } from "./repository.memory";
import { PurchaseRequestService } from "./service";

const MATERIAL = "33333333-3333-4333-8333-333333333333";

/** Garante que, com o repositório transacional disponível, o serviço NÃO usa a compensação em TypeScript. */
function setup() {
  const runtime = makeRuntime();
  const audit = new AuditService(new InMemoryAuditRepository(runtime.now));
  const atas = new AtaService(new InMemoryAtaRepository(), audit, runtime);
  const inventory = new InventoryService(new InMemoryInventoryRepository(runtime.now), audit, runtime);
  const repository: PurchaseRequestRepository = new InMemoryPurchaseRequestRepository();
  const commitSpy = vi.spyOn(atas, "commitInternal");
  return { runtime, atas, repository, commitSpy, service: new PurchaseRequestService(repository, atas, inventory, audit, runtime) };
}

async function requestInReview(ctx: ReturnType<typeof setup>) {
  const manager = managerOf(COUNCIL_A);
  const ata = await ctx.atas.create(manager, { councilId: COUNCIL_A, number: "01/2026", startDate: "2026-11-01", items: [{ description: "Papel", registeredQuantity: 10, unitPrice: 1 }] });
  if (!ata.ok) throw new Error(ata.message);
  await ctx.atas.activate(manager, { ataId: ata.data.id });
  const created = await ctx.service.create(operatorOf(COUNCIL_A), { councilId: COUNCIL_A, title: "Material de expediente", items: [{ materialId: MATERIAL, quantity: 4, ataItemId: ata.data.items[0]!.id }] });
  if (!created.ok) throw new Error(created.message);
  await ctx.service.submit(operatorOf(COUNCIL_A), { requestId: created.data.id });
  await ctx.service.startReview(manager, { requestId: created.data.id });
  return created.data.id;
}

describe("PurchaseRequestService — caminho transacional (RPC)", () => {
  it("aprovar delega tudo ao repositório atômico e não compromete a ata em TypeScript", async () => {
    const ctx = setup();
    const id = await requestInReview(ctx);
    const current = (await ctx.repository.findById(id))!;
    ctx.repository.approveAtomically = vi.fn(async () => ok({ ...current, status: "aprovada" as const }));

    const result = await ctx.service.approve(managerOf(COUNCIL_A), { requestId: id });
    expect(result.ok && result.data.status).toBe("aprovada");
    expect(ctx.repository.approveAtomically).toHaveBeenCalledOnce();
    expect(ctx.commitSpy).not.toHaveBeenCalled();
  });

  it("falha do banco (saldo insuficiente) é propagada sem auditar sucesso", async () => {
    const ctx = setup();
    const id = await requestInReview(ctx);
    ctx.repository.approveAtomically = vi.fn(async () => fail("INSUFFICIENT_BALANCE", "Quantidade excede o saldo da ata (disponível: 1)."));

    const result = await ctx.service.approve(managerOf(COUNCIL_A), { requestId: id });
    expect(!result.ok && result.code).toBe("INSUFFICIENT_BALANCE");
    expect((await ctx.repository.findById(id))!.status).toBe("em_analise");
  });

  it("cancelar delega ao repositório atômico", async () => {
    const ctx = setup();
    const id = await requestInReview(ctx);
    const current = (await ctx.repository.findById(id))!;
    ctx.repository.cancelAtomically = vi.fn(async () => ok({ ...current, status: "cancelada" as const }));

    const result = await ctx.service.cancel(managerOf(COUNCIL_A), { requestId: id });
    expect(result.ok && result.data.status).toBe("cancelada");
    expect(ctx.repository.cancelAtomically).toHaveBeenCalledOnce();
  });
});
