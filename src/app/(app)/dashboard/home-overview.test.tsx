import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HomeOverview } from "./home-overview";

const baseStock = { normal: 8, atencao: 1, critico: 1, semDisponibilidade: 0 };
const baseContracts = { total: 4, expired: 0, expiring30: 1 };
const baseAtas = { total: 3, expired: 0 };
const baseDeliveries = { delivered: 10, pending: 4 };

describe("HomeOverview", () => {
  it("mostra visão amigável para Warley com economia, aprovações e gráficos", () => {
    const html = renderToStaticMarkup(
      <HomeOverview
        isWarley
        requests={{ pending: 3, inProgress: 2, completed: 5 }}
        processStatuses={[
          { status: "em_andamento", count: 4 },
          { status: "concluido", count: 2 },
        ]}
        stockByLevel={baseStock}
        stockAttention={1}
        contracts={baseContracts}
        atas={baseAtas}
        deliveries={baseDeliveries}
        processProgress={62}
        savingsTotal={12000}
        savingsProcesses={2}
        approvalsWaiting={3}
        formalizationsWaiting={1}
        overdueProcesses={0}
      />,
    );
    expect(html).toContain("Como está hoje");
    expect(html).toContain("Para aprovar");
    expect(html).toContain("Solicitações");
    expect(html).toContain("Saúde do estoque");
    expect(html).toContain("Andamento dos processos");
    expect(html).toContain("Contratos, atas e entregas");
    expect(html).toContain("Economia");
  });

  it("mostra visão do órgão com estoque e pedidos", () => {
    const html = renderToStaticMarkup(
      <HomeOverview
        isWarley={false}
        requests={{ pending: 1, inProgress: 0, completed: 0 }}
        processStatuses={[]}
        stockByLevel={{ normal: 0, atencao: 2, critico: 2, semDisponibilidade: 0 }}
        stockAttention={4}
        contracts={{ total: 1, expired: 0, expiring30: 0 }}
        atas={{ total: 0, expired: 0 }}
        deliveries={{ delivered: 0, pending: 2 }}
        processProgress={null}
        savingsTotal={4500}
        savingsProcesses={1}
        overdueProcesses={2}
      />,
    );
    expect(html).toContain("Pedidos em aberto");
    expect(html).toContain("Estoque em atenção");
    expect(html).toContain("Aguardando");
    expect(html).toContain("Saúde do estoque");
    expect(html).toContain("Economia");
    expect(html).toContain("4.500,00");
    expect(html).toContain("Em 1 processo");
    expect(html).not.toContain("Para formalizar");
  });
});
