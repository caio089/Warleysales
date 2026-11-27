import { describe, expect, it } from "vitest";
import { InMemoryAtaRepository } from "@/modules/atas/repository.memory";
import { AtaService } from "@/modules/atas/service";
import { InMemoryAuditRepository } from "@/modules/audit/repository.memory";
import { AuditService } from "@/modules/audit/service";
import { COUNCIL_A, COUNCIL_B, centralAdmin, makeRuntime, managerOf, operatorOf } from "@/shared/testing/fixtures";
import { InMemoryContractRepository } from "./repository.memory";
import { ContractService } from "./service";

function setup() {
  const runtime = makeRuntime("2026-07-02T15:00:00Z");
  const auditRepo = new InMemoryAuditRepository(runtime.now);
  const audit = new AuditService(auditRepo);
  const atas = new AtaService(new InMemoryAtaRepository(), audit, runtime);
  return {
    runtime,
    auditRepo,
    atas,
    service: new ContractService(new InMemoryContractRepository(), audit, runtime, undefined, atas),
  };
}
const input = { councilId: COUNCIL_A, number: "10/2026", object: "Fornecimento de material de expediente", startDate: "2026-01-01", endDate: "2026-12-31", value: 1000 };

describe("ContractService", () => {
  it("registra encerramento administrativo sem alterar a vigência", async () => {
    const { service, auditRepo } = setup();
    const created = await service.create(managerOf(COUNCIL_A), input);
    if (!created.ok) throw new Error(created.message);
    expect((await service.close(managerOf(COUNCIL_B), { contractId: created.data.id })).ok).toBe(false);
    const closed = await service.close(managerOf(COUNCIL_A), { contractId: created.data.id });
    expect(closed.ok && closed.data.closedAt).toBeInstanceOf(Date);
    expect(closed.ok && closed.data.original.endDate).toBe(input.endDate);
    expect(auditRepo.all().some((event) => event.action === "contract.close" && event.entityId === created.data.id && event.actorId === (closed.ok ? closed.data.closedBy : null))).toBe(true);
    const view = await service.get(managerOf(COUNCIL_A), created.data.id);
    expect(view.ok && view.data.status).toBe("encerrado");
    expect((await service.close(managerOf(COUNCIL_A), { contractId: created.data.id })).ok).toBe(false);
  });
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
  it("permite criar ao operador, mas restringe aditivos e conselho alheio", async () => {
    const { service } = setup();
    expect((await service.create(managerOf(COUNCIL_A), { ...input, endDate: "2025-01-01" })).ok).toBe(false);
    const operatorContract = await service.create(operatorOf(COUNCIL_A), input);
    expect(operatorContract.ok).toBe(true);
    if (!operatorContract.ok) throw new Error();
    expect((await service.addAmendment(operatorOf(COUNCIL_A), { contractId: operatorContract.data.id, reason: "x1x", endDate: "2027-01-01", signedAt: "2026-07-02" })).ok).toBe(false);
    expect((await service.close(operatorOf(COUNCIL_A), { contractId: operatorContract.data.id })).ok).toBe(false);
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
  it("restringe as opções do processo aos contratos vinculados ou disponíveis no órgão", async () => {
    const { service } = setup();
    const admin = centralAdmin();
    const id = "11111111-1111-4111-8111-111111111111";
    const available = await service.create(admin, input);
    const unrelated = await service.create(admin, { ...input, councilId: COUNCIL_B });
    expect(available.ok && unrelated.ok).toBe(true);
    const selected = await service.list(admin, { id, councilId: COUNCIL_A });
    expect(selected.ok && selected.data.map(({ contract }) => contract.id))
      .toEqual(available.ok ? [available.data.id] : []);
    expect(await service.list(managerOf(COUNCIL_B), { id, councilId: COUNCIL_A }))
      .toEqual({ ok: true, data: [] });
  });
  it("desconta saldo da ata ao criar contrato e permite vários contratos na mesma ata", async () => {
    const { service, atas } = setup();
    const manager = managerOf(COUNCIL_A);
    const createdAta = await atas.create(manager, {
      councilId: COUNCIL_A,
      number: "ARP-99/2026",
      startDate: "2026-01-01",
      items: [{ description: "Papel A4", registeredQuantity: 100, unitPrice: 10 }],
    });
    if (!createdAta.ok) throw new Error(createdAta.message);
    await atas.activate(manager, { ataId: createdAta.data.id });
    const itemId = createdAta.data.items[0]!.id;

    const first = await service.create(manager, {
      ...input,
      number: "C1/2026",
      ataId: createdAta.data.id,
      ataItems: [{ ataItemId: itemId, quantity: 40, unitPrice: 10 }],
      value: 400,
    });
    expect(first.ok).toBe(true);

    const second = await service.create(manager, {
      ...input,
      number: "C2/2026",
      ataId: createdAta.data.id,
      ataItems: [{ ataItemId: itemId, quantity: 30, unitPrice: 10 }],
      value: 300,
    });
    expect(second.ok).toBe(true);

    const view = await atas.get(manager, createdAta.data.id);
    expect(view.ok && view.data.items[0]!.balance).toMatchObject({ committed: 70, balance: 30 });

    const excess = await service.create(manager, {
      ...input,
      number: "C3/2026",
      ataId: createdAta.data.id,
      ataItems: [{ ataItemId: itemId, quantity: 50, unitPrice: 10 }],
      value: 500,
    });
    expect(excess.ok).toBe(false);
  });

  it("recusa item repetido da ata antes de comprometer saldo", async () => {
    const { service, atas } = setup();
    const manager = managerOf(COUNCIL_A);
    const created = await atas.create(manager, {
      councilId: COUNCIL_A, number: "ARP-100/2026", startDate: "2026-01-01",
      items: [{ description: "Papel A4", registeredQuantity: 10, unitPrice: 1 }],
    });
    if (!created.ok) throw new Error(created.message);
    await atas.activate(manager, { ataId: created.data.id });
    const ataItemId = created.data.items[0]!.id;
    const result = await service.create(manager, {
      ...input, ataId: created.data.id,
      ataItems: [{ ataItemId, quantity: 6 }, { ataItemId, quantity: 6 }],
    });
    expect(result.ok).toBe(false);
    const view = await atas.get(manager, created.data.id);
    expect(view.ok && view.data.items[0]!.balance.committed).toBe(0);
  });

  it("exige o mesmo processo quando a ata já está vinculada", async () => {
    const runtime = makeRuntime("2026-07-02T15:00:00Z");
    const audit = new AuditService(new InMemoryAuditRepository(runtime.now));
    const processId = "11111111-1111-4111-8111-111111111111";
    const otherId = "22222222-2222-4222-8222-222222222222";
    const processes = {
      async findById(id: string) {
        return id === processId || id === otherId ? { id, councilId: COUNCIL_A } : null;
      },
    } as never;
    const atas = new AtaService(new InMemoryAtaRepository(), audit, runtime, processes);
    const service = new ContractService(new InMemoryContractRepository(), audit, runtime, processes, atas);
    const manager = managerOf(COUNCIL_A);
    const created = await atas.create(manager, {
      councilId: COUNCIL_A, number: "ARP-102/2026", processId, startDate: "2026-01-01",
      items: [{ description: "Papel A4", registeredQuantity: 10, unitPrice: 1 }],
    });
    if (!created.ok) throw new Error(created.message);
    await atas.activate(manager, { ataId: created.data.id });
    const linked = {
      ...input, ataId: created.data.id,
      ataItems: [{ ataItemId: created.data.items[0]!.id, quantity: 1 }],
    };
    expect((await service.create(manager, linked)).ok).toBe(false);
    expect((await service.create(manager, { ...linked, processId: otherId })).ok).toBe(false);
    const valid = await service.create(manager, { ...linked, processId });
    expect(valid.ok).toBe(true);
    if (!valid.ok) throw new Error(valid.message);
    expect((await service.linkProcess(manager, { contractId: valid.data.id, processId: otherId })).ok).toBe(false);
    expect((await service.linkProcess(manager, { contractId: valid.data.id, processId: null })).ok).toBe(false);
    const unchanged = await service.get(manager, valid.data.id);
    expect(unchanged.ok && unchanged.data.contract.processId).toBe(processId);
  });

  it("devolve o compromisso se a gravação do contrato falhar no repositório em memória", async () => {
    const runtime = makeRuntime("2026-07-02T15:00:00Z");
    const audit = new AuditService(new InMemoryAuditRepository(runtime.now));
    const atas = new AtaService(new InMemoryAtaRepository(), audit, runtime);
    const manager = managerOf(COUNCIL_A);
    const created = await atas.create(manager, {
      councilId: COUNCIL_A, number: "ARP-101/2026", startDate: "2026-01-01",
      items: [{ description: "Papel A4", registeredQuantity: 10, unitPrice: 1 }],
    });
    if (!created.ok) throw new Error(created.message);
    await atas.activate(manager, { ataId: created.data.id });
    class FailingRepository extends InMemoryContractRepository {
      async insert(): Promise<never> { throw new Error("falha simulada"); }
    }
    const service = new ContractService(new FailingRepository(), audit, runtime, undefined, atas);
    await expect(service.create(manager, {
      ...input, ataId: created.data.id,
      ataItems: [{ ataItemId: created.data.items[0]!.id, quantity: 4 }],
    })).rejects.toThrow("falha simulada");
    const view = await atas.get(manager, created.data.id);
    expect(view.ok && view.data.items[0]!.balance.committed).toBe(0);
  });

  it("vincula processo do mesmo órgão e recusa o de outro", async () => {
    const same = "11111111-1111-4111-8111-111111111111";
    const other = "22222222-2222-4222-8222-222222222222";
    const runtime = makeRuntime("2026-07-02T15:00:00Z");
    const service = new ContractService(new InMemoryContractRepository(), new AuditService(new InMemoryAuditRepository(runtime.now)), runtime, {
      async findById(id: string) {
        if (id === same) return { id, councilId: COUNCIL_A } as never;
        if (id === other) return { id, councilId: COUNCIL_B } as never;
        return null;
      },
    } as never);
    const created = await service.create(managerOf(COUNCIL_A), input);
    if (!created.ok) throw new Error(created.message);
    expect((await service.linkProcess(managerOf(COUNCIL_A), { contractId: created.data.id, processId: other })).ok).toBe(false);
    const linked = await service.linkProcess(managerOf(COUNCIL_A), { contractId: created.data.id, processId: same });
    expect(linked.ok && linked.data.processId).toBe(same);
    const selected = await service.list(managerOf(COUNCIL_A), { id: same, councilId: COUNCIL_A });
    expect(selected.ok && selected.data.map(({ contract }) => contract.id)).toEqual([created.data.id]);
  });
});
