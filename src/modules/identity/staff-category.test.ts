import { describe, expect, it } from "vitest";
import { InMemoryAuditRepository } from "@/modules/audit/repository.memory";
import { AuditService } from "@/modules/audit/service";
import { COUNCIL_A, COUNCIL_B, centralAdmin, managerOf } from "@/shared/testing/fixtures";
import { InMemoryCouncilRepository, InMemoryMembershipRepository } from "./repository.memory";
import { MembershipService } from "./service";

describe("classificação de equipe para relatórios", () => {
  it("mantém perfis não classificados até decisão do administrador e registra autoria", async () => {
    const id = crypto.randomUUID();
    const repository = new InMemoryMembershipRepository([{ userId: id, councilId: COUNCIL_A, role: "council_operator" }], [{ id, fullName: "Pessoa teste", active: true }]);
    const audit = new AuditService(new InMemoryAuditRepository(() => new Date("2026-11-26T12:00:00Z")));
    const service = new MembershipService(repository, new InMemoryCouncilRepository(), audit);
    const before = await service.reportDirectory(managerOf(COUNCIL_A));
    expect(before.ok && before.data[0]?.staffCategory).toBeUndefined();
    expect((await service.setStaffCategory(managerOf(COUNCIL_A), { userId: id, category: "intern" })).ok).toBe(false);
    expect((await service.setStaffCategory(centralAdmin(), { userId: id, category: "intern" })).ok).toBe(true);
    const after = await service.reportDirectory(managerOf(COUNCIL_A));
    expect(after.ok && after.data[0]?.staffCategory).toBe("intern");
    const outsider = await service.reportDirectory(managerOf(COUNCIL_B));
    expect(outsider.ok && outsider.data).toEqual([]);
  });
});
