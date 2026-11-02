import { describe, expect, it } from "vitest";
import { InMemoryAuditRepository } from "@/modules/audit/repository.memory";
import { AuditService } from "@/modules/audit/service";
import { COUNCIL_A, COUNCIL_B, makeRuntime, managerOf, operatorOf } from "@/shared/testing/fixtures";
import { InMemoryContractRepository } from "./repository.memory";
import { ContractService } from "./service";

function setup() {
  const runtime = makeRuntime("2026-07-02T15:00:00Z");
  const audit = new AuditService(new InMemoryAuditRepository(runtime.now));
  return { runtime, service: new ContractService(new InMemoryContractRepository(), audit, runtime) };
}
const input = { councilId: COUNCIL_A, number: "10/2026", object: "Fornecimento de material de expediente", startDate: "2026-01-01", endDate: "2026-12-31", value: 1000 };

describe("ContractService", () => {
  it("cria e calcula dias restantes/percentual com o dia civil de Fortaleza", async () => {
    const { service } = setup();
    const created = await service.create(managerOf(COUNCIL_A), input);
    if (!created.ok) throw new Error();
    const view = await service.get(managerOf(COUNCIL_A), created.data.id);
    expect(view.ok && view.data).toMatchObject({ remainingDays: 182, elapsedPercent: 50, status: "vigente" });
  });
  it("aditivo preserva histórico e atualiza vigência corrente (R16)", async () => {
    const { service } = setup();
    const created = await service.create(managerOf(COUNCIL_A), input);
    if (!created.ok) throw new Error();
    const amended = await service.addAmendment(managerOf(COUNCIL_A), { contractId: created.data.id, reason: "Prorrogação", endDate: "2027-06-30", signedAt: "2026-07-02" });
    expect(amended.ok && amended.data.original.endDate).toBe("2026-12-31");
    const view = await service.get(managerOf(COUNCIL_A), created.data.id);
    expect(view.ok && view.data.terms.endDate).toBe("2027-06-30");
    expect(view.ok && view.data.contract.amendments[0]!.previous.endDate).toBe("2026-12-31");
  });
  it("rejeita datas incoerentes, operador e conselho alheio", async () => {
    const { service } = setup();
    expect((await service.create(managerOf(COUNCIL_A), { ...input, endDate: "2025-01-01" })).ok).toBe(false);
    expect((await service.create(operatorOf(COUNCIL_A), input)).ok).toBe(false);
    const created = await service.create(managerOf(COUNCIL_A), input);
    if (!created.ok) throw new Error();
    expect((await service.get(managerOf(COUNCIL_B), created.data.id)).ok).toBe(false);
    expect((await service.addAmendment(managerOf(COUNCIL_B), { contractId: created.data.id, reason: "x1x", endDate: "2027-01-01", signedAt: "2026-07-02" })).ok).toBe(false);
  });
  it("contrato vencido é sinalizado", async () => {
    const { service, runtime } = setup();
    const created = await service.create(managerOf(COUNCIL_A), input);
    if (!created.ok) throw new Error();
    runtime.set("2027-02-01T12:00:00Z");
    const view = await service.get(managerOf(COUNCIL_A), created.data.id);
    expect(view.ok && view.data.status).toBe("vencido");
  });
});
