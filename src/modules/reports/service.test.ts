import { describe, expect, it, vi } from "vitest";
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
import { COUNCIL_A, COUNCIL_B, centralAdmin, makeRuntime, managerOf, operatorOf } from "@/shared/testing/fixtures";
import { ReportService } from "./service";

function setup() {
  const rt = makeRuntime();
  const audit = new AuditService(new InMemoryAuditRepository(rt.now));
  const processes = new ProcessService(new InMemoryProcessRepository(), new InMemoryDocumentRepository(), audit, rt);
  const inventory = new InventoryService(new InMemoryInventoryRepository(rt.now), audit, rt);
  const contracts = new ContractService(new InMemoryContractRepository(), audit, rt);
  const atas = new AtaService(new InMemoryAtaRepository(), audit, rt);
  return { processes, inventory, report: new ReportService(processes, inventory, contracts, atas, rt) };
}

describe("ReportService", () => {
  it("sem dados: média é null (nunca inventa 0%)", async () => {
    const { report } = setup();
    const r = await report.operationalSummary(managerOf(COUNCIL_A));
    expect(r.ok && r.data.processes).toMatchObject({ total: 0, averageProgress: null });
  });
  it("agrega somente o escopo do ator", async () => {
    const { report, processes } = setup();
    await processes.create(managerOf(COUNCIL_A), { councilId: COUNCIL_A, number: "001/2026", title: "Processo A" });
    await processes.create(managerOf(COUNCIL_B), { councilId: COUNCIL_B, number: "001/2026", title: "Processo B" });
    const r = await report.operationalSummary(managerOf(COUNCIL_A));
    expect(r.ok && r.data.processes.total).toBe(1);
  });
  it("operador não acessa relatórios (matriz de navegação)", async () => {
    const { report } = setup();
    expect((await report.operationalSummary(operatorOf(COUNCIL_A))).ok).toBe(false);
  });
  it("operador acessa o dashboard operacional do próprio conselho", async () => {
    const { report } = setup();
    const r = await report.dashboard(operatorOf(COUNCIL_A));
    expect(r.ok).toBe(true);
  });
  it("filtra o consolidado pelo conselho informado", async () => {
    const { report, processes } = setup();
    await processes.create(managerOf(COUNCIL_A), { councilId: COUNCIL_A, number: "001/2026", title: "Processo A" });
    await processes.create(managerOf(COUNCIL_B), { councilId: COUNCIL_B, number: "001/2026", title: "Processo B" });
    const admin = { userId: crypto.randomUUID(), isCentralAdmin: true, isSpecialDeleter: false, memberships: [] };
    const all = await report.operationalSummary(admin);
    const onlyA = await report.operationalSummary(admin, { councilId: COUNCIL_A });
    expect(all.ok && all.data.processes.total).toBe(2);
    expect(onlyA.ok && onlyA.data.processes.total).toBe(1);
  });
  it("exclui órgãos de demonstração do consolidado exportado", async () => {
    const { report, processes } = setup();
    const admin = { userId: crypto.randomUUID(), isCentralAdmin: true, isSpecialDeleter: false, memberships: [] };
    await processes.create(admin, { councilId: COUNCIL_A, number: "001/2026", title: "Registro real" });
    await processes.create(admin, { councilId: COUNCIL_B, number: "002/2026", title: "Demonstração" });
    const result = await report.operationalSummary(admin, { excludeCouncilIds: [COUNCIL_B] });
    expect(result.ok && result.data.processes.total).toBe(1);
  });
  it("dashboard sem dados não inventa pauta de atenção", async () => {
    const { report } = setup();
    const r = await report.dashboard(managerOf(COUNCIL_A));
    expect(r.ok && r.data.attention).toEqual([]);
    expect(r.ok && r.data.deadlines).toEqual([]);
    expect(r.ok && r.data.stockLevels).toEqual([]);
  });
  it("reutiliza os mesmos níveis para os indicadores e a tela no escopo autorizado", async () => {
    const { report, inventory } = setup();
    const admin = centralAdmin();
    const material = await inventory.createMaterial(admin, { code: "PAP-001", name: "Papel", unit: "resma" });
    if (!material.ok) throw new Error(material.message);
    for (const [councilId, quantity] of [[COUNCIL_A, 10], [COUNCIL_B, 20]] as const) {
      const result = await inventory.registerMovement(admin, {
        councilId, materialId: material.data.id, type: "entry", quantity,
        idempotencyKey: `entrada-${councilId}`, reason: "Compra",
      });
      expect(result.ok).toBe(true);
    }
    const read = vi.spyOn(inventory, "listLevels");
    const all = await report.dashboard(admin);
    expect(all.ok && all.data.summary.stock.items).toBe(2);
    expect(all.ok && all.data.stockLevels.map((level) => level.available)).toEqual([10, 20]);
    const scoped = await report.dashboard(admin, { councilId: COUNCIL_B });
    expect(scoped.ok && scoped.data.summary.stock.items).toBe(1);
    expect(scoped.ok && scoped.data.stockLevels).toMatchObject([{ councilId: COUNCIL_B, available: 20 }]);
    const operator = operatorOf(COUNCIL_A);
    const own = await report.dashboard(operator);
    expect(own.ok && own.data.stockLevels).toMatchObject([{ councilId: COUNCIL_A, available: 10 }]);
    expect(await report.dashboard(operator, { councilId: COUNCIL_B })).toMatchObject({ ok: false, code: "FORBIDDEN" });
    expect(read.mock.calls).toEqual([[admin, undefined], [admin, COUNCIL_B], [operator, undefined]]);
  });
});
