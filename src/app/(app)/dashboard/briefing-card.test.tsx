import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BriefingFallback, BriefingCard } from "./briefing-card";
import type { BriefingFacts } from "@/modules/insights/briefing";

describe("BriefingCard", () => {
  afterEach(() => vi.unstubAllEnvs());
  it("renderiza fallback sem quebrar e com semântica de carregamento", () => {
    const html = renderToStaticMarkup(<BriefingFallback />);
    expect(html).toContain("Carregando resumo inteligente da operação");
  });

  it("renderiza BriefingCard executivo com chips de alerta e fatos operacionais", async () => {
    vi.stubEnv("GROQ_API_KEY", "");
    const mockFacts: BriefingFacts = {
      councilLabel: "CREA-SP",
      processes: { total: 10, completed: 8, pending: 2, averageProgress: 80, byStatus: {} },
      stock: { items: 50, critical: 1, withoutAvailability: 0 },
      contracts: { total: 5, expired: 0, expiring30: 1 },
      atas: { total: 3, expired: 0 },
      unreadAlerts: 2,
      alertTitles: ["Estoque baixo: Canetas"],
      requestsSummary: {
        pending: 3,
        inProgress: 1,
        completed: 10,
      },
      stockAttention: [
        {
          company: "CREA-SP",
          material: "Papel A4",
          available: 2,
          minimum: 10,
          level: "critico",
        },
      ],
      pendingDeliveriesCount: 15,
      upcomingMeetings: [
        {
          company: "CREA-SP",
          title: "Alinhamento Trimestral",
          scheduledAt: "2026-11-20T10:00:00Z",
        },
      ],
    };

    const element = await BriefingCard({ facts: mockFacts });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Resumo do dia");
    expect(html).toContain("Pontos de atenção");
    expect(html).toContain("Ver análise completa");
    expect(html).toContain("Órgão: CREA-SP");
    expect(html).toContain("Resumo alternativo");
    expect(html).toContain("Solicitações pendentes");
    expect(html).toContain("Contratos a vencer em 30 dias");
    expect(html).toContain("solicitação(ões) aguardando atendimento");
  });
});
