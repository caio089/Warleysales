import { describe, expect, it } from "vitest";
import { COUNCIL_A, COUNCIL_B, centralAdmin, managerOf, operatorOf, viewerOf } from "@/shared/testing/fixtures";
import { InMemoryAuditRepository } from "./repository.memory";
import { AuditService } from "./service";
import type { NewAuditEntry } from "./schemas";

const makeEntry = (override: Partial<NewAuditEntry> = {}): NewAuditEntry => ({
  actorId: override.actorId ?? "user-1",
  action: override.action ?? "process.create",
  entity: override.entity ?? "process",
  entityId: override.entityId ?? "proc-123",
  councilId: override.councilId !== undefined ? override.councilId : COUNCIL_A,
  result: override.result ?? "success",
  details: override.details ?? {},
});

describe("AuditService", () => {
  it("admin vê tudo; gestor só seus conselhos; operador nada", async () => {
    const service = new AuditService(new InMemoryAuditRepository());
    await service.record(makeEntry({ councilId: COUNCIL_A }));
    await service.record(makeEntry({ councilId: COUNCIL_B }));
    const admin = await service.list(centralAdmin());
    expect(admin.ok && admin.data).toHaveLength(2);
    const manager = await service.list(managerOf(COUNCIL_A));
    expect(manager.ok && manager.data).toHaveLength(1);
    expect((await service.list(managerOf(COUNCIL_A), { councilId: COUNCIL_B })).ok).toBe(false);
    expect((await service.list(operatorOf(COUNCIL_A))).ok).toBe(false);
  });

  it("falha de persistência não derruba a operação (apenas loga)", async () => {
    const broken = { append: async () => { throw new Error("db"); }, list: async () => [] };
    await expect(new AuditService(broken).record(makeEntry({ councilId: COUNCIL_A }))).resolves.toBeUndefined();
  });

  describe("barreiras de segurança multi-tenant (R14)", () => {
    it("não-admin filtrando conselho alheio recebe FORBIDDEN", async () => {
      const service = new AuditService(new InMemoryAuditRepository());
      const res = await service.list(managerOf(COUNCIL_A), { councilId: COUNCIL_B });
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.code).toBe("FORBIDDEN");
      }
    });

    it("não-admin tentando councilIds com conselho alheio recebe FORBIDDEN", async () => {
      const service = new AuditService(new InMemoryAuditRepository());
      const res = await service.list(managerOf(COUNCIL_A), { councilIds: [COUNCIL_A, COUNCIL_B] });
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.code).toBe("FORBIDDEN");
      }
    });

    it("não-admin tentando councilIds: 'all' recebe FORBIDDEN", async () => {
      const service = new AuditService(new InMemoryAuditRepository());
      const res = await service.list(managerOf(COUNCIL_A), { councilIds: "all" });
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.code).toBe("FORBIDDEN");
      }
    });

    it("operador ou visualizador não tem permissão de auditoria", async () => {
      const service = new AuditService(new InMemoryAuditRepository());
      const resOp = await service.list(operatorOf(COUNCIL_A));
      expect(resOp.ok).toBe(false);
      if (!resOp.ok) expect(resOp.code).toBe("FORBIDDEN");

      const resViewer = await service.list(viewerOf(COUNCIL_A));
      expect(resViewer.ok).toBe(false);
      if (!resViewer.ok) expect(resViewer.code).toBe("FORBIDDEN");
    });

    it("gestor pode filtrar explicitamente seu próprio conselho", async () => {
      const service = new AuditService(new InMemoryAuditRepository());
      await service.record(makeEntry({ councilId: COUNCIL_A }));
      const res = await service.list(managerOf(COUNCIL_A), { councilId: COUNCIL_A });
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data).toHaveLength(1);
      }
    });
  });

  describe("filtros multidimensionais", () => {
    const setupRecords = async () => {
      let currentTime = new Date("2026-11-01T10:00:00.000Z");
      const clock = () => currentTime;
      const repo = new InMemoryAuditRepository(clock);
      const service = new AuditService(repo);

      // Reg 1: 2026-11-01 10:00, COUNCIL_A, user-1, process, proc-1, process.create, success
      await service.record(makeEntry({
        councilId: COUNCIL_A,
        actorId: "user-1",
        entity: "process",
        entityId: "proc-1",
        action: "process.create",
        result: "success",
      }));

      // Reg 2: 2026-11-03 14:00, COUNCIL_A, user-2, order, ord-1, order.submit, success
      currentTime = new Date("2026-11-03T14:00:00.000Z");
      await service.record(makeEntry({
        councilId: COUNCIL_A,
        actorId: "user-2",
        entity: "order",
        entityId: "ord-1",
        action: "order.submit",
        result: "success",
      }));

      // Reg 3: 2026-11-05 09:00, COUNCIL_A, user-1, process, proc-1, process.close, denied
      currentTime = new Date("2026-11-05T09:00:00.000Z");
      await service.record(makeEntry({
        councilId: COUNCIL_A,
        actorId: "user-1",
        entity: "process",
        entityId: "proc-1",
        action: "process.close",
        result: "denied",
      }));

      // Reg 4: 2026-11-08 18:00, COUNCIL_B, user-3, purchase, pur-1, purchase.receive, error
      currentTime = new Date("2026-11-08T18:00:00.000Z");
      await service.record(makeEntry({
        councilId: COUNCIL_B,
        actorId: "user-3",
        entity: "purchase",
        entityId: "pur-1",
        action: "purchase.receive",
        result: "error",
      }));

      return { service, admin: centralAdmin() };
    };

    it("filtra por entity (módulo)", async () => {
      const { service, admin } = await setupRecords();
      const res = await service.list(admin, { entity: "process" });
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data).toHaveLength(2);
        expect(res.data.every((e) => e.entity === "process")).toBe(true);
      }
    });

    it("filtra por entityId", async () => {
      const { service, admin } = await setupRecords();
      const res = await service.list(admin, { entityId: "ord-1" });
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data).toHaveLength(1);
        expect(res.data[0]?.entityId).toBe("ord-1");
      }
    });

    it("filtra por actorId (usuário)", async () => {
      const { service, admin } = await setupRecords();
      const res = await service.list(admin, { actorId: "user-1" });
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data).toHaveLength(2);
        expect(res.data.every((e) => e.actorId === "user-1")).toBe(true);
      }
    });

    it("filtra por action (ação)", async () => {
      const { service, admin } = await setupRecords();
      const res = await service.list(admin, { action: "order.submit" });
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data).toHaveLength(1);
        expect(res.data[0]?.action).toBe("order.submit");
      }
    });

    it("filtra por result (resultado)", async () => {
      const { service, admin } = await setupRecords();
      const resSuccess = await service.list(admin, { result: "success" });
      expect(resSuccess.ok).toBe(true);
      if (resSuccess.ok) {
        expect(resSuccess.data).toHaveLength(2);
      }

      const resDenied = await service.list(admin, { result: "denied" });
      expect(resDenied.ok).toBe(true);
      if (resDenied.ok) {
        expect(resDenied.data).toHaveLength(1);
        expect(resDenied.data[0]?.result).toBe("denied");
      }

      const resError = await service.list(admin, { result: "error" });
      expect(resError.ok).toBe(true);
      if (resError.ok) {
        expect(resError.data).toHaveLength(1);
        expect(resError.data[0]?.result).toBe("error");
      }
    });

    it("filtra por intervalo de datas (startDate e endDate)", async () => {
      const { service, admin } = await setupRecords();

      // De 2026-11-02 a 2026-11-06 (deve pegar Reg 2 e Reg 3)
      const res = await service.list(admin, {
        startDate: "2026-11-02",
        endDate: "2026-11-06",
      });
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data).toHaveLength(2);
        expect(res.data.map((e) => e.action)).toEqual(["order.submit", "process.close"]);
      }
    });

    it("filtra com objetos Date", async () => {
      const { service, admin } = await setupRecords();
      const res = await service.list(admin, {
        startDate: new Date("2026-11-03T00:00:00.000Z"),
        endDate: new Date("2026-11-03T23:59:59.999Z"),
      });
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data).toHaveLength(1);
        expect(res.data[0]?.action).toBe("order.submit");
      }
    });

    it("filtro combinado: órgão + módulo + usuário + resultado + período", async () => {
      const { service, admin } = await setupRecords();
      const res = await service.list(admin, {
        councilId: COUNCIL_A,
        entity: "process",
        actorId: "user-1",
        result: "success",
        startDate: "2026-11-01",
        endDate: "2026-11-02",
      });
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data).toHaveLength(1);
        expect(res.data[0]?.action).toBe("process.create");
      }

      // Combinação que não encontra nada
      const resEmpty = await service.list(admin, {
        councilId: COUNCIL_A,
        entity: "process",
        result: "error",
      });
      expect(resEmpty.ok).toBe(true);
      if (resEmpty.ok) {
        expect(resEmpty.data).toHaveLength(0);
      }
    });
  });
});
