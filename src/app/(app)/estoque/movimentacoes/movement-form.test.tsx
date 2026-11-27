import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/modules/purchases/actions", () => ({
  receiveFormAction: vi.fn(),
}));

vi.mock("@/modules/inventory/actions", () => ({
  registerMovementFormAction: vi.fn(),
}));

import { MovementForm } from "./movement-form";

describe("MovementForm", () => {
  it("espelha ata e contrato sem permitir alterar a quantidade", () => {
    const html = renderToStaticMarkup(
      <MovementForm
        councils={[{ value: "council-1", label: "Órgão" }]}
        materials={[{ value: "material-1", label: "S10" }]}
        entrySources={[{
          processId: "process-1",
          requestId: "request-1",
          councilId: "council-1",
          processNumber: "01/2026",
          processTitle: "Compra de veículos",
          label: "01/2026 — Compra de veículos",
          estimatedValue: 10_000_000,
          contractId: "contract-1",
          contractLabel: "Contrato CT 01/2026",
          ataLabel: "Ata ARP 01/2026",
          items: [{
            itemId: "item-1",
            materialId: "material-1",
            materialLabel: "S10",
            ataQuantity: 10,
            contractQuantity: 10,
            pending: 10,
            suggested: 10,
            unitPrice: 1_000_000,
            lineTotal: 10_000_000,
          }],
        }]}
      />,
    );

    expect(html).toContain("Ata ARP 01/2026");
    expect(html).toContain("Contrato CT 01/2026");
    expect(html).toContain('name="contractId" value="contract-1"');
    expect(html).toContain('name="received" value="10"');
    expect(html).not.toContain("Quantidade a receber de S10");
    expect(html).not.toContain('name="received" type="text"');
  });
});
