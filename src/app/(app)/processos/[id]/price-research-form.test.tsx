import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

vi.mock("@/modules/processes/price-research-action", () => ({
  saveProcessPriceResearch: vi.fn(),
}));

import { PriceResearchForm, PriceResearchSummary } from "./price-research-form";

describe("PriceResearchForm", () => {
  it("lista quantidade de cada item e mostra total estimado", () => {
    const html = renderToStaticMarkup(
      <PriceResearchForm
        processId="11111111-1111-1111-1111-111111111111"
        items={[
          { materialId: "m1", name: "Resina", quantity: 10 },
          { materialId: "m2", name: "Luva", quantity: 100 },
        ]}
        estimatedValue={null}
      />,
    );
    expect(html).toContain("Resina");
    expect(html).toContain("Quantidade: 10");
    expect(html).toContain("Luva");
    expect(html).toContain("Quantidade: 100");
    expect(html).toContain("Valor unitário de referência");
    expect(html).toContain("Total estimado do item");
    expect(html).toContain("Valor total estimado");
    expect(html).toContain("Salvar pesquisa de preços");
  });

  it("formata milhar e centavos e calcula o subtotal da quantidade", () => {
    const html = renderToStaticMarkup(<PriceResearchForm
      processId="11111111-1111-1111-1111-111111111111"
      items={[{ materialId: "m1", name: "Resina", quantity: 10 }]}
      savedLines={[{ materialId: "m1", name: "Resina", quantity: 10, unitPrice: 1234.5, lineTotal: 12345 }]}
    />);
    expect(html).toContain('value="1.234,50"');
    expect(html).toContain("12.345,00");
  });
});

describe("PriceResearchSummary", () => {
  it("mostra linhas salvas e o total", () => {
    const html = renderToStaticMarkup(
      <PriceResearchSummary
        items={[{ materialId: "m1", name: "Resina", quantity: 10 }]}
        savedLines={[
          { materialId: "m1", name: "Resina", quantity: 10, lineTotal: 1500 },
        ]}
        estimatedValue={1500}
      />,
    );
    expect(html).toContain("Resina");
    expect(html).toContain("10 ×");
    expect(html).toContain("Total:");
  });
});
