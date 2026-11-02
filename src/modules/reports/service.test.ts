import { describe, expect, it } from "vitest";
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
import { COUNCIL_A, COUNCIL_B, makeRuntime, managerOf, operatorOf } from "@/shared/testing/fixtures";
import { ReportService } from "./service";

function setup() {
  const rt = makeRuntime();
  const audit = new AuditService(new InMemoryAuditRepository(rt.now));
  const processes = new ProcessService(new InMemoryProcessRepository(), new InMemoryDocumentRepository(), audit, rt);
  const inventory = new InventoryService(new InMemoryInventoryRepository(rt.now), audit, rt);
  const contracts = new ContractService(new InMemoryContractRepository(), audit, rt);
  const atas = new AtaService(new InMemoryAtaRepository(), audit, rt);
  return { processes, report: new ReportService(processes, inventory, contracts, atas) };
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
});
