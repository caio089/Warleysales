import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HistoryTab } from "./history-tab";

describe("HistoryTab", () => {
  it("exibe o histórico completo com data e horário", () => {
    const html = renderToStaticMarkup(
      <HistoryTab
        history={[
          {
            id: "1",
            title: "DFD colocado",
            description: "Documento de Formalização da Demanda · dfd.pdf",
            occurredAt: "2026-01-12T10:00:00.000Z",
          },
          {
            id: "2",
            title: "Solicitação enviada para aprovação",
            occurredAt: "2026-01-10T12:06:00.000Z",
          },
        ]}
      />,
    );

    expect(html).toContain("Histórico do processo");
    expect(html).toContain("DFD colocado");
    expect(html).toContain("Solicitação enviada para aprovação");
  });

  it("mostra estado vazio quando não há eventos", () => {
    const html = renderToStaticMarkup(<HistoryTab history={[]} />);
    expect(html).toContain("Nenhum evento registrado neste processo ainda.");
  });
});
