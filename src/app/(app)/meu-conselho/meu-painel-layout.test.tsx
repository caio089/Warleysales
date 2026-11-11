import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/modules/orders/actions", () => ({
  createMaterialOrderAction: vi.fn(),
}));

import { RequestsOverview, ProcessesOverview, MeetingsOverview } from "./overview-lists";
import { StockSection } from "./stock-section";
import { MaterialOrdersSection } from "./material-orders-section";

describe("Meu Painel Overview Lists", () => {
  it("renderiza listas com empty states compactos e sem quebras", () => {
    const htmlReq = renderToStaticMarkup(<RequestsOverview rows={[]} />);
    expect(htmlReq).toContain("Solicitações");
    expect(htmlReq).toContain("Nenhuma solicitação");

    const htmlProc = renderToStaticMarkup(<ProcessesOverview rows={[]} />);
    expect(htmlProc).toContain("Processos e documentos");

    const htmlMeet = renderToStaticMarkup(<MeetingsOverview rows={[]} />);
    expect(htmlMeet).toContain("Reuniões");
  });

  it("renderiza ação customizada no cabeçalho quando fornecida", () => {
    const htmlMeet = renderToStaticMarkup(
      <MeetingsOverview rows={[]} action={<button type="button">Agendar Teste</button>} />,
    );
    expect(htmlMeet).toContain("Agendar Teste");
  });

  it("renderiza StockSection com nome de produto e badge SKU monoespaçada", () => {
    const html = renderToStaticMarkup(
      <StockSection
        councilId="c1"
        stockLevels={[
          {
            councilId: "c1",
            materialId: "m1",
            available: 15,
            reserved: 0,
            minimum: 5,
            maximum: 50,
            level: "normal",
          },
        ]}
        materialLabelMap={{ m1: "IPHONE-18-PRO-MAX — iphone 18 pro max" }}
        materialNameMap={{ m1: "iphone 18 pro max" }}
      />,
    );

    expect(html).toContain("Estoque Disponível na Empresa");
    expect(html).toContain("iphone 18 pro max");
    expect(html).toContain("IPHONE-18-PRO-MAX");
    expect(html).toContain("font-mono text-[10px] bg-slate-100");
    expect(html).toContain("15");
    expect(html).toContain("5");
    expect(html).toContain("whitespace-nowrap");
  });

  it("renderiza MaterialOrdersSection com empty state proporcional e centralizado", () => {
    const html = renderToStaticMarkup(
      <MaterialOrdersSection
        councilId="c1"
        orders={[]}
        availableStock={[]}
        materialLabelMap={{}}
        canCreateOrder={true}
      />,
    );

    expect(html).toContain("Pedidos de Materiais da Empresa");
    expect(html).toContain("Nenhum pedido de material realizado");
  });

  it("renderiza MaterialOrdersSection com pedidos quando presentes", () => {
    const html = renderToStaticMarkup(
      <MaterialOrdersSection
        councilId="c1"
        orders={[
          {
            id: "ord-1",
            councilId: "c1",
            number: "PED-2026-001",
            status: "pendente",
            notes: "Uso administrativo",
            items: [{ materialId: "m1", quantity: 2 }],
            createdAt: new Date("2026-11-11T12:00:00Z"),
            updatedAt: new Date("2026-11-11T12:00:00Z"),
          },
        ]}
        availableStock={[]}
        materialLabelMap={{ m1: "iPhone 18 Pro" }}
        canCreateOrder={false}
      />,
    );

    expect(html).toContain("PED-2026-001");
    expect(html).toContain("2x iPhone 18 Pro");
    expect(html).toContain("Uso administrativo");
  });
});
