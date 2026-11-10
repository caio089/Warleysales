import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryAtaRepository } from "@/modules/atas/repository.memory";
import { AtaService } from "@/modules/atas/service";
import { InMemoryAuditRepository } from "@/modules/audit/repository.memory";
import { AuditService } from "@/modules/audit/service";
import { InMemoryInventoryRepository } from "@/modules/inventory/repository.memory";
import { InventoryService } from "@/modules/inventory/service";
import { COUNCIL_A, COUNCIL_B, makeRuntime, managerOf, operatorOf, viewerOf } from "@/shared/testing/fixtures";
import { InMemoryPurchaseRequestRepository } from "./repository.memory";
import { PurchaseRequestService } from "./service";

const MATERIAL = "33333333-3333-4333-8333-333333333333";

function setup() {
  const runtime = makeRuntime();
  const audit = new AuditService(new InMemoryAuditRepository(runtime.now));
  const atas = new AtaService(new InMemoryAtaRepository(), audit, runtime);
  const invRepo = new InMemoryInventoryRepository(runtime.now);
  const inventory = new InventoryService(invRepo, audit, runtime);
  return { runtime, atas, inventory, service: new PurchaseRequestService(new InMemoryPurchaseRequestRepository(), atas, inventory, audit, runtime) };
}
let ctx: ReturnType<typeof setup>;
const manager = () => managerOf(COUNCIL_A);
const stockOf = async () => {
  const l = await ctx.inventory.listLevels(manager(), COUNCIL_A);
  return l.ok ? l.data.find((x) => x.materialId === MATERIAL)?.physical ?? 0 : -1;
};

async function ataItem(quantity: number) {
  const created = await ctx.atas.create(manager(), { councilId: COUNCIL_A, number: "01/2026", startDate: "2026-11-01", items: [{ description: "Papel", registeredQuantity: quantity, unitPrice: 1 }] });
  if (!created.ok) throw new Error();
  await ctx.atas.activate(manager(), { ataId: created.data.id });
  return created.data.items[0]!.id;
}
async function submitted(items: { quantity: number; ataItemId?: string }[]) {
  const r = await ctx.service.create(operatorOf(COUNCIL_A), { councilId: COUNCIL_A, title: "Material de expediente", items: items.map((i) => ({ materialId: MATERIAL, ...i })) });
  if (!r.ok) throw new Error(r.message);
  await ctx.service.submit(operatorOf(COUNCIL_A), { requestId: r.data.id });
  await ctx.service.startReview(manager(), { requestId: r.data.id });
  return r.data.id;
}
beforeEach(() => { ctx = setup(); });

describe("PurchaseRequestService", () => {
  it("fluxo até aprovação NÃO altera estoque (R11)", async () => {
    const id = await submitted([{ quantity: 10 }]);
    const r = await ctx.service.approve(manager(), { requestId: id });
    expect(r.ok && r.data.status).toBe("aprovada");
    expect(await stockOf()).toBe(0);
  });
  it("recebimento parcial e total geram entradas e pendências corretas", async () => {
    const id = await submitted([{ quantity: 10 }]);
    await ctx.service.approve(manager(), { requestId: id });
    const itemId = (await ctx.service.get(manager(), id) as { ok: true; data: { items: { id: string }[] } }).data.items[0]!.id;

    const partial = await ctx.service.receive(operatorOf(COUNCIL_A), { requestId: id, receiptKey: "recebimento-1", lines: [{ itemId, received: 4 }] });
    expect(partial.ok && partial.data.status).toBe("parcialmente_atendida");
    expect(await stockOf()).toBe(4);

    const total = await ctx.service.receive(operatorOf(COUNCIL_A), { requestId: id, receiptKey: "recebimento-2", lines: [{ itemId, received: 6 }] });
    expect(total.ok && total.data.status).toBe("atendida");
    expect(await stockOf()).toBe(10);
  });
  it("reenvio do mesmo recebimento não duplica entrada (idempotência)", async () => {
    const id = await submitted([{ quantity: 10 }]);
    await ctx.service.approve(manager(), { requestId: id });
    const req = await ctx.service.get(manager(), id);
    const itemId = req.ok ? req.data.items[0]!.id : "";
    const body = { requestId: id, receiptKey: "recebimento-1", lines: [{ itemId, received: 4 }] };
    await ctx.service.receive(operatorOf(COUNCIL_A), body);
    await ctx.service.receive(operatorOf(COUNCIL_A), body);
    expect(await stockOf()).toBe(4);
  });
  it("recebimento acima do esperado é rejeitado sem tocar o estoque", async () => {
    const id = await submitted([{ quantity: 10 }]);
    await ctx.service.approve(manager(), { requestId: id });
    const req = await ctx.service.get(manager(), id);
    const itemId = req.ok ? req.data.items[0]!.id : "";
    const r = await ctx.service.receive(operatorOf(COUNCIL_A), { requestId: id, receiptKey: "recebimento-x", lines: [{ itemId, received: 11 }] });
    expect(r.ok).toBe(false);
    expect(await stockOf()).toBe(0);
  });
  it("aprovação com item de ata compromete saldo; cancelamento devolve", async () => {
    const ataItemId = await ataItem(10);
    const id = await submitted([{ quantity: 7, ataItemId }]);
    await ctx.service.approve(manager(), { requestId: id });
    const atas = await ctx.atas.list(manager());
    expect(atas.ok && atas.data[0]!.items[0]!.balance.balance).toBe(3);
    await ctx.service.cancel(manager(), { requestId: id });
    const after = await ctx.atas.list(manager());
    expect(after.ok && after.data[0]!.items[0]!.balance.balance).toBe(10);
  });
  it("aprovação acima do saldo da ata é bloqueada e a solicitação segue em análise", async () => {
    const ataItemId = await ataItem(5);
    const id = await submitted([{ quantity: 7, ataItemId }]);
    const r = await ctx.service.approve(manager(), { requestId: id });
    expect(!r.ok && r.code).toBe("INSUFFICIENT_BALANCE");
    const current = await ctx.service.get(manager(), id);
    expect(current.ok && current.data.status).toBe("em_analise");
  });
  it("rollback: segundo item falha e o primeiro comprometimento é devolvido", async () => {
    const ok1 = await ataItem(10);
    const bad = await ataItem(1);
    const id = await submitted([{ quantity: 5, ataItemId: ok1 }, { quantity: 5, ataItemId: bad }]);
    expect((await ctx.service.approve(manager(), { requestId: id })).ok).toBe(false);
    const atas = await ctx.atas.list(manager());
    const balances = atas.ok ? atas.data.flatMap((a) => a.items.map((i) => i.balance.balance)).sort((a, b) => a - b) : [];
    expect(balances).toEqual([1, 10]);
  });
  it("permissões: operador não aprova; consulta não cria; conselho alheio não vê", async () => {
    const id = await submitted([{ quantity: 1 }]);
    expect((await ctx.service.approve(operatorOf(COUNCIL_A), { requestId: id })).ok).toBe(false);
    expect((await ctx.service.create(viewerOf(COUNCIL_A), { councilId: COUNCIL_A, title: "abc", items: [{ materialId: MATERIAL, quantity: 1 }] })).ok).toBe(false);
    expect((await ctx.service.get(managerOf(COUNCIL_B), id)).ok).toBe(false);
  });
  it("rejeição exige motivo; só reabre por ação explícita do gestor", async () => {
    const id = await submitted([{ quantity: 1 }]);
    expect((await ctx.service.reject(manager(), { requestId: id, note: "" })).ok).toBe(false);
    expect((await ctx.service.reject(manager(), { requestId: id, note: "Fora do orçamento" })).ok).toBe(true);
    expect((await ctx.service.startReview(manager(), { requestId: id })).ok).toBe(false);
    expect((await ctx.service.reopen(operatorOf(COUNCIL_A), { requestId: id, justification: "erro" })).ok).toBe(false);
    const reopened = await ctx.service.reopen(manager(), { requestId: id, justification: "Erro de análise" });
    expect(reopened.ok && reopened.data.status).toBe("em_analise");
  });
  it("transição inválida (enviada → aprovada) é rejeitada", async () => {
    const r = await ctx.service.create(operatorOf(COUNCIL_A), { councilId: COUNCIL_A, title: "Teste teste", items: [{ materialId: MATERIAL, quantity: 1 }] });
    if (!r.ok) throw new Error();
    await ctx.service.submit(operatorOf(COUNCIL_A), { requestId: r.data.id });
    const bad = await ctx.service.approve(manager(), { requestId: r.data.id });
    expect(!bad.ok && bad.code).toBe("INVALID_STATE");
  });
  it("preserva campo processId na persistência e consulta da solicitação", async () => {
    const r = await ctx.service.create(operatorOf(COUNCIL_A), {
      councilId: COUNCIL_A,
      title: "Solicitação para verificação de vínculo",
      items: [{ materialId: MATERIAL, quantity: 1 }],
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data.processId).toBeNull();

    const fetched = await ctx.service.get(operatorOf(COUNCIL_A), r.data.id);
    expect(fetched.ok).toBe(true);
    if (!fetched.ok) return;
    expect(fetched.data.processId).toBeNull();
  });
});
