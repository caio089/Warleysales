import { describe, expect, it } from "vitest";
import { COUNCIL_A, COUNCIL_B, centralAdmin, managerOf, operatorOf } from "@/shared/testing/fixtures";
import { InMemoryAuditRepository } from "./repository.memory";
import { AuditService } from "./service";

const entry = (councilId: string | null) => ({ actorId: null, action: "x", entity: "e", entityId: null, councilId, result: "success" as const, details: {} });

describe("AuditService", () => {
  it("admin vê tudo; gestor só seus conselhos; operador nada", async () => {
    const service = new AuditService(new InMemoryAuditRepository());
    await service.record(entry(COUNCIL_A));
    await service.record(entry(COUNCIL_B));
    const admin = await service.list(centralAdmin());
    expect(admin.ok && admin.data).toHaveLength(2);
    const manager = await service.list(managerOf(COUNCIL_A));
    expect(manager.ok && manager.data).toHaveLength(1);
    expect((await service.list(managerOf(COUNCIL_A), { councilId: COUNCIL_B })).ok).toBe(false);
    expect((await service.list(operatorOf(COUNCIL_A))).ok).toBe(false);
  });
  it("falha de persistência não derruba a operação (apenas loga)", async () => {
    const broken = { append: async () => { throw new Error("db"); }, list: async () => [] };
    await expect(new AuditService(broken).record(entry(COUNCIL_A))).resolves.toBeUndefined();
  });
});
