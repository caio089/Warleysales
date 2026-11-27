"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ClipboardList,
  FileText,
  Package,
  PiggyBank,
  Timer,
  Truck,
  Wallet,
} from "lucide-react";
import { formatCurrency } from "@/shared/lib/format";
import { BarStatList } from "@/shared/ui/charts/bar-stat-list";
import { DonutChart } from "@/shared/ui/charts/donut-chart";
import { ProgressBar } from "@/shared/ui/progress-bar";
import { cn } from "@/lib/utils";

export type HomeOverviewProps = {
  isWarley: boolean;
  requests: { pending: number; inProgress: number; completed: number };
  processStatuses: Array<{ status: string; count: number }>;
  stockByLevel: { normal: number; atencao: number; critico: number; semDisponibilidade: number };
  stockAttention: number;
  contracts: { total: number; expired: number; expiring30: number };
  atas: { total: number; expired: number };
  deliveries: { delivered: number; pending: number };
  processProgress: number | null;
  savingsTotal: number;
  savingsProcesses: number;
  approvalsWaiting?: number;
  formalizationsWaiting?: number;
  overdueProcesses?: number;
};

const PROCESS_LABEL: Record<string, string> = {
  em_andamento: "Em andamento",
  aguardando_aprovacao: "Aguardando aprovação",
  pendente_contrato: "Pendente de contrato",
  aguardando_providencia: "Aguardando providência",
  concluido: "Concluídos",
  cancelado: "Cancelados",
  arquivado: "Arquivados",
};

const PROCESS_BAR: Record<string, string> = {
  em_andamento: "bg-[#0f2942]",
  aguardando_aprovacao: "bg-amber-500",
  pendente_contrato: "bg-amber-500",
  aguardando_providencia: "bg-orange-400",
  concluido: "bg-emerald-500",
  cancelado: "bg-slate-400",
  arquivado: "bg-slate-300",
};

function BigStat({
  icon: Icon,
  value,
  label,
  hint,
  href,
  tone = "default",
}: {
  icon: typeof ClipboardList;
  value: string | number;
  label: string;
  hint: string;
  href?: string;
  tone?: "default" | "warn" | "ok" | "money";
}) {
  const toneClass =
    tone === "warn"
      ? "text-amber-700"
      : tone === "ok"
        ? "text-emerald-700"
        : tone === "money"
          ? "text-emerald-700"
          : "text-primary";

  const content = (
    <div
      className={cn(
        "group flex h-full flex-col gap-1.5 rounded-xl border border-border/70 bg-card/80 p-3 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md",
        href && "cursor-pointer",
      )}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="flex size-7 items-center justify-center rounded-lg bg-muted/70 text-primary transition group-hover:bg-primary/10">
          <Icon className="size-3.5" aria-hidden />
        </span>
        <span className="text-[0.7rem] font-medium leading-tight">{label}</span>
      </div>
      <p className={cn("text-xl font-semibold tabular-nums tracking-tight sm:text-2xl", toneClass)}>{value}</p>
      <p className="text-[0.7rem] leading-snug text-muted-foreground">{hint}</p>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {content}
      </Link>
    );
  }
  return content;
}

function ChartCard({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "rounded-xl border border-border/70 bg-card/90 p-4 shadow-sm transition duration-300 hover:shadow-md",
        className,
      )}
    >
      <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </article>
  );
}

/** Visão do dia: KPIs densos + gráficos de solicitações, processos, estoque, prazos e entregas. */
export function HomeOverview({
  isWarley,
  requests,
  processStatuses,
  stockByLevel,
  stockAttention,
  contracts,
  atas,
  deliveries,
  processProgress,
  savingsTotal,
  savingsProcesses,
  approvalsWaiting = 0,
  formalizationsWaiting = 0,
  overdueProcesses = 0,
}: HomeOverviewProps) {
  const requestTotal = requests.pending + requests.inProgress + requests.completed;
  const stockTotal =
    stockByLevel.normal + stockByLevel.atencao + stockByLevel.critico + stockByLevel.semDisponibilidade;
  const deliveryTotal = deliveries.delivered + deliveries.pending;
  const deliveryPct = deliveryTotal > 0 ? Math.round((deliveries.delivered / deliveryTotal) * 100) : 100;

  const processBars = processStatuses
    .filter((row) => row.count > 0)
    .map((row) => ({
      id: row.status,
      label: PROCESS_LABEL[row.status] ?? row.status.replaceAll("_", " "),
      value: row.count,
      barClassName: PROCESS_BAR[row.status] ?? "bg-primary",
    }));

  const deadlineBars = [
    {
      id: "contracts-expiring",
      label: "Contratos ≤ 30 dias",
      value: contracts.expiring30,
      barClassName: "bg-amber-500",
    },
    {
      id: "contracts-expired",
      label: "Contratos vencidos",
      value: contracts.expired,
      barClassName: "bg-red-500",
    },
    {
      id: "atas-expired",
      label: "Atas vencidas",
      value: atas.expired,
      barClassName: "bg-orange-400",
    },
    {
      id: "contracts-ok",
      label: "Contratos ok",
      value: Math.max(0, contracts.total - contracts.expired - contracts.expiring30),
      barClassName: "bg-emerald-500",
    },
    {
      id: "atas-ok",
      label: "Atas vigentes",
      value: Math.max(0, atas.total - atas.expired),
      barClassName: "bg-[#0f2942]",
    },
  ].filter((item) => item.value > 0);

  const bigStats = isWarley
    ? [
        {
          icon: ClipboardList,
          value: approvalsWaiting,
          label: "Para aprovar",
          hint: approvalsWaiting === 1 ? "1 pedido te espera" : "Pedidos aguardando sua ok",
          href: "#aprovacoes",
          tone: approvalsWaiting > 0 ? ("warn" as const) : ("default" as const),
        },
        {
          icon: CheckCircle2,
          value: formalizationsWaiting,
          label: "Para formalizar",
          hint: "Atas e contratos em fila",
          href: "/dashboard#filas-warley",
          tone: formalizationsWaiting > 0 ? ("warn" as const) : ("default" as const),
        },
        {
          icon: Timer,
          value: overdueProcesses,
          label: "Prazos apertados",
          hint: overdueProcesses > 0 ? "Processos fora do prazo" : "Nada atrasado agora",
          href: "/processos",
          tone: overdueProcesses > 0 ? ("warn" as const) : ("ok" as const),
        },
        {
          icon: PiggyBank,
          value: formatCurrency(savingsTotal),
          label: "Economia",
          hint:
            savingsProcesses > 0
              ? `Em ${savingsProcesses} processo${savingsProcesses === 1 ? "" : "s"}`
              : "Ainda sem economia registrada",
          tone: "money" as const,
        },
        {
          icon: Package,
          value: stockAttention,
          label: "Estoque crítico",
          hint: stockAttention > 0 ? "Itens abaixo do mínimo" : "Estoque em dia",
          href: "/estoque",
          tone: stockAttention > 0 ? ("warn" as const) : ("ok" as const),
        },
        {
          icon: Truck,
          value: deliveries.pending,
          label: "Entregas pendentes",
          hint: `${deliveries.delivered} já recebidas`,
          href: "/entregas",
          tone: deliveries.pending > 0 ? ("warn" as const) : ("ok" as const),
        },
      ]
    : [
        {
          icon: ClipboardList,
          value: requests.pending,
          label: "Pedidos em aberto",
          hint: "Aguardando análise ou correção",
          href: "/solicitacoes",
          tone: requests.pending > 0 ? ("warn" as const) : ("default" as const),
        },
        {
          icon: Package,
          value: stockAttention,
          label: "Estoque em atenção",
          hint: stockAttention > 0 ? "Itens abaixo do mínimo" : "Estoque em dia",
          href: "/estoque",
          tone: stockAttention > 0 ? ("warn" as const) : ("ok" as const),
        },
        {
          icon: Timer,
          value: overdueProcesses,
          label: "Prazos",
          hint: overdueProcesses > 0 ? "Algo precisa de atenção" : "Sem urgências",
          href: "/processos",
          tone: overdueProcesses > 0 ? ("warn" as const) : ("ok" as const),
        },
        {
          icon: Wallet,
          value: requests.inProgress,
          label: "Em andamento",
          hint: "Já aprovados ou em atendimento",
          href: "/solicitacoes",
        },
        {
          icon: FileText,
          value: contracts.expiring30 + atas.expired,
          label: "Vencimentos",
          hint: "Contratos e atas a vigiar",
          href: "/contratos",
          tone: contracts.expiring30 + atas.expired > 0 ? ("warn" as const) : ("ok" as const),
        },
        {
          icon: Truck,
          value: deliveries.pending,
          label: "A receber",
          hint: `${deliveries.delivered} já recebidas`,
          href: "/entregas",
        },
      ];

  return (
    <section
      aria-labelledby="home-overview-title"
      className="animate-in fade-in slide-in-from-bottom-2 space-y-3 duration-500"
    >
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="home-overview-title" className="font-heading text-lg font-semibold text-foreground sm:text-xl">
            Como está hoje
          </h2>
          <p className="text-sm text-muted-foreground">
            {isWarley
              ? "Números e gráficos do que pede atenção — e do que já anda bem."
              : "Pedidos, estoque, prazos e entregas do seu órgão."}
          </p>
        </div>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {bigStats.map((stat) => (
          <BigStat key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <ChartCard title="Solicitações">
          <DonutChart
            size={140}
            centerLabel="Total"
            centerValue={requestTotal}
            slices={[
              { id: "pending", label: "Aguardando", value: requests.pending, color: "#f59e0b" },
              { id: "progress", label: "Em andamento", value: requests.inProgress, color: "#0f2942" },
              { id: "done", label: "Concluídas", value: requests.completed, color: "#10b981" },
            ]}
          />
        </ChartCard>

        <ChartCard title="Saúde do estoque">
          <DonutChart
            size={140}
            centerLabel="Itens"
            centerValue={stockTotal}
            slices={[
              { id: "normal", label: "Normal", value: stockByLevel.normal, color: "#10b981" },
              { id: "atencao", label: "Atenção", value: stockByLevel.atencao, color: "#f59e0b" },
              { id: "critico", label: "Crítico", value: stockByLevel.critico, color: "#ef4444" },
              {
                id: "sem",
                label: "Sem estoque",
                value: stockByLevel.semDisponibilidade,
                color: "#64748b",
              },
            ]}
          />
        </ChartCard>

        <ChartCard title="Andamento dos processos">
          <BarStatList items={processBars} emptyLabel="Ainda não há processos neste recorte." />
          {processProgress != null ? (
            <div className="mt-4 space-y-1.5 border-t border-border/60 pt-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Progresso médio</span>
                <span className="font-semibold tabular-nums text-foreground">{processProgress}%</span>
              </div>
              <ProgressBar value={processProgress} label="Progresso médio dos processos" showValue={false} />
            </div>
          ) : null}
        </ChartCard>

        <ChartCard title="Contratos, atas e entregas">
          <BarStatList items={deadlineBars} emptyLabel="Sem contratos ou atas neste recorte." />
          <div className="mt-4 space-y-2 border-t border-border/60 pt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Entregas concluídas</span>
              <span className="font-semibold tabular-nums text-foreground">{deliveryPct}%</span>
            </div>
            <ProgressBar value={deliveryPct} label="Taxa de entregas" showValue={false} />
            <p className="text-[0.7rem] text-muted-foreground">
              {deliveries.delivered} recebidas · {deliveries.pending} pendentes
            </p>
            {isWarley && savingsTotal > 0 ? (
              <p className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[0.7rem] font-medium text-emerald-800">
                Economia: {formatCurrency(savingsTotal)}
              </p>
            ) : null}
          </div>
        </ChartCard>
      </div>
    </section>
  );
}
