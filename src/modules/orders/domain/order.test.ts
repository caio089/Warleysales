import { describe, expect, it } from "vitest";
import {
  approveMaterialOrder,
  cancelMaterialOrder,
  createMaterialOrder,
  rejectMaterialOrder,
  type MaterialOrder,
} from "./order";

describe("MaterialOrder — criação de pedido", () => {
  const councilId = "11111111-1111-4111-8111-111111111111";
  const requestedBy = "22222222-2222-4222-8222-222222222222";
  const materialId = "33333333-3333-4333-8333-333333333333";

  it("cria pedido válido com status pendente e campos iniciais corretos", () => {
    const res = createMaterialOrder({
      id: "ord-1",
      number: "PED-2026-001",
      councilId,
      requestedBy,
      notes: "Material para expediente",
      items: [{ materialId, quantity: 10 }],
    });

    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.data.id).toBe("ord-1");
    expect(res.data.number).toBe("PED-2026-001");
    expect(res.data.councilId).toBe(councilId);
    expect(res.data.requestedBy).toBe(requestedBy);
    expect(res.data.status).toBe("pendente");
    expect(res.data.notes).toBe("Material para expediente");
    expect(res.data.reviewedBy).toBeNull();
    expect(res.data.reviewedAt).toBeNull();
    expect(res.data.rejectionReason).toBeNull();
    expect(res.data.items).toHaveLength(1);
    expect(res.data.items[0]).toEqual(
      expect.objectContaining({
        orderId: "ord-1",
        materialId,
        quantity: 10,
      }),
    );
  });

  it("gera id e number automaticamente quando omitidos", () => {
    const res = createMaterialOrder({
      councilId,
      requestedBy,
      items: [{ materialId, quantity: 5 }],
    });

    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.data.id).toBeTruthy();
    expect(res.data.number).toBeTruthy();
    expect(res.data.items[0].orderId).toBe(res.data.id);
  });

  it("rejeita pedido sem itens", () => {
    const res = createMaterialOrder({
      councilId,
      requestedBy,
      items: [],
    });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.code).toBe("VALIDATION");
    }
  });

  it("rejeita quantidade zero ou negativa no item", () => {
    const zero = createMaterialOrder({
      councilId,
      requestedBy,
      items: [{ materialId, quantity: 0 }],
    });
    expect(zero.ok).toBe(false);

    const negative = createMaterialOrder({
      councilId,
      requestedBy,
      items: [{ materialId, quantity: -5 }],
    });
    expect(negative.ok).toBe(false);
  });

  it("rejeita pedido sem councilId ou requestedBy", () => {
    const noCouncil = createMaterialOrder({
      councilId: "",
      requestedBy,
      items: [{ materialId, quantity: 5 }],
    });
    expect(noCouncil.ok).toBe(false);

    const noRequester = createMaterialOrder({
      councilId,
      requestedBy: "  ",
      items: [{ materialId, quantity: 5 }],
    });
    expect(noRequester.ok).toBe(false);
  });

  it("valida contra saldo liberado (available = physical - reserved) quando informado", () => {
    // Saldo disponível = 20 - 5 = 15
    const balance = { physical: 20, reserved: 5, blocked: 10 };

    // Solicitando 15 (exatamente o disponível) -> OK
    const okRes = createMaterialOrder({
      councilId,
      requestedBy,
      items: [{ materialId, quantity: 15, availableStock: balance }],
    });
    expect(okRes.ok).toBe(true);

    // Solicitando 15.001 (acima do disponível) -> Falha por saldo insuficiente
    const failRes = createMaterialOrder({
      councilId,
      requestedBy,
      items: [{ materialId, quantity: 15.001, availableStock: balance }],
    });
    expect(failRes.ok).toBe(false);
    if (!failRes.ok) {
      expect(failRes.code).toBe("INSUFFICIENT_BALANCE");
    }
  });

  it("valida contra mapa/registro de saldos disponíveis", () => {
    const balances = {
      [materialId]: { physical: 10, reserved: 2, blocked: 0 }, // available = 8
    };

    const failRes = createMaterialOrder(
      {
        councilId,
        requestedBy,
        items: [{ materialId, quantity: 9 }],
      },
      balances,
    );
    expect(failRes.ok).toBe(false);
    if (!failRes.ok) {
      expect(failRes.code).toBe("INSUFFICIENT_BALANCE");
    }
  });
});

describe("MaterialOrder — transições de estado", () => {
  const baseOrder: MaterialOrder = {
    id: "ord-test",
    number: "PED-2026-001",
    councilId: "council-1",
    status: "pendente",
    requestedBy: "user-1",
    notes: null,
    reviewedBy: null,
    reviewedAt: null,
    rejectionReason: null,
    items: [{ id: "item-1", orderId: "ord-test", materialId: "mat-1", quantity: 5 }],
    createdAt: new Date("2026-11-10T10:00:00Z"),
    updatedAt: new Date("2026-11-10T10:00:00Z"),
  };

  const reviewerId = "warley-central-admin";

  it("aprova pedido pendente com sucesso registrando reviewer e reviewedAt", () => {
    const reviewDate = new Date("2026-11-10T12:00:00Z");
    const res = approveMaterialOrder(baseOrder, reviewerId, reviewDate);

    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.data.status).toBe("aprovado");
    expect(res.data.reviewedBy).toBe(reviewerId);
    expect(res.data.reviewedAt).toEqual(reviewDate);
    expect(res.data.rejectionReason).toBeNull();
  });

  it("rejeita aprovação se reviewerId for vazio", () => {
    const res = approveMaterialOrder(baseOrder, "   ");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.code).toBe("VALIDATION");
    }
  });

  it("rejeita pedido pendente com sucesso exigindo motivo da recusa", () => {
    const reviewDate = new Date("2026-11-10T12:00:00Z");
    const res = rejectMaterialOrder(baseOrder, reviewerId, "Saldo reservado para emergência", reviewDate);

    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.data.status).toBe("rejeitado");
    expect(res.data.reviewedBy).toBe(reviewerId);
    expect(res.data.reviewedAt).toEqual(reviewDate);
    expect(res.data.rejectionReason).toBe("Saldo reservado para emergência");
  });

  it("rejeita rejeição se motivo for vazio ou ausente", () => {
    const res = rejectMaterialOrder(baseOrder, reviewerId, "   ");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.code).toBe("VALIDATION");
    }
  });

  it("cancela pedido pendente com sucesso", () => {
    const cancelDate = new Date("2026-11-10T11:00:00Z");
    const res = cancelMaterialOrder(baseOrder, cancelDate);

    expect(res.ok).toBe(true);
    if (!res.ok) return;

    expect(res.data.status).toBe("cancelado");
    expect(res.data.updatedAt).toEqual(cancelDate);
  });

  it("impede transições a partir de estados finais (aprovado, rejeitado, cancelado)", () => {
    const approvedOrder: MaterialOrder = { ...baseOrder, status: "aprovado", reviewedBy: reviewerId };
    const rejectedOrder: MaterialOrder = { ...baseOrder, status: "rejeitado", reviewedBy: reviewerId, rejectionReason: "X" };
    const canceledOrder: MaterialOrder = { ...baseOrder, status: "cancelado" };

    // Tentativas a partir de aprovado
    expect(approveMaterialOrder(approvedOrder, reviewerId).ok).toBe(false);
    expect(rejectMaterialOrder(approvedOrder, reviewerId, "motivo").ok).toBe(false);
    expect(cancelMaterialOrder(approvedOrder).ok).toBe(false);

    // Tentativas a partir de rejeitado
    expect(approveMaterialOrder(rejectedOrder, reviewerId).ok).toBe(false);
    expect(rejectMaterialOrder(rejectedOrder, reviewerId, "motivo").ok).toBe(false);
    expect(cancelMaterialOrder(rejectedOrder).ok).toBe(false);

    // Tentativas a partir de cancelado
    expect(approveMaterialOrder(canceledOrder, reviewerId).ok).toBe(false);
    expect(rejectMaterialOrder(canceledOrder, reviewerId, "motivo").ok).toBe(false);
    expect(cancelMaterialOrder(canceledOrder).ok).toBe(false);
  });
});
