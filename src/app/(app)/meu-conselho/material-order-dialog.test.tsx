import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("@/modules/orders/actions", () => ({
  createMaterialOrderAction: vi.fn(),
}));

import {
  MaterialOrderDialog,
  MaterialOrderForm,
  type AvailableStockItem,
} from "./material-order-dialog";

describe("MaterialOrderDialog e MaterialOrderForm", () => {
  const stockWithItems: AvailableStockItem[] = [
    {
      materialId: "mat-1",
      materialName: "Papel A4 Reciclado 75g",
      available: 50,
      unit: "resma",
    },
    {
      materialId: "mat-2",
      materialName: "Caneta Esferográfica Azul",
      available: 120,
      unit: "un",
    },
    {
      materialId: "mat-3",
      materialName: "Cartucho Preto HP",
      available: 0,
      unit: "un",
    },
  ];

  it("renderiza o botão gatilho padrão do diálogo", () => {
    const html = renderToStaticMarkup(
      <MaterialOrderDialog
        councilId="council-1"
        availableStock={stockWithItems}
      />,
    );

    expect(html).toContain("Novo Pedido de Material");
  });

  it("renderiza gatilho customizado fornecido", () => {
    const html = renderToStaticMarkup(
      <MaterialOrderDialog
        councilId="council-1"
        availableStock={stockWithItems}
        trigger={<button type="button">Solicitar Itens do Estoque</button>}
      />,
    );

    expect(html).toContain("Solicitar Itens do Estoque");
  });

  it("renderiza formulário com campos quando estoque disponível possui itens liberados", () => {
    const html = renderToStaticMarkup(
      <MaterialOrderForm
        councilId="council-1"
        availableStock={stockWithItems}
      />,
    );

    // O formulário deve conter as opções dos itens liberados com available > 0
    expect(html).toContain("Papel A4 Reciclado 75g");
    expect(html).toContain("Saldo: 50");
    expect(html).toContain("Caneta Esferográfica Azul");
    expect(html).toContain("Saldo: 120");
    // Item com saldo 0 não deve estar nas opções
    expect(html).not.toContain("Cartucho Preto HP");
    expect(html).toContain("Enviar Pedido para Warley");
    expect(html).toContain("Observações ou Finalidade (Opcional)");
  });

  it("renderiza mensagem de saldo zerado quando lista de estoque liberado for vazia", () => {
    const html = renderToStaticMarkup(
      <MaterialOrderForm
        councilId="council-1"
        availableStock={[]}
      />,
    );

    expect(html).toContain("Nenhum saldo liberado disponível");
    expect(html).toContain("Não há materiais com saldo físico liberado no catálogo deste órgão");
    expect(html).not.toContain("Enviar Pedido para Warley");
  });
});
