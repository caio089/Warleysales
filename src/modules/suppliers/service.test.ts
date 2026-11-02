import { describe, expect, it } from "vitest";
import { InMemoryAuditRepository } from "@/modules/audit/repository.memory";
import { AuditService } from "@/modules/audit/service";
import { COUNCIL_A, makeActor, makeRuntime, managerOf, operatorOf, viewerOf } from "@/shared/testing/fixtures";
import { InMemorySupplierRepository } from "./repository.memory";
import { SupplierService } from "./service";

const setup = () => { const rt = makeRuntime(); return new SupplierService(new InMemorySupplierRepository(), new AuditService(new InMemoryAuditRepository(rt.now)), rt); };
const valid = { name: "Papelaria Central Ltda", cnpj: "11.222.333/0001-81", email: "contato@papelaria.com.br" };

describe("SupplierService", () => {
  it("cria fornecedor normalizando o CNPJ", async () => {
    const r = await setup().create(managerOf(COUNCIL_A), valid);
    expect(r.ok && r.data.cnpj).toBe("11222333000181");
  });
  it("CNPJ é único globalmente (P8)", async () => {
    const s = setup();
    await s.create(managerOf(COUNCIL_A), valid);
    const dup = await s.create(makeActor({ isCentralAdmin: true }), { ...valid, name: "Outra Empresa", cnpj: "11222333000181" });
    expect(!dup.ok && dup.code).toBe("CONFLICT");
  });
  it("CNPJ opcional, mas se informado deve ser válido", async () => {
    const s = setup();
    expect((await s.create(managerOf(COUNCIL_A), { name: "Sem CNPJ Ltda" })).ok).toBe(true);
    const bad = await s.create(managerOf(COUNCIL_A), { name: "CNPJ ruim", cnpj: "11.222.333/0001-82" });
    expect(!bad.ok && bad.fieldErrors?.cnpj).toBeDefined();
  });
  it("somente gestor/admin escrevem; consulta e operador não", async () => {
    const s = setup();
    expect((await s.create(operatorOf(COUNCIL_A), valid)).ok).toBe(false);
    expect((await s.create(viewerOf(COUNCIL_A), valid)).ok).toBe(false);
    expect((await s.list(viewerOf(COUNCIL_A))).ok).toBe(true);
    expect((await s.list(makeActor())).ok).toBe(false);
  });
  it("atualiza e desativa", async () => {
    const s = setup();
    const created = await s.create(managerOf(COUNCIL_A), valid);
    if (!created.ok) throw new Error();
    const r = await s.update(managerOf(COUNCIL_A), { supplierId: created.data.id, name: "Novo Nome Ltda", cnpj: valid.cnpj, active: false });
    expect(r.ok && r.data).toMatchObject({ name: "Novo Nome Ltda", active: false });
  });
});
