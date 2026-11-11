import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  AgendaAndDeadlinesPanel,
  UpcomingMeetingsPanel,
  AlertsPanel,
  DeliveriesSummaryPanel,
  RecentRequestsPanel,
  ReplenishmentPanel,
} from "./panels";

describe("Dashboard Panels", () => {
  it("UpcomingMeetingsPanel renderiza lista com empty state harmonioso", () => {
    const html = renderToStaticMarkup(<UpcomingMeetingsPanel items={[]} />);
    expect(html).toContain("Próximas Reuniões");
    expect(html).toContain("Nenhuma reunião agendada");
  });

  it("UpcomingMeetingsPanel renderiza reuniões agendadas", () => {
    const html = renderToStaticMarkup(
      <UpcomingMeetingsPanel
        items={[
          {
            id: "m1",
            title: "Alinhamento Mensal",
            company: "CREA",
            scheduledAt: new Date().toISOString(),
          },
        ]}
      />
    );
    expect(html).toContain("Alinhamento Mensal");
    expect(html).toContain("CREA");
  });

  it("AlertsPanel limita visualização e informa não lidos", () => {
    const html = renderToStaticMarkup(
      <AlertsPanel
        items={[
          {
            id: "1",
            title: "Ata vencendo",
            body: "Aviso",
            unread: true,
            at: new Date().toISOString(),
            href: "/atas",
          },
        ]}
        unread={1}
      />
    );
    expect(html).toContain("Alertas &amp; Avisos");
    expect(html).toContain("Ata vencendo");
    expect(html).toContain("1 não lido");
  });

  it("DeliveriesSummaryPanel renderiza entregas e taxa de conclusão", () => {
    const html = renderToStaticMarkup(<DeliveriesSummaryPanel delivered={10} pending={5} />);
    expect(html).toContain("Entregas &amp; Atendimento");
    expect(html).toContain("10 un");
    expect(html).toContain("5 un");
    expect(html).toContain("67%");
  });

  it("ReplenishmentPanel renderiza lista e empty state", () => {
    const emptyHtml = renderToStaticMarkup(<ReplenishmentPanel items={[]} />);
    expect(emptyHtml).toContain("Órgãos com Necessidade de Reposição");
    expect(emptyHtml).toContain("níveis de estoque regulares");

    const filledHtml = renderToStaticMarkup(
      <ReplenishmentPanel
        items={[
          {
            companyId: "c1",
            company: "CREA",
            material: "Papel A4",
            available: 2,
            minimum: 10,
            level: "critico",
          },
        ]}
      />
    );
    expect(filledHtml).toContain("Papel A4");
    expect(filledHtml).toContain("2 disp.");
  });

  it("RecentRequestsPanel renderiza solicitações operacionais", () => {
    const emptyHtml = renderToStaticMarkup(<RecentRequestsPanel items={[]} />);
    expect(emptyHtml).toContain("Solicitações Operacionais");
    expect(emptyHtml).toContain("Nenhuma solicitação operacional registrada");

    const filledHtml = renderToStaticMarkup(
      <RecentRequestsPanel
        items={[
          {
            id: "req-1",
            title: "Aquisição de cadeiras",
            company: "CRM",
            status: "enviada",
            createdAt: new Date().toISOString(),
            itemsCount: 3,
          },
        ]}
      />
    );
    expect(filledHtml).toContain("Aquisição de cadeiras");
    expect(filledHtml).toContain("CRM");
  });

  it("AgendaAndDeadlinesPanel renderiza reunião e prazo unificados", () => {
    const html = renderToStaticMarkup(
      <AgendaAndDeadlinesPanel
        meetings={[{ id: "m1", title: "Pauta Ordinária", company: "CRQ", scheduledAt: new Date().toISOString() }]}
        deadlines={[{ id: "d1", kind: "contract", label: "CT-042/2026", days: 12, href: "/contratos/d1" }]}
      />
    );
    expect(html).toContain("Agenda &amp; Prazos (60 dias)");
    expect(html).toContain("Pauta Ordinária");
    expect(html).toContain("CT-042/2026");
    expect(html).toContain("Vence em 12d");
  });
});
