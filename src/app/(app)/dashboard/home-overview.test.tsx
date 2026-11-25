import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HomeOverview } from "./home-overview";

describe("HomeOverview", () => {
  it("mostra visão amigável para Warley com economia e aprovações", () => {
    const html = renderToStaticMarkup(
      <HomeOverview
        isWarley
        requests={{ pending: 3, inProgress: 2, completed: 5 }}
        processStatuses={[
          { status: "em_andamento", count: 4 },
          { status: "concluido", count: 2 },
        ]}
        stockAttention={1}
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
    expect(html).toContain("Andamento dos processos");
    expect(html).toContain("Economia");
  });

  it("mostra visão do órgão com estoque e pedidos", () => {
    const html = renderToStaticMarkup(
      <HomeOverview
        isWarley={false}
        requests={{ pending: 1, inProgress: 0, completed: 0 }}
        processStatuses={[]}
        stockAttention={4}
        savingsTotal={0}
        savingsProcesses={0}
        overdueProcesses={2}
      />,
    );
    expect(html).toContain("Pedidos em aberto");
    expect(html).toContain("Estoque em atenção");
    expect(html).toContain("Aguardando");
    expect(html).not.toContain("Para formalizar");
  });
});
