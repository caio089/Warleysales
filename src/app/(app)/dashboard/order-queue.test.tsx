import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("@/modules/orders/actions", () => ({
  approveMaterialOrderAction: vi.fn(),
  rejectMaterialOrderAction: vi.fn(),
}));

import {
  OrderQueue,
  type PendingOrderItem,
} from "./order-queue";

describe("OrderQueue", () => {
  it("não renderiza nada quando a lista de pedidos estiver vazia", () => {
    const html = renderToStaticMarkup(<OrderQueue items={[]} />);
    expect(html).toBe("");
  });

  it("renderiza fila de pedidos com dados do órgão, número, itens e botões de homologação e recusa", () => {
    const items: PendingOrderItem[] = [
      {
        id: "order-1",
        number: "PED-2026-001",
        councilId: "council-a",
        councilName: "CRF-SP",
        requestedBy: "user-1",
        notes: "Urgência para equipe de fiscalização",
        createdAt: new Date("2026-11-10T10:00:00Z"),
        items: [
          {
            materialId: "mat-1",
            materialName: "Papel A4 Reciclado",
            quantity: 10,
          },
          {
            materialId: "mat-2",
            materialName: "Caneta Azul",
            quantity: 25,
          },
        ],
      },
    ];

    const html = renderToStaticMarkup(<OrderQueue items={items} />);

    expect(html).toContain("Fila de Expedição — Homologação de Pedidos de Materiais");
    expect(html).toContain("1 pendente");
    expect(html).toContain("CRF-SP");
    expect(html).toContain("PED-2026-001");
    expect(html).toContain("10x Papel A4 Reciclado, 25x Caneta Azul");
    expect(html).toContain("Urgência para equipe de fiscalização");
    expect(html).toContain("Aprovar &amp; Despachar");
    expect(html).toContain("Recusar");
  });
});
