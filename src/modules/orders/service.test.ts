import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryAuditRepository } from "@/modules/audit/repository.memory";
import { AuditService } from "@/modules/audit/service";
import { InMemoryInventoryRepository } from "@/modules/inventory/repository.memory";
import { InventoryService } from "@/modules/inventory/service";
import {
  COUNCIL_A,
  COUNCIL_B,
  centralAdmin,
  makeActor,
  makeRuntime,
  managerOf,
  operatorOf,
  viewerOf,
} from "@/shared/testing/fixtures";
import { InMemoryMaterialOrderRepository } from "./repository.memory";
import { MaterialOrderService } from "./service";

const MATERIAL_1 = "33333333-3333-4333-8333-111111111111";
const MATERIAL_2 = "33333333-3333-4333-8333-222222222222";

function setup() {
  const runtime = makeRuntime();
  const auditRepo = new InMemoryAuditRepository(runtime.now);
  const audit = new AuditService(auditRepo);
  const invRepo = new InMemoryInventoryRepository(runtime.now);
  const inventory = new InventoryService(invRepo, audit, runtime);
  const orderRepo = new InMemoryMaterialOrderRepository(runtime.now);
  const orders = new MaterialOrderService(orderRepo, inventory, audit, runtime);
  return { runtime, auditRepo, audit, invRepo, inventory, orderRepo, orders };
}

type Ctx = ReturnType<typeof setup>;

async function seedStock(ctx: Ctx, councilId: string, materialId: string, quantity: number) {
  const r = await ctx.inventory.applyInternal({
    councilId,
    materialId,
    type: "entry",
    quantity,
    idempotencyKey: `seed-${councilId}-${materialId}-${quantity}`,
    reason: "Carga inicial de teste",
    reference: null,
    actorId: null,
  });
  if (!r.ok) throw new Error(r.message);
}

async function getStockLevel(ctx: Ctx, councilId: string, materialId: string) {
  const levels = await ctx.inventory.listLevels(centralAdmin(), councilId);
  if (!levels.ok) throw new Error(levels.message);
  return levels.data.find((l) => l.materialId === materialId);
}

let ctx: Ctx;

beforeEach(async () => {
  ctx = setup();
  await seedStock(ctx, COUNCIL_A, MATERIAL_1, 50);
  await seedStock(ctx, COUNCIL_A, MATERIAL_2, 30);
});

describe("MaterialOrderService — criação de pedidos (R11/R12)", () => {
  it("operador do conselho cria pedido com sucesso, gerando número sequencial e reservando saldo", async () => {
    const operator = operatorOf(COUNCIL_A);

    const res = await ctx.orders.create(operator, {
      councilId: COUNCIL_A,
      notes: "Material para atendimento",
      items: [{ materialId: MATERIAL_1, quantity: 15 }],
    });

    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.data.status).toBe("pendente");
    expect(res.data.number).toMatch(/^PED-\d{4}-001$/);
    expect(res.data.requestedBy).toBe(operator.userId);
    expect(res.data.councilId).toBe(COUNCIL_A);
    expect(res.data.items).toHaveLength(1);
    expect(res.data.items[0].quantity).toBe(15);

    // Verifica reserva atômica no estoque
    const stock1 = await getStockLevel(ctx, COUNCIL_A, MATERIAL_1);
    expect(stock1).toMatchObject({
      physical: 50,
      reserved: 15,
      available: 35,
    });

    // Verifica auditoria gravada
    const auditRes = await ctx.audit.list(centralAdmin());
    expect(auditRes.ok).toBe(true);
    if (auditRes.ok) {
      expect(
        auditRes.data.some(
          (e) => e.action === "material_order.create" && e.entityId === res.data.id,
        ),
      ).toBe(true);
    }
  });

  it("gera numeração sequencial crescente para pedidos sucessivos do mesmo órgão", async () => {
    const operator = operatorOf(COUNCIL_A);

    const res1 = await ctx.orders.create(operator, {
      councilId: COUNCIL_A,
      items: [{ materialId: MATERIAL_1, quantity: 5 }],
    });
    const res2 = await ctx.orders.create(operator, {
      councilId: COUNCIL_A,
      items: [{ materialId: MATERIAL_1, quantity: 5 }],
    });

    expect(res1.ok).toBe(true);
    if (res1.ok) expect(res1.data.number).toMatch(/^PED-\d{4}-001$/);
    expect(res2.ok).toBe(true);
    if (res2.ok) expect(res2.data.number).toMatch(/^PED-\d{4}-002$/);
  });

  it("suporta pedido com múltiplos itens reservando todos atomicamente", async () => {
    const operator = operatorOf(COUNCIL_A);

    const res = await ctx.orders.create(operator, {
      councilId: COUNCIL_A,
      items: [
        { materialId: MATERIAL_1, quantity: 10 },
        { materialId: MATERIAL_2, quantity: 20 },
      ],
    });

    expect(res.ok).toBe(true);
    const stock1 = await getStockLevel(ctx, COUNCIL_A, MATERIAL_1);
    const stock2 = await getStockLevel(ctx, COUNCIL_A, MATERIAL_2);

    expect(stock1?.reserved).toBe(10);
    expect(stock1?.available).toBe(40);
    expect(stock2?.reserved).toBe(20);
    expect(stock2?.available).toBe(10);
  });

  it("rejeita pedido se o saldo disponível for insuficiente para qualquer item", async () => {
    const operator = operatorOf(COUNCIL_A);

    const res = await ctx.orders.create(operator, {
      councilId: COUNCIL_A,
      items: [{ materialId: MATERIAL_1, quantity: 60 }], // só há 50
    });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.code).toBe("INSUFFICIENT_BALANCE");
    }

    // Saldo inalterado
    const stock1 = await getStockLevel(ctx, COUNCIL_A, MATERIAL_1);
    expect(stock1?.reserved).toBe(0);
    expect(stock1?.available).toBe(50);
  });

  it("rejeita criação se o ator não tiver permissão 'stock.move' no órgão", async () => {
    const viewer = viewerOf(COUNCIL_A);

    const res = await ctx.orders.create(viewer, {
      councilId: COUNCIL_A,
      items: [{ materialId: MATERIAL_1, quantity: 10 }],
    });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.code).toBe("FORBIDDEN");
    }
  });

  it("rejeita pedido sem itens ou com quantidade inválida", async () => {
    const operator = operatorOf(COUNCIL_A);

    const noItems = await ctx.orders.create(operator, {
      councilId: COUNCIL_A,
      items: [],
    });
    expect(noItems.ok).toBe(false);
    if (!noItems.ok) expect(noItems.code).toBe("VALIDATION");

    const zeroQty = await ctx.orders.create(operator, {
      councilId: COUNCIL_A,
      items: [{ materialId: MATERIAL_1, quantity: 0 }],
    });
    expect(zeroQty.ok).toBe(false);
    if (!zeroQty.ok) expect(zeroQty.code).toBe("VALIDATION");
  });
});

describe("MaterialOrderService — homologação e despacho por Warley", () => {
  it("aprovação exclusiva de Warley: baixa o reservado e físico e registra no ledger", async () => {
    const operator = operatorOf(COUNCIL_A);
    const warley = centralAdmin();

    const created = await ctx.orders.create(operator, {
      councilId: COUNCIL_A,
      items: [{ materialId: MATERIAL_1, quantity: 20 }],
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const res = await ctx.orders.approve(warley, created.data.id);
    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.data.status).toBe("aprovado");
    expect(res.data.reviewedBy).toBe(warley.userId);
    expect(res.data.reviewedAt).toBeInstanceOf(Date);

    // Estoque: baixou 20 do reservado e 20 do físico
    const stock1 = await getStockLevel(ctx, COUNCIL_A, MATERIAL_1);
    expect(stock1).toMatchObject({
      physical: 30,
      reserved: 0,
      available: 30,
    });

    // Ledger físico: movimentação transfer_out registrada
    const movements = await ctx.inventory.listMovements(warley, COUNCIL_A);
    expect(movements.ok).toBe(true);
    if (movements.ok) {
      const out = movements.data.find(
        (m) => m.reference === created.data.id && m.type === "transfer_out",
      );
      expect(out).toBeDefined();
      expect(out?.quantity).toBe(20);
      expect(out?.reason).toContain("Expedição de Pedido de Material Homologada por Warley");
    }

    // Auditoria
    const auditRes = await ctx.audit.list(warley);
    expect(auditRes.ok).toBe(true);
    if (auditRes.ok) {
      expect(
        auditRes.data.some(
          (e) => e.action === "material_order.approve" && e.entityId === created.data.id,
        ),
      ).toBe(true);
    }
  });

  it("rejeita tentativa de aprovação por usuário comum ou gestor (não-Warley)", async () => {
    const operator = operatorOf(COUNCIL_A);
    const manager = managerOf(COUNCIL_A);

    const created = await ctx.orders.create(operator, {
      councilId: COUNCIL_A,
      items: [{ materialId: MATERIAL_1, quantity: 10 }],
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const res = await ctx.orders.approve(manager, created.data.id);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.code).toBe("FORBIDDEN");
    }

    // Pedido continua pendente
    const fetched = await ctx.orders.get(operator, created.data.id);
    expect(fetched.ok && fetched.data.status).toBe("pendente");
  });

  it("rejeita aprovação de pedido já aprovado", async () => {
    const operator = operatorOf(COUNCIL_A);
    const warley = centralAdmin();

    const created = await ctx.orders.create(operator, {
      councilId: COUNCIL_A,
      items: [{ materialId: MATERIAL_1, quantity: 10 }],
    });
    if (!created.ok) return;

    const first = await ctx.orders.approve(warley, created.data.id);
    expect(first.ok).toBe(true);

    const second = await ctx.orders.approve(warley, created.data.id);
    expect(second.ok).toBe(false);
    if (!second.ok) {
      expect(second.code).toBe("INVALID_STATE");
    }
  });

  it("rejeita aprovação de pedido inexistente", async () => {
    const warley = centralAdmin();
    const res = await ctx.orders.approve(warley, "ord-inexistente");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.code).toBe("NOT_FOUND");
    }
  });
});

describe("MaterialOrderService — recusa/rejeição por Warley", () => {
  it("rejeição por Warley com motivo formal estorna a reserva para disponível", async () => {
    const operator = operatorOf(COUNCIL_A);
    const warley = centralAdmin();

    const created = await ctx.orders.create(operator, {
      councilId: COUNCIL_A,
      items: [{ materialId: MATERIAL_1, quantity: 20 }],
    });
    if (!created.ok) return;

    const res = await ctx.orders.reject(
      warley,
      created.data.id,
      "Cota mensal atingida pelo órgão solicitante",
    );
    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.data.status).toBe("rejeitado");
    expect(res.data.rejectionReason).toBe("Cota mensal atingida pelo órgão solicitante");
    expect(res.data.reviewedBy).toBe(warley.userId);

    // Reserva deve ser devolvida para disponível
    const stock1 = await getStockLevel(ctx, COUNCIL_A, MATERIAL_1);
    expect(stock1).toMatchObject({
      physical: 50,
      reserved: 0,
      available: 50,
    });

    // Auditoria
    const auditRes = await ctx.audit.list(warley);
    expect(auditRes.ok).toBe(true);
    if (auditRes.ok) {
      expect(
        auditRes.data.some(
          (e) => e.action === "material_order.reject" && e.entityId === created.data.id,
        ),
      ).toBe(true);
    }
  });

  it("rejeita tentativa de recusa sem justificativa formal (>= 5 caracteres)", async () => {
    const operator = operatorOf(COUNCIL_A);
    const warley = centralAdmin();

    const created = await ctx.orders.create(operator, {
      councilId: COUNCIL_A,
      items: [{ materialId: MATERIAL_1, quantity: 10 }],
    });
    if (!created.ok) return;

    const resEmpty = await ctx.orders.reject(warley, created.data.id, "");
    expect(resEmpty.ok).toBe(false);
    if (!resEmpty.ok) expect(resEmpty.code).toBe("VALIDATION");

    const resShort = await ctx.orders.reject(warley, created.data.id, "abc");
    expect(resShort.ok).toBe(false);
    if (!resShort.ok) expect(resShort.code).toBe("VALIDATION");
  });

  it("impede que não-Warley rejeite pedidos", async () => {
    const operator = operatorOf(COUNCIL_A);
    const manager = managerOf(COUNCIL_A);

    const created = await ctx.orders.create(operator, {
      councilId: COUNCIL_A,
      items: [{ materialId: MATERIAL_1, quantity: 10 }],
    });
    if (!created.ok) return;

    const res = await ctx.orders.reject(manager, created.data.id, "Motivo qualquer");
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.code).toBe("FORBIDDEN");
  });
});

describe("MaterialOrderService — cancelamento pelo solicitante", () => {
  it("solicitante cancela pedido pendente e saldo reservado é estornado", async () => {
    const operator = operatorOf(COUNCIL_A);

    const created = await ctx.orders.create(operator, {
      councilId: COUNCIL_A,
      items: [{ materialId: MATERIAL_1, quantity: 20 }],
    });
    if (!created.ok) return;

    const res = await ctx.orders.cancel(operator, created.data.id);
    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.data.status).toBe("cancelado");

    // Saldo reservado volta para disponível
    const stock1 = await getStockLevel(ctx, COUNCIL_A, MATERIAL_1);
    expect(stock1?.reserved).toBe(0);
    expect(stock1?.available).toBe(50);

    // Auditoria
    const auditRes = await ctx.audit.list(centralAdmin());
    expect(auditRes.ok).toBe(true);
    if (auditRes.ok) {
      expect(
        auditRes.data.some(
          (e) => e.action === "material_order.cancel" && e.entityId === created.data.id,
        ),
      ).toBe(true);
    }
  });

  it("impede operador de outro conselho de cancelar o pedido", async () => {
    const operatorA = operatorOf(COUNCIL_A);
    const operatorB = operatorOf(COUNCIL_B);

    const created = await ctx.orders.create(operatorA, {
      councilId: COUNCIL_A,
      items: [{ materialId: MATERIAL_1, quantity: 10 }],
    });
    if (!created.ok) return;

    const res = await ctx.orders.cancel(operatorB, created.data.id);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.code).toBe("FORBIDDEN");
  });

  it("impede cancelamento de pedido já aprovado", async () => {
    const operator = operatorOf(COUNCIL_A);
    const warley = centralAdmin();

    const created = await ctx.orders.create(operator, {
      councilId: COUNCIL_A,
      items: [{ materialId: MATERIAL_1, quantity: 10 }],
    });
    if (!created.ok) return;

    await ctx.orders.approve(warley, created.data.id);

    const res = await ctx.orders.cancel(operator, created.data.id);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.code).toBe("INVALID_STATE");
  });
});

describe("MaterialOrderService — isolamento multi-tenant (R14) e listagem", () => {
  it("operador de conselho B não pode consultar pedido do conselho A", async () => {
    const operatorA = operatorOf(COUNCIL_A);
    const operatorB = operatorOf(COUNCIL_B);

    const created = await ctx.orders.create(operatorA, {
      councilId: COUNCIL_A,
      items: [{ materialId: MATERIAL_1, quantity: 5 }],
    });
    if (!created.ok) return;

    const getB = await ctx.orders.get(operatorB, created.data.id);
    expect(getB.ok).toBe(false);
    if (!getB.ok) expect(getB.code).toBe("FORBIDDEN");

    const getA = await ctx.orders.get(operatorA, created.data.id);
    expect(getA.ok).toBe(true);

    const getWarley = await ctx.orders.get(centralAdmin(), created.data.id);
    expect(getWarley.ok).toBe(true);
  });

  it("listagem isola pedidos por conselho e Warley visualiza todos", async () => {
    const operatorA = operatorOf(COUNCIL_A);
    const operatorB = operatorOf(COUNCIL_B);
    const warley = centralAdmin();

    await seedStock(ctx, COUNCIL_B, MATERIAL_1, 50);

    await ctx.orders.create(operatorA, {
      councilId: COUNCIL_A,
      items: [{ materialId: MATERIAL_1, quantity: 5 }],
    });

    await ctx.orders.create(operatorB, {
      councilId: COUNCIL_B,
      items: [{ materialId: MATERIAL_1, quantity: 8 }],
    });

    const listA = await ctx.orders.list(operatorA);
    expect(listA.ok).toBe(true);
    if (listA.ok) {
      expect(listA.data).toHaveLength(1);
      expect(listA.data[0].councilId).toBe(COUNCIL_A);
    }

    const listB = await ctx.orders.list(operatorB);
    expect(listB.ok).toBe(true);
    if (listB.ok) {
      expect(listB.data).toHaveLength(1);
      expect(listB.data[0].councilId).toBe(COUNCIL_B);
    }

    const listWarley = await ctx.orders.list(warley);
    expect(listWarley.ok).toBe(true);
    if (listWarley.ok) {
      expect(listWarley.data).toHaveLength(2);
    }

    // Tentativa do operador A de filtrar conselho B
    const illegalFilter = await ctx.orders.list(operatorA, { councilId: COUNCIL_B });
    expect(illegalFilter.ok).toBe(false);
    if (!illegalFilter.ok) expect(illegalFilter.code).toBe("FORBIDDEN");
  });
});
