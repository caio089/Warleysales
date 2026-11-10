import { describe, expect, it, vi, beforeEach } from "vitest";

const mockRunAction = vi.fn();
vi.mock("@/server/action-runner", () => ({
  runAction: (...args: unknown[]) => mockRunAction(...args),
}));

const mockRevalidatePath = vi.fn();
vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}));

import {
  createMaterialOrderAction,
  approveMaterialOrderAction,
  rejectMaterialOrderAction,
  cancelMaterialOrderAction,
} from "./actions";

describe("orders actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createMaterialOrderAction", () => {
    it("extrai valores de objeto direto e executa serviço de criação", async () => {
      mockRunAction.mockResolvedValueOnce({
        status: "success",
        message: "Pedido de material criado com sucesso.",
        data: { id: "order-1", number: "PED-2026-001" },
      });

      const res = await createMaterialOrderAction({
        councilId: "council-a",
        notes: "Urgente para fiscalização",
        items: [{ materialId: "mat-1", quantity: 10 }],
      });

      expect(res.status).toBe("success");
      expect(mockRunAction).toHaveBeenCalled();
      expect(mockRevalidatePath).toHaveBeenCalledWith("/meu-conselho");
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard");
      expect(mockRevalidatePath).toHaveBeenCalledWith("/estoque");

      // Test runner callback
      const callback = mockRunAction.mock.calls[0][0];
      const mockServices = {
        orders: {
          create: vi.fn().mockResolvedValue({ ok: true, data: {} }),
        },
      };
      await callback({ services: mockServices, actor: { userId: "user-1" } });

      expect(mockServices.orders.create).toHaveBeenCalledWith(
        { userId: "user-1" },
        expect.objectContaining({
          councilId: "council-a",
          notes: "Urgente para fiscalização",
          items: [{ materialId: "mat-1", quantity: 10 }],
        }),
      );
    });

    it("extrai valores a partir de FormData com múltiplos itens e revalida", async () => {
      mockRunAction.mockResolvedValueOnce({
        status: "success",
        message: "Pedido criado com sucesso.",
        data: { id: "order-2" },
      });

      const fd = new FormData();
      fd.set("councilId", "council-b");
      fd.set("notes", "Consumo regular");
      fd.append("materialId", "mat-1");
      fd.append("quantity", "5");
      fd.append("materialId", "mat-2");
      fd.append("quantity", "15");

      const res = await createMaterialOrderAction({ status: "idle" }, fd);
      expect(res.status).toBe("success");
      expect(mockRevalidatePath).toHaveBeenCalledWith("/meu-conselho");

      const callback = mockRunAction.mock.calls[0][0];
      const mockServices = {
        orders: {
          create: vi.fn().mockResolvedValue({ ok: true, data: {} }),
        },
      };
      await callback({ services: mockServices, actor: { userId: "user-2" } });

      expect(mockServices.orders.create).toHaveBeenCalledWith(
        { userId: "user-2" },
        expect.objectContaining({
          councilId: "council-b",
          notes: "Consumo regular",
          items: [
            { materialId: "mat-1", quantity: 5 },
            { materialId: "mat-2", quantity: 15 },
          ],
        }),
      );
    });

    it("não revalida rotas se runAction retornar erro", async () => {
      mockRunAction.mockResolvedValueOnce({
        status: "error",
        message: "Saldo insuficiente.",
      });

      const res = await createMaterialOrderAction({
        councilId: "council-a",
        items: [{ materialId: "mat-1", quantity: 9999 }],
      });

      expect(res.status).toBe("error");
      expect(mockRevalidatePath).not.toHaveBeenCalled();
    });
  });

  describe("approveMaterialOrderAction", () => {
    it("executa homologação por string de orderId e revalida rotas", async () => {
      mockRunAction.mockResolvedValueOnce({
        status: "success",
        message: "Pedido aprovado e estoque despachado com sucesso.",
      });

      const res = await approveMaterialOrderAction("order-101");
      expect(res.status).toBe("success");
      expect(mockRevalidatePath).toHaveBeenCalledWith("/meu-conselho");
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard");
      expect(mockRevalidatePath).toHaveBeenCalledWith("/estoque");

      const callback = mockRunAction.mock.calls[0][0];
      const mockServices = {
        orders: {
          approve: vi.fn().mockResolvedValue({ ok: true, data: {} }),
        },
      };
      await callback({ services: mockServices, actor: { userId: "warley", isCentralAdmin: true } });

      expect(mockServices.orders.approve).toHaveBeenCalledWith(
        { userId: "warley", isCentralAdmin: true },
        "order-101",
      );
    });

    it("executa homologação a partir de FormData", async () => {
      mockRunAction.mockResolvedValueOnce({
        status: "success",
        message: "Pedido aprovado.",
      });

      const fd = new FormData();
      fd.set("orderId", "order-202");

      const res = await approveMaterialOrderAction({ status: "idle" }, fd);
      expect(res.status).toBe("success");

      const callback = mockRunAction.mock.calls[0][0];
      const mockServices = {
        orders: {
          approve: vi.fn().mockResolvedValue({ ok: true }),
        },
      };
      await callback({ services: mockServices, actor: { userId: "warley" } });

      expect(mockServices.orders.approve).toHaveBeenCalledWith(
        { userId: "warley" },
        "order-202",
      );
    });
  });

  describe("rejectMaterialOrderAction", () => {
    it("executa recusa com motivo e revalida", async () => {
      mockRunAction.mockResolvedValueOnce({
        status: "success",
        message: "Pedido recusado com sucesso.",
      });

      const res = await rejectMaterialOrderAction("order-303", "Cota mensal excedida");
      expect(res.status).toBe("success");
      expect(mockRevalidatePath).toHaveBeenCalledWith("/meu-conselho");

      const callback = mockRunAction.mock.calls[0][0];
      const mockServices = {
        orders: {
          reject: vi.fn().mockResolvedValue({ ok: true }),
        },
      };
      await callback({ services: mockServices, actor: { userId: "warley", isCentralAdmin: true } });

      expect(mockServices.orders.reject).toHaveBeenCalledWith(
        { userId: "warley", isCentralAdmin: true },
        "order-303",
        "Cota mensal excedida",
      );
    });

    it("executa recusa com FormData", async () => {
      mockRunAction.mockResolvedValueOnce({
        status: "success",
        message: "Pedido recusado.",
      });

      const fd = new FormData();
      fd.set("orderId", "order-404");
      fd.set("reason", "Estoque reservado para emergências");

      const res = await rejectMaterialOrderAction({ status: "idle" }, fd);
      expect(res.status).toBe("success");

      const callback = mockRunAction.mock.calls[0][0];
      const mockServices = {
        orders: {
          reject: vi.fn().mockResolvedValue({ ok: true }),
        },
      };
      await callback({ services: mockServices, actor: { userId: "warley" } });

      expect(mockServices.orders.reject).toHaveBeenCalledWith(
        { userId: "warley" },
        "order-404",
        "Estoque reservado para emergências",
      );
    });
  });

  describe("cancelMaterialOrderAction", () => {
    it("executa cancelamento de pedido pelo solicitante e revalida", async () => {
      mockRunAction.mockResolvedValueOnce({
        status: "success",
        message: "Pedido cancelado com sucesso.",
      });

      const res = await cancelMaterialOrderAction("order-505");
      expect(res.status).toBe("success");
      expect(mockRevalidatePath).toHaveBeenCalledWith("/meu-conselho");
      expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard");
      expect(mockRevalidatePath).toHaveBeenCalledWith("/estoque");

      const callback = mockRunAction.mock.calls[0][0];
      const mockServices = {
        orders: {
          cancel: vi.fn().mockResolvedValue({ ok: true }),
        },
      };
      await callback({ services: mockServices, actor: { userId: "user-1" } });

      expect(mockServices.orders.cancel).toHaveBeenCalledWith(
        { userId: "user-1" },
        "order-505",
      );
    });
  });
});
