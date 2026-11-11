import { Sparkles, AlertTriangle, CheckCircle2 } from "lucide-react";
import { generateBriefing } from "@/modules/insights/service";
import type { BriefingFacts } from "@/modules/insights/briefing";
import { cn } from "@/lib/utils";

function buildBriefingCards(facts: BriefingFacts, bullets: string[]) {
  const stockCount = (facts.stockAttention?.length || facts.stock.critical) || 0;
  const pendingRequests = facts.requestsSummary?.pending ?? 0;
  const pendingDeliveries = facts.pendingDeliveriesCount ?? 0;
  const expiringContracts = facts.contracts.expiring30 ?? 0;
  const meetingsCount = facts.upcomingMeetings?.length ?? 0;
  const unreadAlerts = facts.unreadAlerts ?? 0;

  return [
    {
      num: "01",
      titulo: "Estoque Crítico e Zerado",
      prazo: stockCount > 0 ? "Repor Urgente" : "Estável",
      corPrazo: stockCount > 0 ? "bg-red-50 text-red-700 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200",
      desc: bullets[0] ?? (stockCount > 0 ? `${stockCount} item(ns) com estoque crítico ou zerado exigem reposição.` : "Níveis de estoque regulares acima do mínimo de segurança."),
    },
    {
      num: "02",
      titulo: "Priorização de Logística",
      prazo: (pendingRequests + pendingDeliveries) > 0 ? `${pendingRequests + pendingDeliveries} demandas` : "Em dia",
      corPrazo: (pendingRequests + pendingDeliveries) > 0 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200",
      desc: bullets[1] ?? `${pendingDeliveries} entregas pendentes e ${pendingRequests} solicitações aguardando atendimento.`,
    },
    {
      num: "03",
      titulo: "Renovação Contratual",
      prazo: expiringContracts > 0 ? `${expiringContracts} a vencer` : "Em dia",
      corPrazo: expiringContracts > 0 ? "bg-red-50 text-red-700 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200",
      desc: bullets[2] ?? (expiringContracts > 0 ? `${expiringContracts} contrato(s) com vencimento em até 30 dias.` : "Fluxo de contratos e atas dentro do cronograma normal."),
    },
    {
      num: "04",
      titulo: meetingsCount > 0 ? "Pauta de Reuniões" : "Alertas & Notificações",
      prazo: meetingsCount > 0 ? `${meetingsCount} agendada(s)` : (unreadAlerts > 0 ? `${unreadAlerts} alertas` : "Sem avisos"),
      corPrazo: "bg-blue-50 text-blue-700 border-blue-200",
      desc: bullets[3] ?? (meetingsCount > 0 ? `${meetingsCount} reunião(ões) confirmada(s) para os próximos dias.` : `${unreadAlerts} alertas operacionais registrados.`),
    },
  ];
}

export async function BriefingCard({ facts }: { facts: BriefingFacts }) {
  const insight = await generateBriefing(facts);
  const cards = buildBriefingCards(facts, insight.bullets);

  return (
    <section
      aria-label="Briefing Operacional"
      className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/70 via-white to-white p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Briefing Operacional
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
              insight.hasBlockers
                ? "bg-amber-100 text-amber-800 border-amber-200"
                : "bg-emerald-100 text-emerald-800 border-emerald-200",
            )}
          >
            {insight.hasBlockers ? (
              <>
                <AlertTriangle className="w-3 h-3" /> Pontos de atenção
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3 h-3" /> Operação estável
              </>
            )}
          </span>
        </div>
        <span className="text-xs font-medium text-slate-500">
          {insight.headline}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {cards.map((item) => (
          <div
            key={item.num}
            className="bg-white rounded-xl p-3.5 border border-slate-200/70 shadow-2xs flex flex-col justify-between hover:border-amber-300 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold font-mono text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                  #{item.num}
                </span>
                <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", item.corPrazo)}>
                  {item.prazo}
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-800 mb-1">{item.titulo}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function BriefingFallback() {
  return (
    <div
      aria-label="Carregando Briefing Operacional"
      className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/70 via-white to-white p-5 shadow-sm flex items-center gap-2 text-xs text-slate-600"
    >
      <Sparkles className="size-4 animate-spin text-amber-500" />
      <span>Carregando Briefing Operacional...</span>
    </div>
  );
}
