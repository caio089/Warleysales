import { describe, expect, it } from "vitest";
import { InMemoryAtaRepository } from "@/modules/atas/repository.memory";
import { AtaService } from "@/modules/atas/service";
import { InMemoryAuditRepository } from "@/modules/audit/repository.memory";
import { AuditService } from "@/modules/audit/service";
import { InMemoryContractRepository } from "@/modules/contracts/repository.memory";
import { ContractService } from "@/modules/contracts/service";
import { InMemoryMembershipRepository } from "@/modules/identity/repository.memory";
import { COUNCIL_A, makeRuntime, managerOf } from "@/shared/testing/fixtures";
import { RepositoryAlertSource } from "./alert-source";
import { InMemoryNotificationRepository } from "./repository.memory";
import { NotificationService } from "./service";

function setup() {
  const runtime = makeRuntime("2026-11-02T12:00:00Z");
  const audit = new AuditService(new InMemoryAuditRepository(runtime.now));
  const ataRepo = new InMemoryAtaRepository();
  const contractRepo = new InMemoryContractRepository();
  const manager = managerOf(COUNCIL_A);
  const memberships = new InMemoryMembershipRepository([{ userId: manager.userId, councilId: COUNCIL_A, role: "council_manager" }]);
  return {
    runtime, manager,
    atas: new AtaService(ataRepo, audit, runtime),
    contracts: new ContractService(contractRepo, audit, runtime),
    notifications: new NotificationService(new InMemoryNotificationRepository(), new RepositoryAlertSource(ataRepo, contractRepo, memberships), audit, runtime),
  };
}

describe("NotificationService — alertas de vencimento", () => {
  it("gera alerta no marco, não repete e avança ao próximo marco", async () => {
    const c = setup();
    await c.contracts.create(c.manager, { councilId: COUNCIL_A, number: "10/2026", object: "Fornecimento de material", startDate: "2026-01-01", endDate: "2026-12-02", value: 1 }); // 30 dias
    expect(await c.notifications.generateExpiryAlerts()).toMatchObject({ created: 1 });
    expect(await c.notifications.generateExpiryAlerts()).toMatchObject({ created: 0 }); // idempotente
    c.runtime.advanceDays(15); // 15 dias restantes
    expect(await c.notifications.generateExpiryAlerts()).toMatchObject({ created: 1 });
    const mine = await c.notifications.listMine(c.manager);
    expect(mine.ok && mine.data.items.map((n) => n.milestone).sort((a, b) => a - b)).toEqual([15, 30]);
    expect(mine.ok && mine.data.unread).toBe(2);
  });
  it("atas vigentes participam; rascunhos não", async () => {
    const c = setup();
    const ata = await c.atas.create(c.manager, { councilId: COUNCIL_A, number: "01/2026", startDate: "2025-12-01", items: [{ description: "Papel", registeredQuantity: 1, unitPrice: 1 }] });
    if (!ata.ok) throw new Error();
    expect(await c.notifications.generateExpiryAlerts()).toMatchObject({ candidates: 0 });
    await c.atas.activate(c.manager, { ataId: ata.data.id }); // fim 2026-11-30 => 28 dias
    expect(await c.notifications.generateExpiryAlerts()).toMatchObject({ created: 1 });
  });
  it("sem itens a vencer não cria nada e só o destinatário marca como lida", async () => {
    const c = setup();
    expect(await c.notifications.generateExpiryAlerts()).toMatchObject({ created: 0 });
    await c.contracts.create(c.manager, { councilId: COUNCIL_A, number: "11/2026", object: "Serviço de limpeza", startDate: "2026-01-01", endDate: "2026-11-20", value: 1 });
    await c.notifications.generateExpiryAlerts();
    const mine = await c.notifications.listMine(c.manager);
    const id = mine.ok ? mine.data.items[0]!.id : "";
    expect((await c.notifications.markRead(managerOf(COUNCIL_A), { notificationId: id })).ok).toBe(false);
    expect((await c.notifications.markRead(c.manager, { notificationId: id })).ok).toBe(true);
  });
});
