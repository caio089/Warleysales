import { describe, expect, it } from "vitest";
import { InMemoryAuditRepository } from "@/modules/audit/repository.memory";
import { AuditService } from "@/modules/audit/service";
import { centralAdmin, makeActor, makeRuntime, managerOf, COUNCIL_A } from "@/shared/testing/fixtures";
import { InMemoryCouncilRepository, InMemoryMembershipRepository } from "./repository.memory";
import { CouncilService, MembershipService } from "./service";

function setup() {
  const runtime = makeRuntime();
  return new CouncilService(new InMemoryCouncilRepository(), new AuditService(new InMemoryAuditRepository(runtime.now)), runtime);
}

const base = { name: "Conselho Regional de Fortaleza", acronym: "CRF" };

describe("CouncilService", () => {
  it("grava o WhatsApp normalizado em E.164", async () => {
    const created = await setup().create(centralAdmin(), { ...base, whatsappE164: "(85) 99999-9999" });
    expect(created.ok && created.data.whatsappE164).toBe("5585999999999");
  });
  it("WhatsApp é opcional e inválido é recusado", async () => {
    const service = setup();
    expect((await service.create(centralAdmin(), base)).ok).toBe(true);
    const bad = await service.create(centralAdmin(), { name: "Outro Conselho", acronym: "OUT", whatsappE164: "123" });
    expect(!bad.ok && bad.fieldErrors?.whatsappE164).toBeDefined();
  });
  it("somente admin central cadastra", async () => {
    expect((await setup().create(managerOf(COUNCIL_A), base)).ok).toBe(false);
    expect((await setup().create(makeActor(), base)).ok).toBe(false);
  });
});

describe("MembershipService", () => {
  it("admin central vincula e remove; gestor não", async () => {
    const runtime = makeRuntime();
    const audit = new AuditService(new InMemoryAuditRepository(runtime.now));
    const councils = new InMemoryCouncilRepository();
    await new CouncilService(councils, audit, runtime).create(centralAdmin(), { name: "Conselho A", acronym: "CRA" });
    const [council] = await councils.list("all");
    const userId = crypto.randomUUID();
    const memberships = new InMemoryMembershipRepository([], [{ id: userId, fullName: "Operador", active: true }]);
    const service = new MembershipService(memberships, councils, audit);
    expect((await service.assign(managerOf(COUNCIL_A), { userId, councilId: council!.id, role: "council_operator" })).ok).toBe(false);
    expect((await service.assign(centralAdmin(), { userId, councilId: council!.id, role: "council_operator" })).ok).toBe(true);
    const dir = await service.directory(centralAdmin());
    expect(dir.ok && dir.data.memberships).toHaveLength(1);
    expect((await service.remove(centralAdmin(), { userId, councilId: council!.id })).ok).toBe(true);
  });
});
