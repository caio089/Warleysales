import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryAuditRepository } from "@/modules/audit/repository.memory";
import { AuditService } from "@/modules/audit/service";
import { COUNCIL_A, COUNCIL_B, makeRuntime, managerOf, operatorOf } from "@/shared/testing/fixtures";
import { InMemoryAtaRepository } from "./repository.memory";
import { AtaService } from "./service";

function setup() {
  const runtime = makeRuntime("2026-11-02T12:00:00Z");
  const audit = new AuditService(new InMemoryAuditRepository(runtime.now));
  return { runtime, service: new AtaService(new InMemoryAtaRepository(), audit, runtime) };
}
let ctx: ReturnType<typeof setup>;
const manager = () => managerOf(COUNCIL_A);

async function activeAta(quantity = 100) {
  const created = await ctx.service.create(manager(), { councilId: COUNCIL_A, number: "05/2026", startDate: "2026-11-01", items: [{ description: "Papel A4", registeredQuantity: quantity, unitPrice: 25.9 }] });
  if (!created.ok) throw new Error(created.message);
  const activated = await ctx.service.activate(manager(), { ataId: created.data.id });
  if (!activated.ok) throw new Error(activated.message);
  return activated.data;
}
beforeEach(() => { ctx = setup(); });

describe("AtaService — saldo (R9)", () => {
  it("rascunho não consome nem aceita comprometimento", async () => {
    const created = await ctx.service.create(manager(), { councilId: COUNCIL_A, number: "06/2026", startDate: "2026-11-01", items: [{ description: "Caneta", registeredQuantity: 10, unitPrice: 1 }] });
    if (!created.ok) throw new Error();
    const r = await ctx.service.commitInternal({ itemId: created.data.items[0]!.id, councilId: COUNCIL_A, quantity: 1, reference: "req-1" });
    expect(!r.ok && r.code).toBe("INVALID_STATE");
    const view = await ctx.service.get(manager(), created.data.id);
    expect(view.ok && view.data.items[0]!.balance.balance).toBe(10);
  });
  it("compromete até o limite e bloqueia o excesso, mesmo concorrente", async () => {
    const ata = await activeAta(100);
    const itemId = ata.items[0]!.id;
    const results = await Promise.all([60, 60].map((q, i) => ctx.service.commitInternal({ itemId, councilId: COUNCIL_A, quantity: q, reference: `req-${i}` })));
    expect(results.filter((r) => r.ok)).toHaveLength(1);
    const view = await ctx.service.get(manager(), ata.id);
    expect(view.ok && view.data.items[0]!.balance).toMatchObject({ committed: 60, balance: 40 });
  });
  it("liberação devolve saldo mas não além do comprometido", async () => {
    const ata = await activeAta(100);
    const itemId = ata.items[0]!.id;
    await ctx.service.commitInternal({ itemId, councilId: COUNCIL_A, quantity: 30, reference: "r1" });
    expect((await ctx.service.releaseInternal({ itemId, councilId: COUNCIL_A, quantity: 40, reason: "x" })).ok).toBe(false);
    const rel = await ctx.service.releaseInternal({ itemId, councilId: COUNCIL_A, quantity: 30, reason: "cancelamento" });
    expect(rel.ok && rel.data.balance).toBe(100);
  });
  it("alocação opcional limita o conselho alocado e não afeta os demais (P5)", async () => {
    const ata = await activeAta(100);
    const item = ata.items[0]!;
    await ctx.service.setAllocations(manager(), { ataId: ata.id, itemId: item.id, allocations: [{ councilId: COUNCIL_B, quantity: 20 }] });
    expect((await ctx.service.commitInternal({ itemId: item.id, councilId: COUNCIL_B, quantity: 21, reference: "r" })).ok).toBe(false);
    expect((await ctx.service.commitInternal({ itemId: item.id, councilId: COUNCIL_A, quantity: 50, reference: "r" })).ok).toBe(true);
  });
  it("soma de alocações acima do registrado é rejeitada", async () => {
    const ata = await activeAta(10);
    const r = await ctx.service.setAllocations(manager(), { ataId: ata.id, itemId: ata.items[0]!.id, allocations: [{ councilId: COUNCIL_A, quantity: 6 }, { councilId: COUNCIL_B, quantity: 6 }] });
    expect(r.ok).toBe(false);
  });
});

describe("AtaService — vigência (R10) e permissões", () => {
  it("prorroga uma única vez, por gestor, com auditoria", async () => {
    const ata = await activeAta();
    const first = await ctx.service.extend(manager(), { ataId: ata.id });
    expect(first.ok && first.data.extensions).toHaveLength(1);
    const second = await ctx.service.extend(manager(), { ataId: ata.id });
    expect(!second.ok && second.code).toBe("INVALID_STATE");
  });
  it("ata vencida não aceita comprometimento nem prorrogação", async () => {
    const ata = await activeAta();
    ctx.runtime.advanceDays(366 + 1);
    expect((await ctx.service.commitInternal({ itemId: ata.items[0]!.id, councilId: COUNCIL_A, quantity: 1, reference: "r" })).ok).toBe(false);
    expect((await ctx.service.extend(manager(), { ataId: ata.id })).ok).toBe(false);
  });
  it("operador não gerencia atas; outro conselho não vê a ata", async () => {
    expect((await ctx.service.create(operatorOf(COUNCIL_A), { councilId: COUNCIL_A, number: "1", startDate: "2026-11-01", items: [{ description: "x1", registeredQuantity: 1, unitPrice: 1 }] })).ok).toBe(false);
    const ata = await activeAta();
    expect((await ctx.service.get(managerOf(COUNCIL_B), ata.id)).ok).toBe(false);
  });
  it("validação Zod de data e itens", async () => {
    const r = await ctx.service.create(manager(), { councilId: COUNCIL_A, number: "1", startDate: "01/11/2026", items: [] });
    expect(!r.ok && r.code).toBe("VALIDATION");
  });
});
