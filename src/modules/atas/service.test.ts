import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryAuditRepository } from "@/modules/audit/repository.memory";
import { AuditService } from "@/modules/audit/service";
import { COUNCIL_A, COUNCIL_B, makeRuntime, managerOf, operatorOf } from "@/shared/testing/fixtures";
import { InMemoryAtaRepository } from "./repository.memory";
import { AtaService } from "./service";

function setup() {
  const runtime = makeRuntime("2026-11-02T12:00:00Z");
  const audit = new AuditService(new InMemoryAuditRepository(runtime.now));
  const repository = new InMemoryAtaRepository();
  return { runtime, repository, service: new AtaService(repository, audit, runtime) };
}
let ctx: ReturnType<typeof setup>;
const manager = () => managerOf(COUNCIL_A);

async function activeAta(quantity = 100) {
  const created = await ctx.service.create(manager(), { councilId: COUNCIL_A, number: "05/2026", startDate: "2026-11-01", items: [{ description: "Papel A4", registeredQuantity: quantity, unitPrice: 25.9 }] });
  if (!created.ok) throw new Error(created.message);
  expect(created.data.status).toBe("vigente");
  return created.data;
}
beforeEach(() => { ctx = setup(); });

describe("AtaService — saldo (R9)", () => {
  it("permite atas de vencedores diferentes com itens distintos no mesmo processo", async () => {
    const processId = "11111111-1111-4111-8111-111111111111";
    const service = new AtaService(ctx.repository, new AuditService(new InMemoryAuditRepository(ctx.runtime.now)), ctx.runtime, {
      findById: async () => ({ id: processId, councilId: COUNCIL_A }),
    } as never);
    const first = await service.create(manager(), { processId, councilId: COUNCIL_A, number: "ARP-A", supplierId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", startDate: "2026-11-01",
      items: [{ description: "Papel", materialId: "11111111-1111-4111-8111-111111111112", registeredQuantity: 10, unitPrice: 5 }] });
    expect(first.ok).toBe(true);
    const base = { processId, councilId: COUNCIL_A, number: "ARP-B", supplierId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", additionalWinner: true, startDate: "2026-11-01" };
    expect(await service.create(manager(), { ...base, items: [{ description: "Caneta", materialId: "22222222-2222-4222-8222-222222222222", registeredQuantity: 5, unitPrice: 2 }] })).toMatchObject({ ok: true });
    expect(await service.create(manager(), { ...base, number: "ARP-C", items: [{ description: "Papel", materialId: "11111111-1111-4111-8111-111111111112", registeredQuantity: 1, unitPrice: 5 }] })).toMatchObject({ code: "VALIDATION" });
  });
  it("exige e audita a justificativa da nova ata para o mesmo processo", async () => {
    const processId = "11111111-1111-4111-8111-111111111111";
    const { runtime, repository } = ctx;
    const audit = new InMemoryAuditRepository(runtime.now);
    const service = new AtaService(repository, new AuditService(audit), runtime, {
      findById: async () => ({ id: processId, councilId: COUNCIL_A }),
    } as unknown as import("@/modules/processes/repository").ProcessRepository);
    const input = { processId, councilId: COUNCIL_A, number: "ARP-1", startDate: "2026-11-01",
      items: [{ description: "Papel", registeredQuantity: 1, unitPrice: 1 }] };
    const first = await service.create(manager(), input);
    if (!first.ok) throw new Error(first.message);
    expect(await service.create(manager(), { ...input, number: "ARP-2" })).toMatchObject({ code: "VALIDATION" });
    const replacementJustification = "A primeira ata contém um erro no valor.";
    const second = await service.create(manager(), { ...input, number: "ARP-2", replacementJustification });
    expect(second).toMatchObject({ ok: true, data: { status: "vigente" } });
    expect((await audit.list()).at(-1)?.details).toMatchObject({ replacementJustification, priorAtaIds: [first.data.id] });
    expect(await repository.findById(first.data.id)).toMatchObject({ processId });
  });
  it("rascunho antigo não aceita comprometimento até ser ativado", async () => {
    const created = await ctx.service.create(manager(), { councilId: COUNCIL_A, number: "06/2026", startDate: "2026-11-01", items: [{ description: "Caneta", registeredQuantity: 10, unitPrice: 1 }] });
    if (!created.ok) throw new Error(created.message);
    await ctx.repository.save({ ...created.data, status: "rascunho" });
    const r = await ctx.service.commitInternal({ itemId: created.data.items[0]!.id, councilId: COUNCIL_A, quantity: 1, reference: "req-1" });
    expect(!r.ok && r.code).toBe("INVALID_STATE");
    const view = await ctx.service.get(manager(), created.data.id);
    expect(view.ok && view.data.items[0]!.balance.balance).toBe(10);
    expect(await ctx.service.activate(manager(), { ataId: created.data.id })).toMatchObject({ ok: true, data: { status: "vigente" } });
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
  it("vincula processo do mesmo órgão e recusa o de outro", async () => {
    const same = "11111111-1111-4111-8111-111111111111";
    const other = "22222222-2222-4222-8222-222222222222";
    const runtime = makeRuntime("2026-11-02T12:00:00Z");
    const service = new AtaService(new InMemoryAtaRepository(), new AuditService(new InMemoryAuditRepository(runtime.now)), runtime, {
      async findById(id: string) {
        if (id === same) return { id, councilId: COUNCIL_A } as never;
        if (id === other) return { id, councilId: COUNCIL_B } as never;
        return null;
      },
    } as never);
    const created = await service.create(manager(), { councilId: COUNCIL_A, number: "09/2026", startDate: "2026-11-01", items: [{ description: "Papel", registeredQuantity: 1, unitPrice: 1 }] });
    if (!created.ok) throw new Error(created.message);
    expect((await service.linkProcess(manager(), { ataId: created.data.id, processId: other })).ok).toBe(false);
    const linked = await service.linkProcess(manager(), { ataId: created.data.id, processId: same });
    expect(linked.ok && linked.data.processId).toBe(same);
  });
  it("validação Zod de data e itens", async () => {
    const r = await ctx.service.create(manager(), { councilId: COUNCIL_A, number: "1", startDate: "01/11/2026", items: [] });
    expect(!r.ok && r.code).toBe("VALIDATION");
  });
  it("recusa número de ata já usado no mesmo órgão", async () => {
    const first = await ctx.service.create(manager(), {
      councilId: COUNCIL_A,
      number: "ARP 01/2026",
      startDate: "2026-11-01",
      items: [{ description: "Papel", registeredQuantity: 1, unitPrice: 1 }],
    });
    expect(first.ok).toBe(true);
    const second = await ctx.service.create(manager(), {
      councilId: COUNCIL_A,
      number: "ARP 01/2026",
      startDate: "2026-11-01",
      items: [{ description: "Caneta", registeredQuantity: 1, unitPrice: 1 }],
    });
    expect(!second.ok && second.code).toBe("CONFLICT");
  });
});
