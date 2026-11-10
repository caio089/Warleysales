import { describe, expect, it, vi, beforeEach } from "vitest";

const mockRunAction = vi.fn();
vi.mock("@/server/action-runner", () => ({
  runAction: (...args: unknown[]) => mockRunAction(...args),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import {
  submitFormalizationFormAction,
  homologateFormalizationAction,
  rejectFormalizationAction,
} from "./actions";

describe("formalizations actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("submitFormalizationFormAction", () => {
    it("extrai valores e executa o serviço de submissão", async () => {
      mockRunAction.mockResolvedValueOnce({
        status: "success",
        message: "Formalização submetida com sucesso.",
        data: { id: "form-1" },
      });

      const fd = new FormData();
      fd.set("processId", "proc-1");
      fd.set("councilId", "council-a");
      fd.set("supplierId", "sup-1");
      fd.set("instrumentType", "contrato");
      fd.set("instrumentNumber", "CTR 10/2026");
      fd.set("estimatedValue", "150.000,50");
      fd.set("contractedValue", "120.000,00");
      fd.set("requestId", "req-1");

      const res = await submitFormalizationFormAction({ status: "idle" }, fd);
      expect(res.status).toBe("success");
      expect(mockRunAction).toHaveBeenCalled();

      // Test runner callback
      const callback = mockRunAction.mock.calls[0][0];
      const mockServices = {
        formalizations: {
          submit: vi.fn().mockResolvedValue({ ok: true, data: {} }),
        },
      };
      await callback({ services: mockServices, actor: { userId: "user-1" } });

      expect(mockServices.formalizations.submit).toHaveBeenCalledWith(
        { userId: "user-1" },
        expect.objectContaining({
          processId: "proc-1",
          councilId: "council-a",
          supplierId: "sup-1",
          instrumentType: "contrato",
          instrumentNumber: "CTR 10/2026",
          estimatedValue: 150000.5,
          contractedValue: 120000,
          requestId: "req-1",
        }),
      );
    });
  });

  describe("homologateFormalizationAction", () => {
    it("extrai parâmetros e invoca homologação", async () => {
      mockRunAction.mockResolvedValueOnce({
        status: "success",
        message: "Formalização homologada e estoque liberado com sucesso.",
      });

      const fd = new FormData();
      fd.set("processId", "proc-1");
      fd.set("note", "Homologado com louvor");

      const res = await homologateFormalizationAction({ status: "idle" }, fd);
      expect(res.status).toBe("success");
      expect(mockRunAction).toHaveBeenCalled();

      const callback = mockRunAction.mock.calls[0][0];
      const mockServices = {
        formalizations: {
          homologate: vi.fn().mockResolvedValue({ ok: true, data: {} }),
        },
      };
      await callback({ services: mockServices, actor: { userId: "warley" } });

      expect(mockServices.formalizations.homologate).toHaveBeenCalledWith(
        { userId: "warley" },
        {
          processId: "proc-1",
          note: "Homologado com louvor",
        },
      );
    });
  });

  describe("rejectFormalizationAction", () => {
    it("extrai parâmetros e invoca rejeição", async () => {
      mockRunAction.mockResolvedValueOnce({
        status: "success",
        message: "Formalização rejeitada.",
      });

      const fd = new FormData();
      fd.set("processId", "proc-1");
      fd.set("note", "Preço superfaturado");

      const res = await rejectFormalizationAction({ status: "idle" }, fd);
      expect(res.status).toBe("success");
      expect(mockRunAction).toHaveBeenCalled();

      const callback = mockRunAction.mock.calls[0][0];
      const mockServices = {
        formalizations: {
          reject: vi.fn().mockResolvedValue({ ok: true, data: {} }),
        },
      };
      await callback({ services: mockServices, actor: { userId: "warley" } });

      expect(mockServices.formalizations.reject).toHaveBeenCalledWith(
        { userId: "warley" },
        {
          processId: "proc-1",
          note: "Preço superfaturado",
        },
      );
    });
  });
});
