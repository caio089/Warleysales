import type { BriefingFacts } from "./briefing";

export interface BriefingInsight {
  headline: string;
  bullets: string[];
  hasBlockers: boolean;
}

export async function generateBriefing(facts: BriefingFacts): Promise<BriefingInsight> {
  if (process.env.GROQ_API_KEY?.trim()) {
    try {
      const { generateOperationalBriefing } = await import("./groq");
      const result = await generateOperationalBriefing(facts);
      if (result.ok) {
        return {
          headline: result.data.headline,
          bullets: result.data.bullets,
          hasBlockers: result.data.tone !== "ok",
        };
      }
    } catch {
      // Falha ao carregar ou executar groq, recai no briefing analítico determinístico
    }
  }

  // Briefing analítico determinístico baseado nos fatos consolidados
  const hasPending = (facts.requestsSummary?.pending ?? 0) > 0;
  const hasCriticalStock = (facts.stockAttention?.length ?? 0) > 0 || facts.stock.critical > 0;
  const hasExpiringContracts = facts.contracts.expiring30 > 0;
  const hasAlerts = facts.unreadAlerts > 0;
  const hasBlockers = hasPending || hasCriticalStock || hasExpiringContracts || hasAlerts;

  const bullets: string[] = [];

  if (hasCriticalStock) {
    const count = facts.stockAttention?.length || facts.stock.critical;
    bullets.push(`${count} item(ns) de estoque demandam reposição urgente`);
  } else {
    bullets.push("Níveis de estoque de materiais regulares");
  }

  if (facts.requestsSummary) {
    bullets.push(
      facts.requestsSummary.pending > 0
        ? `${facts.requestsSummary.pending} solicitação(ões) aguardando atendimento`
        : "Demandas operacionais em dia",
    );
  }

  if (facts.pendingDeliveriesCount !== undefined && facts.pendingDeliveriesCount > 0) {
    bullets.push(`${facts.pendingDeliveriesCount} unidade(s) com entrega a confirmar`);
  } else if (hasExpiringContracts) {
    bullets.push(`${facts.contracts.expiring30} contrato(s) com vencimento em até 30 dias`);
  } else {
    bullets.push("Fluxo de contratos e atas dentro da normalidade");
  }

  if (facts.upcomingMeetings && facts.upcomingMeetings.length > 0) {
    bullets.push(`${facts.upcomingMeetings.length} reunião(ões) na agenda dos próximos dias`);
  } else if (facts.unreadAlerts > 0) {
    bullets.push(`${facts.unreadAlerts} alerta(s) operacional(is) não lido(s)`);
  } else {
    bullets.push("Sem pendências críticas ou reuniões pendentes");
  }

  const headline = hasBlockers
    ? "Há itens operacionais que demandam acompanhamento imediato"
    : "Operação equilibrada e sem pontos críticos de atenção";

  return {
    headline,
    bullets: bullets.slice(0, 4),
    hasBlockers,
  };
}
