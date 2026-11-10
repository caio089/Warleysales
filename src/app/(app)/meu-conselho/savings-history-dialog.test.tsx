import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  SavingsHistoryDialog,
  type SavingsHistoryItem,
  type SavingsSummaryProps,
} from "./savings-history-dialog";

describe("SavingsHistoryDialog", () => {
  const summary: SavingsSummaryProps = {
    totalEstimated: 120000,
    totalContracted: 90000,
    totalSavings: 30000,
    averageSavingsPercent: 25,
    count: 2,
  };

  it("renderiza o gatilho padrão do diálogo", () => {
    const html = renderToStaticMarkup(
      <SavingsHistoryDialog councilName="CRF-SP" summary={summary} items={[]} />,
    );
    expect(html).toContain("Ver Histórico de Contratações");
  });

  it("renderiza gatilho customizado fornecido", () => {
    const html = renderToStaticMarkup(
      <SavingsHistoryDialog
        councilName="CRF-SP"
        summary={summary}
        items={[]}
        trigger={<button type="button">Abrir Histórico Customizado</button>}
      />,
    );
    expect(html).toContain("Abrir Histórico Customizado");
  });
});
