import { describe, expect, it } from "vitest";
import type { Services } from "@/server/container";
import { COUNCIL_A, COUNCIL_B, managerOf, operatorOf } from "@/shared/testing/fixtures";
import { ok } from "@/shared/lib/result";
import { buildDetailedReport, followedProcessIds, productivity } from "./detailed";
import { parseDetailedFilter } from "./detailed-filter";

const services = {
  processes: { list: async () => ok([]) },
  contracts: { list: async () => ok([]), listReceiptLines: async () => ok([]) },
  purchases: { list: async () => ok([]) },
  audit: { list: async () => ok([]) },
  meetings: { list: async () => ok([]) },
  memberships: { reportDirectory: async () => ok([{ id: "11111111-1111-4111-8111-111111111111", fullName: "Estagiária A", active: true, staffCategory: "intern" }]) },
} as unknown as Services;

describe("central de relatórios detalhados", () => {
  it("bloqueia relatório individual próprio de Compras e permite os relatórios do órgão", async () => {
    const actor = { ...managerOf(COUNCIL_A), memberships: [{ councilId: COUNCIL_A, role: "purchasing_collaborator" as const }] };
    const colleague = "11111111-1111-4111-8111-111111111111";
    expect(await buildDetailedReport(services, actor, { kind: "colaborador", actorId: actor.userId })).toMatchObject({ code: "FORBIDDEN" });
    expect(await buildDetailedReport(services, actor, { kind: "colaborador", actorId: colleague })).toMatchObject({ ok: true });
    expect(await buildDetailedReport(services, actor, { kind: "processos", councilId: COUNCIL_A })).toMatchObject({ ok: true });
    expect(await buildDetailedReport(services, actor, { kind: "processos", councilId: COUNCIL_B })).toMatchObject({ code: "FORBIDDEN" });
  });
  it("filtra processos por empresa e pelas três bases de data", async () => {
    const id = crypto.randomUUID();
    const supplierId = crypto.randomUUID();
    const process = { id, councilId: COUNCIL_A, number: "20/2026", title: "Processo", status: "concluido", createdAt: new Date("2026-10-10T12:00:00Z"), createdBy: crypto.randomUUID() };
    const event = { id: "1", entityId: id, entity: "administrative_process", result: "success", action: "process.status_change", details: { to: "concluido" }, createdAt: new Date("2026-11-15T12:00:00Z") };
    const scoped = { ...services, processes: { list: async () => ok([{ process }]) }, contracts: { list: async () => ok([{ contract: { processId: id, supplierId } }]) }, audit: { list: async () => ok([event]) } } as unknown as Services;
    const actor = managerOf(COUNCIL_A);
    const period = { kind: "processos" as const, start: "2026-11-01", end: "2026-11-30", supplierId };
    const created = await buildDetailedReport(scoped, actor, { ...period, dateBasis: "criacao" });
    const moved = await buildDetailedReport(scoped, actor, { ...period, dateBasis: "movimentacao" });
    const completed = await buildDetailedReport(scoped, actor, { ...period, dateBasis: "conclusao" });
    expect(created.ok && created.data.rows).toHaveLength(0);
    expect(moved.ok && moved.data.rows).toHaveLength(1);
    expect(completed.ok && completed.data.rows).toHaveLength(1);
    const otherSupplier = await buildDetailedReport(scoped, actor, { ...period, dateBasis: "conclusao", supplierId: crypto.randomUUID() });
    expect(otherSupplier.ok && otherSupplier.data.rows).toHaveLength(0);
    expect(parseDetailedFilter({ kind: "processos", month: "2026-11", processType: "Compras" })).toMatchObject({ start: "2026-11-01", end: "2026-11-30", processType: "Compras" });
  });
  it("separa recebimentos de contratos da mesma ata e expõe o contrato exato no estoque", async () => {
    const processId = crypto.randomUUID();
    const ataItemId = crypto.randomUUID();
    const requestId = crypto.randomUUID();
    const requestItemId = crypto.randomUUID();
    const materialId = crypto.randomUUID();
    const contractA = crypto.randomUUID();
    const contractB = crypto.randomUUID();
    const makeContract = (id: string, number: string, quantity: number, status: "vigente" | "encerrado") => ({
      contract: { id, number, councilId: COUNCIL_A, processId, ataId: crypto.randomUUID(), supplierId: null, ataItems: [{ ataItemId, quantity }], createdAt: new Date("2026-11-10T12:00:00Z") },
      terms: { value: quantity, endDate: "2026-12-30" }, status, remainingDays: 30,
    });
    const contracts = [makeContract(contractA, "A", 4, "encerrado"), makeContract(contractB, "B", 6, "vigente")];
    const lines = [{ requestId, requestItemId, receiptKey: "receipt-a-123", contractId: contractA, ataItemId, quantity: 2 }];
    const request = { id: requestId, councilId: COUNCIL_A, processId, title: "Solicitação", items: [{ id: requestItemId, ataItemId, receivedTotal: 2 }] };
    const scoped = { ...services,
      contracts: { list: async () => ok(contracts), listReceiptLines: async () => ok(lines) },
      purchases: { list: async () => ok([request]) },
      processes: { list: async () => ok([{ process: { id: processId, number: "1/2026" } }]) },
      inventory: { listLevels: async () => ok([{ councilId: COUNCIL_A, materialId, physical: 2 }]), listMaterials: async () => ok([{ id: materialId, name: "Papel" }]), listMovements: async () => ok([{ councilId: COUNCIL_A, materialId, type: "entry", quantity: 2, reference: `request:${requestId}`, idempotencyKey: `receipt:receipt-a-123:${requestItemId}`, createdAt: new Date("2026-11-11T12:00:00Z"), actorId: "autor" }]) },
      councils: { list: async () => ok([{ id: COUNCIL_A }]) },
    } as unknown as Services;
    const actor = managerOf(COUNCIL_A);
    const report = await buildDetailedReport(scoped, actor, { kind: "contratos" });
    expect(report.ok && report.data.rows.map((row) => [row[0], row[8], row[9]])).toEqual([["A", "2", "2"], ["B", "0", "6"]]);
    expect(report.ok && report.data.indicators.find((entry) => entry.label === "Encerrados")?.value).toBe("1");
    const stock = await buildDetailedReport(scoped, actor, { kind: "estoque" });
    expect(stock.ok && stock.data.rows[0]?.[7]).toBe("A");
  });
  it("combina responsável, tipo, modalidade, situação e período sem usar criador como responsável", async () => {
    const responsibleId = crypto.randomUUID();
    const base = { id: crypto.randomUUID(), councilId: COUNCIL_A, number: "12/2026", title: "Compra", status: "concluido", contractingMode: "registro_precos", estimatedValue: 100, createdAt: new Date("2026-11-10T12:00:00Z"), createdBy: crypto.randomUUID(), responsibleId, processType: "Compra de material" };
    const scoped = { ...services, processes: { list: async () => ok([{ process: base }, { process: { ...base, id: crypto.randomUUID(), number: "13/2026", responsibleId: null, processType: null } }]) } } as unknown as Services;
    const filter = { kind: "processos" as const, councilId: COUNCIL_A, responsibleId, processType: "Compra de material", mode: "registro_precos", status: "concluido", start: "2026-11-01", end: "2026-11-30" };
    const result = await buildDetailedReport(scoped, managerOf(COUNCIL_A), filter);
    expect(result.ok && result.data.rows).toHaveLength(1);
    expect(result.ok && result.data.rows[0]?.at(-2)).toBe(responsibleId);
    const unmatched = await buildDetailedReport(scoped, managerOf(COUNCIL_A), { ...filter, processType: "Outro" });
    expect(unmatched.ok && unmatched.data.rows).toEqual([]);
  });
  it("nega operador e recorte de outro órgão antes de consultar dados", async () => {
    expect((await buildDetailedReport(services, operatorOf(COUNCIL_A), { kind: "processos" })).ok).toBe(false);
    expect((await buildDetailedReport(services, managerOf(COUNCIL_B), { kind: "processos", councilId: COUNCIL_A })).ok).toBe(false);
  });
  it("não aceita período invertido", async () => {
    const result = await buildDetailedReport(services, managerOf(COUNCIL_A), { kind: "processos", start: "2026-11-30", end: "2026-11-01" });
    expect(result.ok).toBe(false);
  });
  it("não apresenta o criador como responsável atual", async () => {
    const result = await buildDetailedReport(services, managerOf(COUNCIL_A), { kind: "processos", responsibleId: crypto.randomUUID() });
    expect(result.ok && result.data.rows).toEqual([]);
  });
  it("consolida somente estagiários classificados no período solicitado", async () => {
    const result = await buildDetailedReport(services, managerOf(COUNCIL_A), { kind: "estagiarios", start: "2026-11-01", end: "2026-11-30" });
    expect(result.ok && result.data.rows).toEqual([["Estagiária A", "0", "0", "0", "0", "0", "0", "0", "0"]]);
  });
});

it("conta apenas movimentações comprovadas do autor no período de Fortaleza", () => {
  const event = {
    id: "1", actorId: "autor", entity: "administrative_process", councilId: COUNCIL_A,
    action: "process.status_change", entityId: "movimentado", result: "success" as const,
    details: {}, createdAt: new Date("2026-12-01T02:59:59Z"),
  };
  const events = [
    event,
    { ...event, entityId: "criado", action: "process.create" },
    { ...event, entityId: "outro", actorId: "outro" },
    { ...event, entityId: "negado", result: "denied" as const },
    { ...event, entityId: "fora", createdAt: new Date("2026-12-01T03:00:00Z") },
  ];
  expect([...followedProcessIds(events, "autor", { start: "2026-11-01", end: "2026-11-30" })]).toEqual(["movimentado"]);
});

it("atribui conclusão ao autor real e compara o prazo na data de Fortaleza", () => {
  const item = { id: "t", description: "Tarefa", responsibleId: "responsável", dueDate: "2026-12-10", done: true };
  const meeting = {
    id: "m", councilId: COUNCIL_A, title: "Reunião", scheduledAt: new Date(), status: "realizada" as const,
    minutes: null, audioPath: null, transcript: null, createdBy: "autor", actionItems: [
      { ...item, completion: { actorId: "autor", at: new Date("2026-12-01T02:59:59Z"), dueDate: "2026-11-30" } },
      { ...item, id: "atrasada", completion: { actorId: "autor", at: new Date("2026-11-30T18:00:00Z"), dueDate: "2026-11-29" } },
      { ...item, id: "histórica" },
      { ...item, id: "pendente", done: false, responsibleId: "autor" },
    ],
  };
  const period = { start: "2026-11-01", end: "2026-11-30" };
  const stats = productivity([meeting], "autor", period);
  expect(stats.completed.map((task) => task.id)).toEqual(["t", "atrasada"]);
  expect(stats.pending.map((task) => task.id)).toEqual(["pendente"]);
  expect([stats.onTime, stats.late]).toEqual([1, 1]);
  expect(productivity([meeting], "responsável", period).completed).toEqual([]);
});
