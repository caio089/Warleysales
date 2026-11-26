import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryAtaRepository } from "@/modules/atas/repository.memory";
import { AtaService } from "@/modules/atas/service";
import { InMemoryAuditRepository } from "@/modules/audit/repository.memory";
import { AuditService } from "@/modules/audit/service";
import { InMemoryContractRepository } from "@/modules/contracts/repository.memory";
import { ContractService } from "@/modules/contracts/service";
import { InMemoryDocumentRepository } from "@/modules/documents/repository.memory";
import { InMemoryInventoryRepository } from "@/modules/inventory/repository.memory";
import { InventoryService } from "@/modules/inventory/service";
import { InMemoryProcessRepository } from "@/modules/processes/repository.memory";
import { ProcessService } from "@/modules/processes/service";
import { COUNCIL_A, COUNCIL_B, centralAdmin, makeRuntime, managerOf, operatorOf, specialDeleter, viewerOf } from "@/shared/testing/fixtures";
import { InMemoryPurchaseRequestRepository } from "./repository.memory";
import { PurchaseRequestService } from "./service";

const MATERIAL = "33333333-3333-4333-8333-333333333333";

function setup() {
  const runtime = makeRuntime();
  const auditRepo = new InMemoryAuditRepository(runtime.now);
  const audit = new AuditService(auditRepo);
  const atas = new AtaService(new InMemoryAtaRepository(), audit, runtime);
  const contractRepo = new InMemoryContractRepository();
  const contracts = new ContractService(contractRepo, audit, runtime, undefined, atas);
  const invRepo = new InMemoryInventoryRepository(runtime.now);
  const inventory = new InventoryService(invRepo, audit, runtime);
  const processes = new ProcessService(new InMemoryProcessRepository(), new InMemoryDocumentRepository(), audit, runtime);
  return {
    runtime,
    auditRepo,
    atas,
    contracts,
    contractRepo,
    inventory,
    processes,
    service: new PurchaseRequestService(
      new InMemoryPurchaseRequestRepository(),
      atas,
      inventory,
      processes,
      audit,
      runtime,
      contracts,
    ),
  };
}
let ctx: ReturnType<typeof setup>;
const manager = () => managerOf(COUNCIL_A);
/** Warley: admin central + special deleter. */
const approver = () => specialDeleter();
const stockOf = async () => {
  const l = await ctx.inventory.listLevels(manager(), COUNCIL_A);
  return l.ok ? l.data.find((x) => x.materialId === MATERIAL)?.physical ?? 0 : -1;
};

let ataSeq = 0;
async function ataItem(quantity: number) {
  ataSeq += 1;
  const created = await ctx.atas.create(manager(), {
    councilId: COUNCIL_A,
    number: `01/${ataSeq}/2026`,
    startDate: "2026-11-01",
    items: [{ description: "Papel", registeredQuantity: quantity, unitPrice: 1 }],
  });
  if (!created.ok) throw new Error(created.message);
  await ctx.atas.activate(manager(), { ataId: created.data.id });
  return created.data.items[0]!.id;
}
async function submitted(items: { quantity: number; ataItemId?: string }[]) {
  const r = await ctx.service.create(operatorOf(COUNCIL_A), { councilId: COUNCIL_A, title: "Material de expediente", createProcess: true, items: items.map((i) => ({ materialId: MATERIAL, ...i })) });
  if (!r.ok) throw new Error(r.message);
  await ctx.contractRepo.insert({
    id: ctx.runtime.newId(), councilId: COUNCIL_A, number: `CTR-${r.data.id}`,
    supplierId: null, processId: r.data.processId, ataId: null,
    object: "Fornecimento de material", original: { startDate: "2026-11-01", endDate: "2027-10-31", value: 0 },
    amendments: [], ataItems: [], createdAt: ctx.runtime.now(),
  });
  await ctx.service.submit(operatorOf(COUNCIL_A), { requestId: r.data.id });
  await ctx.service.startReview(approver(), { requestId: r.data.id });
  return r.data.id;
}
beforeEach(() => {
  ataSeq = 0;
  ctx = setup();
});

describe("PurchaseRequestService", () => {
  it("fluxo até aprovação NÃO altera estoque (R11)", async () => {
    const id = await submitted([{ quantity: 10 }]);
    const r = await ctx.service.approve(approver(), { requestId: id });
    expect(r.ok && r.data.status).toBe("aprovada");
    expect(await stockOf()).toBe(0);
  });
  it("recebimento parcial e total geram entradas e pendências corretas", async () => {
    const id = await submitted([{ quantity: 10 }]);
    await ctx.service.approve(approver(), { requestId: id });
    const itemId = (await ctx.service.get(manager(), id) as { ok: true; data: { items: { id: string }[] } }).data.items[0]!.id;

    const partial = await ctx.service.receive(operatorOf(COUNCIL_A), { requestId: id, receiptKey: "recebimento-1", lines: [{ itemId, received: 4 }] });
    expect(partial.ok && partial.data.status).toBe("parcialmente_atendida");
    expect(await stockOf()).toBe(4);

    const total = await ctx.service.receive(operatorOf(COUNCIL_A), { requestId: id, receiptKey: "recebimento-2", lines: [{ itemId, received: 6 }] });
    expect(total.ok && total.data.status).toBe("atendida");
    expect(await stockOf()).toBe(10);
  });
  it("com ata, só libera estoque após contrato e respeita a quantidade contratada", async () => {
    const ata = await ctx.atas.create(manager(), {
      councilId: COUNCIL_A,
      number: "ARP-GATE/2026",
      startDate: "2026-11-01",
      items: [{ description: "Papel", registeredQuantity: 20, unitPrice: 10 }],
    });
    if (!ata.ok) throw new Error(ata.message);
    await ctx.atas.activate(manager(), { ataId: ata.data.id });
    const ataItemId = ata.data.items[0]!.id;

    const created = await ctx.service.create(operatorOf(COUNCIL_A), {
      councilId: COUNCIL_A,
      title: "Material com ata",
      createProcess: true,
      items: [{ materialId: MATERIAL, quantity: 10, ataItemId }],
    });
    if (!created.ok) throw new Error(created.message);
    const processId = created.data.processId!;
    await ctx.service.submit(operatorOf(COUNCIL_A), { requestId: created.data.id });
    await ctx.service.startReview(approver(), { requestId: created.data.id });
    await ctx.service.approve(approver(), { requestId: created.data.id });
    const itemId = created.data.items[0]!.id;

    const blocked = await ctx.service.receive(operatorOf(COUNCIL_A), {
      requestId: created.data.id,
      receiptKey: "gate-blocked",
      lines: [{ itemId, received: 2 }],
    });
    expect(!blocked.ok && blocked.code).toBe("INVALID_STATE");
    expect(await stockOf()).toBe(0);

    await ctx.contractRepo.insert({
      id: ctx.runtime.newId(),
      councilId: COUNCIL_A,
      number: "CTR-GATE/2026",
      supplierId: null,
      processId,
      ataId: ata.data.id,
      object: "Fornecimento de papel",
      original: { startDate: "2026-11-01", endDate: "2027-10-31", value: 30 },
      amendments: [],
      ataItems: [{ id: ctx.runtime.newId(), ataItemId, quantity: 3, unitPrice: 10 }],
      createdAt: ctx.runtime.now(),
    });

    const partial = await ctx.service.receive(operatorOf(COUNCIL_A), {
      requestId: created.data.id,
      receiptKey: "gate-ok-1",
      lines: [{ itemId, received: 2 }],
    });
    expect(partial.ok).toBe(true);
    expect(await stockOf()).toBe(2);

    const over = await ctx.service.receive(operatorOf(COUNCIL_A), {
      requestId: created.data.id,
      receiptKey: "gate-over",
      lines: [{ itemId, received: 2 }],
    });
    expect(over.ok).toBe(false);
    expect(await stockOf()).toBe(2);

    const rest = await ctx.service.receive(operatorOf(COUNCIL_A), {
      requestId: created.data.id,
      receiptKey: "gate-ok-2",
      lines: [{ itemId, received: 1 }],
    });
    expect(rest.ok).toBe(true);
    expect(await stockOf()).toBe(3);
  });
  it("reenvio do mesmo recebimento não duplica entrada (idempotência)", async () => {
    const id = await submitted([{ quantity: 10 }]);
    await ctx.service.approve(approver(), { requestId: id });
    const req = await ctx.service.get(manager(), id);
    const itemId = req.ok ? req.data.items[0]!.id : "";
    const body = { requestId: id, receiptKey: "recebimento-1", lines: [{ itemId, received: 4 }] };
    await ctx.service.receive(operatorOf(COUNCIL_A), body);
    await ctx.service.receive(operatorOf(COUNCIL_A), body);
    expect(await stockOf()).toBe(4);
  });
  it("recebimento acima do esperado é rejeitado sem tocar o estoque", async () => {
    const id = await submitted([{ quantity: 10 }]);
    await ctx.service.approve(approver(), { requestId: id });
    const req = await ctx.service.get(manager(), id);
    const itemId = req.ok ? req.data.items[0]!.id : "";
    const r = await ctx.service.receive(operatorOf(COUNCIL_A), { requestId: id, receiptKey: "recebimento-x", lines: [{ itemId, received: 11 }] });
    expect(r.ok).toBe(false);
    expect(await stockOf()).toBe(0);
  });
  it("aprovação e cancelamento não alteram saldo da ata reservado ao contrato", async () => {
    const ataItemId = await ataItem(10);
    const id = await submitted([{ quantity: 7, ataItemId }]);
    await ctx.service.approve(approver(), { requestId: id });
    const atas = await ctx.atas.list(manager());
    expect(atas.ok && atas.data[0]!.items[0]!.balance.balance).toBe(10);
    await ctx.service.cancel(approver(), { requestId: id, note: "Pedido cancelado pelo gestor." });
    const after = await ctx.atas.list(manager());
    expect(after.ok && after.data[0]!.items[0]!.balance.balance).toBe(10);
  });
  it("aprovação acima do saldo da ata aguarda definição de quantidade no contrato", async () => {
    const ataItemId = await ataItem(5);
    const id = await submitted([{ quantity: 7, ataItemId }]);
    const r = await ctx.service.approve(approver(), { requestId: id });
    expect(r.ok).toBe(true);
    const current = await ctx.service.get(manager(), id);
    expect(current.ok && current.data.status).toBe("aprovada");
  });
  it("aprovação de vários itens não compromete saldo das atas", async () => {
    const ok1 = await ataItem(10);
    const bad = await ataItem(1);
    const id = await submitted([{ quantity: 5, ataItemId: ok1 }, { quantity: 5, ataItemId: bad }]);
    expect((await ctx.service.approve(approver(), { requestId: id })).ok).toBe(true);
    const atas = await ctx.atas.list(manager());
    const balances = atas.ok ? atas.data.flatMap((a) => a.items.map((i) => i.balance.balance)).sort((a, b) => a - b) : [];
    expect(balances).toEqual([1, 10]);
  });
  it("item digitado grava o nome e não altera o estoque", async () => {
    const r = await ctx.service.create(operatorOf(COUNCIL_A), {
      councilId: COUNCIL_A,
      title: "Material de expediente",
      items: [{ description: "Caneta azul", quantity: 12, unit: "cx" }],
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const materials = await ctx.inventory.listMaterials(manager());
    const material = materials.ok ? materials.data.find((item) => item.name === "Caneta azul") : undefined;
    expect(material?.unit).toBe("cx");
    expect(r.data.items[0]?.materialId).toBe(material?.id);
    const levels = await ctx.inventory.listLevels(manager(), COUNCIL_A);
    const level = levels.ok ? levels.data.find((item) => item.materialId === material?.id) : undefined;
    expect(level?.physical ?? 0).toBe(0);
    expect(level?.blocked).toBe(12);
    expect(level?.available).toBe(0);
  });
  it("permissões: órgão, operador e admin central comum (Maria Luiza) não aprovam; só Warley", async () => {
    const id = await submitted([{ quantity: 1 }]);
    expect((await ctx.service.approve(manager(), { requestId: id })).ok).toBe(false);
    expect((await ctx.service.approve(operatorOf(COUNCIL_A), { requestId: id })).ok).toBe(false);
    expect((await ctx.service.approve(centralAdmin(), { requestId: id })).ok).toBe(false);
    expect((await ctx.service.startReview(manager(), { requestId: id })).ok).toBe(false);
    expect((await ctx.service.create(viewerOf(COUNCIL_A), { councilId: COUNCIL_A, title: "abc", items: [{ materialId: MATERIAL, quantity: 1 }] })).ok).toBe(false);
    expect((await ctx.service.get(managerOf(COUNCIL_B), id)).ok).toBe(false);
  });
  it("aprova direto de enviada (abre análise e aprova no mesmo passo)", async () => {
    const created = await ctx.service.create(operatorOf(COUNCIL_A), {
      councilId: COUNCIL_A,
      title: "Aprovação em um clique",
      items: [{ materialId: MATERIAL, quantity: 2 }],
    });
    if (!created.ok) throw new Error(created.message);
    await ctx.service.submit(operatorOf(COUNCIL_A), { requestId: created.data.id });
    const approved = await ctx.service.approve(approver(), { requestId: created.data.id });
    expect(approved.ok && approved.data.status).toBe("aprovada");
  });
  it("cancelamento exige motivo", async () => {
    const id = await submitted([{ quantity: 1 }]);
    expect((await ctx.service.cancel(approver(), { requestId: id, note: "" })).ok).toBe(false);
    expect((await ctx.service.cancel(approver(), { requestId: id })).ok).toBe(false);
    const cancelled = await ctx.service.cancel(approver(), { requestId: id, note: "Duplicada por engano" });
    expect(cancelled.ok && cancelled.data.status).toBe("cancelada");
  });
  it("rejeição exige motivo; só reabre por ação explícita da administração central", async () => {
    const id = await submitted([{ quantity: 1 }]);
    expect((await ctx.service.reject(approver(), { requestId: id, note: "" })).ok).toBe(false);
    expect((await ctx.service.reject(approver(), { requestId: id, note: "Fora do orçamento" })).ok).toBe(true);
    expect((await ctx.service.startReview(approver(), { requestId: id })).ok).toBe(false);
    expect((await ctx.service.reopen(operatorOf(COUNCIL_A), { requestId: id, justification: "erro" })).ok).toBe(false);
    expect((await ctx.service.reopen(manager(), { requestId: id, justification: "Erro de análise" })).ok).toBe(false);
    const reopened = await ctx.service.reopen(approver(), { requestId: id, justification: "Erro de análise" });
    expect(reopened.ok && reopened.data.status).toBe("em_analise");
  });
  it("transição inválida (rascunho → aprovada) é rejeitada", async () => {
    const r = await ctx.service.create(operatorOf(COUNCIL_A), { councilId: COUNCIL_A, title: "Teste teste", items: [{ materialId: MATERIAL, quantity: 1 }] });
    if (!r.ok) throw new Error();
    const bad = await ctx.service.approve(approver(), { requestId: r.data.id });
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
  it("cria processo administrativo correspondente quando createProcess é verdadeiro", async () => {
    const r = await ctx.service.create(operatorOf(COUNCIL_A), {
      councilId: COUNCIL_A,
      title: "Aquisição de computadores",
      createProcess: true,
      items: [{ materialId: MATERIAL, quantity: 2 }],
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data.processId).toBeDefined();
    expect(typeof r.data.processId).toBe("string");

    const proc = await ctx.processes.get(operatorOf(COUNCIL_A), r.data.processId!);
    expect(proc.ok).toBe(true);
    if (!proc.ok) return;
    expect(proc.data.process.number).toBe("001/2026");
    expect(proc.data.process.title).toBe("Aquisição de computadores");
    expect(await ctx.service.listLinkedNotes(operatorOf(COUNCIL_A))).toEqual({
      ok: true,
      data: [{ processId: r.data.processId, notes: r.data.events.map((event) => event.note) }],
    });
    expect(await ctx.service.listLinkedNotes(operatorOf(COUNCIL_B))).toEqual({ ok: true, data: [] });
    expect(await ctx.service.findLinkedByProcess(operatorOf(COUNCIL_A), r.data.processId!))
      .toEqual(await ctx.service.get(operatorOf(COUNCIL_A), r.data.id));
    expect(await ctx.service.findLinkedByProcess(operatorOf(COUNCIL_B), r.data.processId!))
      .toEqual({ ok: true, data: null });
  });
  it("provisiona estoque bloqueado ao criar solicitacao com itens", async () => {
    const r = await ctx.service.create(operatorOf(COUNCIL_A), {
      councilId: COUNCIL_A,
      title: "Aquisição de mesas",
      estimatedValue: 10500.50,
      items: [{ materialId: MATERIAL, quantity: 10 }],
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data.estimatedValue).toBe(10500.50);
    const reloaded = await ctx.service.get(operatorOf(COUNCIL_A), r.data.id);
    expect(reloaded.ok && reloaded.data.estimatedValue).toBe(10500.50);

    const levels = await ctx.inventory.listLevels(operatorOf(COUNCIL_A), COUNCIL_A);
    expect(levels.ok).toBe(true);
    if (!levels.ok) return;
    const item = levels.data.find((l) => l.materialId === MATERIAL);
    expect(item?.blocked).toBe(10);
    expect(item?.available).toBe(0); // Disponível ainda é 0
  });
  it("recebimento parcial com closeIncomplete sem justificativa falha com VALIDATION", async () => {
    const id = await submitted([{ quantity: 10 }]);
    await ctx.service.approve(approver(), { requestId: id });
    const req = await ctx.service.get(manager(), id);
    const itemId = req.ok ? req.data.items[0]!.id : "";

    const rSemJustificativa = await ctx.service.receive(operatorOf(COUNCIL_A), {
      requestId: id,
      receiptKey: "recebimento-inc-1",
      lines: [{ itemId, received: 5 }],
      closeIncomplete: true,
    });
    expect(rSemJustificativa.ok).toBe(false);
    expect(!rSemJustificativa.ok && rSemJustificativa.code).toBe("VALIDATION");

    const rJustificativaCurta = await ctx.service.receive(operatorOf(COUNCIL_A), {
      requestId: id,
      receiptKey: "recebimento-inc-2",
      lines: [{ itemId, received: 5 }],
      closeIncomplete: true,
      incompleteJustification: "Pouco texto",
    });
    expect(rJustificativaCurta.ok).toBe(false);
    expect(!rJustificativaCurta.ok && rJustificativaCurta.code).toBe("VALIDATION");

    const rComJustificativa = await ctx.service.receive(operatorOf(COUNCIL_A), {
      requestId: id,
      receiptKey: "recebimento-inc-3",
      lines: [{ itemId, received: 5 }],
      closeIncomplete: true,
      incompleteJustification: "Fornecedor encerrou as atividades e saldo restante não será entregue.",
    });
    expect(rComJustificativa.ok).toBe(true);
    expect(rComJustificativa.ok && rComJustificativa.data.status).toBe("atendida");

    const auditEvents = ctx.auditRepo.all();
    const auditInc = auditEvents.find((e) => e.action === "purchase.receive_incomplete");
    expect(auditInc).toBeDefined();
    expect(auditInc?.entityId).toBe(id);
    expect(auditInc?.details?.justification).toBe("Fornecedor encerrou as atividades e saldo restante não será entregue.");
  });
});
