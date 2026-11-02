import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryAuditRepository } from "@/modules/audit/repository.memory";
import { AuditService } from "@/modules/audit/service";
import { InMemoryInventoryRepository } from "@/modules/inventory/repository.memory";
import { InventoryService } from "@/modules/inventory/service";
import { COUNCIL_A, COUNCIL_B, makeRuntime, managerOf, operatorOf, viewerOf, makeActor } from "@/shared/testing/fixtures";
import { InMemoryTransferRepository } from "./repository.memory";
import { TransferService } from "./service";

const MATERIAL = "33333333-3333-4333-8333-333333333333";

function setup() {
  const runtime = makeRuntime();
  const audit = new AuditService(new InMemoryAuditRepository(runtime.now));
  const repo = new InMemoryInventoryRepository(runtime.now);
  const inventory = new InventoryService(repo, audit, runtime);
  const transfers = new TransferService(new InMemoryTransferRepository(), inventory, audit, runtime);
  return { runtime, repo, inventory, transfers };
}
type Ctx = ReturnType<typeof setup>;

// A é origem (cede), B é destino (solicita)
const originManager = () => makeActor({ memberships: [{ councilId: COUNCIL_A, role: "council_manager" }] });
const destinationManager = () => managerOf(COUNCIL_B);

async function seedStock(ctx: Ctx, quantity: number) {
  const r = await ctx.inventory.applyInternal({ councilId: COUNCIL_A, materialId: MATERIAL, type: "entry", quantity, idempotencyKey: `seed-${quantity}-${Math.random()}`, reason: "carga inicial de teste", reference: null, actorId: null });
  if (!r.ok) throw new Error(r.message);
}
async function newTransfer(ctx: Ctx, quantity = 10) {
  const r = await ctx.transfers.request(destinationManager(), { originCouncilId: COUNCIL_A, destinationCouncilId: COUNCIL_B, items: [{ materialId: MATERIAL, quantity }] });
  if (!r.ok) throw new Error(r.message);
  return r.data;
}
const advance = (ctx: Ctx, actor: ReturnType<typeof originManager>, transferId: string, to: string, extra: object = {}) =>
  ctx.transfers.advance(actor, { transferId, to, ...extra });
const stock = async (ctx: Ctx, councilId: string) => {
  const levels = await ctx.inventory.listLevels(makeActor({ isCentralAdmin: true }), councilId);
  return levels.ok ? levels.data.find((l) => l.materialId === MATERIAL) : undefined;
};

let ctx: Ctx;
beforeEach(() => { ctx = setup(); });

describe("TransferService — fluxo e estoque (R12)", () => {
  it("fluxo completo: reserva, saída, trânsito e recebimento no destino", async () => {
    await seedStock(ctx, 50);
    const t = await newTransfer(ctx, 10);
    const om = originManager();
    expect((await advance(ctx, om, t.id, "em_analise")).ok).toBe(true);
    expect((await advance(ctx, om, t.id, "aprovada")).ok).toBe(true);
    expect(await stock(ctx, COUNCIL_A)).toMatchObject({ physical: 50, reserved: 10, available: 40 });

    expect((await advance(ctx, makeActor({ memberships: [{ councilId: COUNCIL_A, role: "council_operator" }] }), t.id, "separada")).ok).toBe(true);
    expect((await advance(ctx, om, t.id, "em_transito")).ok).toBe(true);
    // Em trânsito: baixou da origem e ainda não existe no destino.
    expect(await stock(ctx, COUNCIL_A)).toMatchObject({ physical: 40, reserved: 0, available: 40 });
    expect(await stock(ctx, COUNCIL_B)).toBeUndefined();

    const received = await advance(ctx, destinationManager(), t.id, "recebida", { received: [{ materialId: MATERIAL, quantity: 10 }] });
    expect(received.ok).toBe(true);
    expect(await stock(ctx, COUNCIL_B)).toMatchObject({ physical: 10, available: 10 });
  });

  it("recebimento com divergência registra o recebido e não cria estoque a mais", async () => {
    await seedStock(ctx, 50);
    const t = await newTransfer(ctx, 10);
    const om = originManager();
    for (const to of ["em_analise", "aprovada", "separada", "em_transito"]) await advance(ctx, om, t.id, to);
    const r = await advance(ctx, destinationManager(), t.id, "recebida", { received: [{ materialId: MATERIAL, quantity: 7 }] });
    expect(r.ok && r.data.items[0]!.receivedQuantity).toBe(7);
    expect(await stock(ctx, COUNCIL_B)).toMatchObject({ physical: 7 });
  });

  it("aprovação sem saldo disponível falha e não altera o status", async () => {
    await seedStock(ctx, 5);
    const t = await newTransfer(ctx, 10);
    const om = originManager();
    await advance(ctx, om, t.id, "em_analise");
    const r = await advance(ctx, om, t.id, "aprovada");
    expect(!r.ok && r.code).toBe("INSUFFICIENT_BALANCE");
    const current = await ctx.transfers.get(om, t.id);
    expect(current.ok && current.data.status).toBe("em_analise");
  });

  it("cancelar após aprovação libera a reserva", async () => {
    await seedStock(ctx, 20);
    const t = await newTransfer(ctx, 10);
    const om = originManager();
    await advance(ctx, om, t.id, "em_analise");
    await advance(ctx, om, t.id, "aprovada");
    expect(await stock(ctx, COUNCIL_A)).toMatchObject({ reserved: 10 });
    await advance(ctx, om, t.id, "cancelada");
    expect(await stock(ctx, COUNCIL_A)).toMatchObject({ reserved: 0, available: 20 });
  });

  it("duas transferências concorrentes não reservam além do disponível", async () => {
    await seedStock(ctx, 15);
    const t1 = await newTransfer(ctx, 10);
    const t2 = await newTransfer(ctx, 10);
    const om = originManager();
    await advance(ctx, om, t1.id, "em_analise");
    await advance(ctx, om, t2.id, "em_analise");
    const [r1, r2] = await Promise.all([advance(ctx, om, t1.id, "aprovada"), advance(ctx, om, t2.id, "aprovada")]);
    expect([r1.ok, r2.ok].filter(Boolean)).toHaveLength(1);
    expect(await stock(ctx, COUNCIL_A)).toMatchObject({ reserved: 10, available: 5 });
  });

  it("transições inválidas e permissões", async () => {
    await seedStock(ctx, 20);
    const t = await newTransfer(ctx, 5);
    expect((await advance(ctx, originManager(), t.id, "recebida")).ok).toBe(false);
    expect((await advance(ctx, destinationManager(), t.id, "em_analise")).ok).toBe(false); // destino não decide
    expect((await advance(ctx, operatorOf(COUNCIL_A), t.id, "em_analise")).ok).toBe(false); // operador não aprova
    expect((await ctx.transfers.request(viewerOf(COUNCIL_B), { originCouncilId: COUNCIL_A, destinationCouncilId: COUNCIL_B, items: [{ materialId: MATERIAL, quantity: 1 }] })).ok).toBe(false);
  });

  it("valida origem diferente do destino", async () => {
    const r = await ctx.transfers.request(destinationManager(), { originCouncilId: COUNCIL_B, destinationCouncilId: COUNCIL_B, items: [{ materialId: MATERIAL, quantity: 1 }] });
    expect(!r.ok && r.code).toBe("VALIDATION");
  });

  it("conselho alheio não enxerga a transferência", async () => {
    const t = await newTransfer(ctx);
    const outsider = managerOf("44444444-4444-4444-8444-444444444444");
    expect((await ctx.transfers.get(outsider, t.id)).ok).toBe(false);
    const list = await ctx.transfers.list(outsider);
    expect(list.ok && list.data).toHaveLength(0);
  });
});
