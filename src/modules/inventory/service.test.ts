import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryAuditRepository } from "@/modules/audit/repository.memory";
import { AuditService } from "@/modules/audit/service";
import { COUNCIL_A, COUNCIL_B, centralAdmin, makeRuntime, managerOf, operatorOf, viewerOf } from "@/shared/testing/fixtures";
import { InMemoryInventoryRepository } from "./repository.memory";
import { InventoryService } from "./service";

function setup() {
  const runtime = makeRuntime();
  const repo = new InMemoryInventoryRepository(runtime.now);
  const audit = new AuditService(new InMemoryAuditRepository(runtime.now));
  return { repo, service: new InventoryService(repo, audit, runtime) };
}
let ctx: ReturnType<typeof setup>;
let materialId: string;
beforeEach(async () => {
  ctx = setup();
  const m = await ctx.service.createMaterial(managerOf(COUNCIL_A), { code: "PAP-001", name: "Papel A4", unit: "resma" });
  if (!m.ok) throw new Error(m.message);
  materialId = m.data.id;
});
const move = (actor = operatorOf(COUNCIL_A), overrides: object = {}) =>
  ctx.service.registerMovement(actor, { councilId: COUNCIL_A, materialId, type: "entry", quantity: 10, idempotencyKey: "chave-0001", reason: "Compra", ...overrides });

describe("InventoryService", () => {
  it("entrada e consumo atualizam saldo e ledger", async () => {
    await move();
    const r = await move(operatorOf(COUNCIL_A), { type: "consumption", quantity: 4, idempotencyKey: "chave-0002", reason: "Uso mensal" });
    expect(r.ok && r.data.physical).toBe(6);
    expect(await ctx.repo.listMovements()).toHaveLength(2);
  });
  it("não permite saldo negativo", async () => {
    const r = await move(operatorOf(COUNCIL_A), { type: "consumption", quantity: 1, idempotencyKey: "chave-0009", reason: "Uso" });
    expect(!r.ok && r.code).toBe("INSUFFICIENT_BALANCE");
  });
  it("é idempotente: reenvio com a mesma chave não duplica", async () => {
    await move();
    const again = await move();
    expect(again.ok && again.data.duplicate).toBe(true);
    expect(again.ok && again.data.physical).toBe(10);
    expect(await ctx.repo.listMovements()).toHaveLength(1);
  });
  it("concorrência: consumos simultâneos não geram saldo negativo", async () => {
    await move();
    const results = await Promise.all(Array.from({ length: 5 }, (_, i) => move(operatorOf(COUNCIL_A), { type: "consumption", quantity: 3, idempotencyKey: `consumo-${i}-xx`, reason: "Uso" })));
    expect(results.filter((r) => r.ok)).toHaveLength(3); // 10 / 3 = 3 consumos possíveis
    const levels = await ctx.service.listLevels(centralAdmin(), COUNCIL_A);
    expect(levels.ok && levels.data[0]!.physical).toBe(1);
  });
  it("ajuste exige gestor; consulta e operador de outro conselho são negados", async () => {
    expect((await move(operatorOf(COUNCIL_A), { type: "adjustment_in", idempotencyKey: "ajuste-001" })).ok).toBe(false);
    expect((await move(managerOf(COUNCIL_A), { type: "adjustment_in", idempotencyKey: "ajuste-002" })).ok).toBe(true);
    expect((await move(viewerOf(COUNCIL_A), { idempotencyKey: "chave-0003" })).ok).toBe(false);
    expect((await move(operatorOf(COUNCIL_B), { idempotencyKey: "chave-0004" })).ok).toBe(false);
  });
  it("exige motivo e quantidade positiva", async () => {
    expect((await move(operatorOf(COUNCIL_A), { reason: "" })).ok).toBe(false);
    expect((await move(operatorOf(COUNCIL_A), { quantity: -1 })).ok).toBe(false);
  });
  it("níveis usam o disponível e respeitam o conselho do leitor", async () => {
    await move(managerOf(COUNCIL_A), { quantity: 4 });
    await ctx.service.setMinimum(managerOf(COUNCIL_A), { councilId: COUNCIL_A, materialId, minimum: 10 });
    const levels = await ctx.service.listLevels(viewerOf(COUNCIL_A));
    expect(levels.ok && levels.data[0]).toMatchObject({ available: 4, level: "critico" });
    expect((await ctx.service.listLevels(viewerOf(COUNCIL_B), COUNCIL_A)).ok).toBe(false);
  });
  it("reconciliação detecta divergência entre saldo e ledger", async () => {
    await move();
    expect(await ctx.service.reconcile()).toEqual([]);
    ctx.repo.corruptPhysical({ councilId: COUNCIL_A, materialId }, 99);
    const issues = await ctx.service.reconcile();
    expect(issues[0]).toMatchObject({ stored: 99, fromLedger: 10, difference: 89 });
  });
  it("código de material duplicado é conflito", async () => {
    const dup = await ctx.service.createMaterial(managerOf(COUNCIL_A), { code: "PAP-001", name: "Outro", unit: "un" });
    expect(!dup.ok && dup.code).toBe("CONFLICT");
  });
});
