"use client";

import Link from "next/link";
import {
  CheckCircle2,
  ClipboardList,
  Package,
  PiggyBank,
  Timer,
  Wallet,
} from "lucide-react";
import { formatCurrency } from "@/shared/lib/format";
import { BarStatList } from "@/shared/ui/charts/bar-stat-list";
import { DonutChart } from "@/shared/ui/charts/donut-chart";
import { cn } from "@/lib/utils";

export type HomeOverviewProps = {
  isWarley: boolean;
  requests: { pending: number; inProgress: number; completed: number };
  processStatuses: Array<{ status: string; count: number }>;
  stockAttention: number;
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
        "group flex h-full flex-col gap-2 rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md",
        href && "cursor-pointer",
      )}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="flex size-8 items-center justify-center rounded-xl bg-muted/70 text-primary transition group-hover:bg-primary/10">
          <Icon className="size-4" aria-hidden />
        </span>
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className={cn("text-2xl font-semibold tabular-nums tracking-tight sm:text-3xl", toneClass)}>{value}</p>
      <p className="text-xs leading-snug text-muted-foreground">{hint}</p>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl">
        {content}
      </Link>
    );
  }
  return content;
}

/** Visão do dia: gráficos leves + números grandes, sem jargão. */
export function HomeOverview({
  isWarley,
  requests,
  processStatuses,
  stockAttention,
  savingsTotal,
  savingsProcesses,
  approvalsWaiting = 0,
  formalizationsWaiting = 0,
  overdueProcesses = 0,
}: HomeOverviewProps) {
  const requestTotal = requests.pending + requests.inProgress + requests.completed;
  const processBars = processStatuses
    .filter((row) => row.count > 0)
    .map((row) => ({
      id: row.status,
      label: PROCESS_LABEL[row.status] ?? row.status.replaceAll("_", " "),
      value: row.count,
      barClassName: PROCESS_BAR[row.status] ?? "bg-primary",
    }));

  const bigStats = isWarley
    ? [
        {
          icon: ClipboardList,
          value: approvalsWaiting,
          label: "Para aprovar",
          hint: approvalsWaiting === 1 ? "1 pedido te espera" : "Pedidos aguardando sua ok",
          href: "/aprovacoes",
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
      ];

  return (
    <section
      aria-labelledby="home-overview-title"
      className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-4"
    >
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="home-overview-title" className="font-heading text-lg font-semibold text-foreground sm:text-xl">
            Como está hoje
          </h2>
          <p className="text-sm text-muted-foreground">
            {isWarley
              ? "Um olhar rápido no que pede sua atenção e no andamento do trabalho."
              : "Pedidos, estoque e prazos do seu órgão, em uma só vista."}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {bigStats.map((stat) => (
          <BigStat key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm transition duration-300 hover:shadow-md">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Solicitações</h3>
          <DonutChart
            centerLabel="Total"
            centerValue={requestTotal}
            slices={[
              { id: "pending", label: "Aguardando", value: requests.pending, color: "#f59e0b" },
              { id: "progress", label: "Em andamento", value: requests.inProgress, color: "#0f2942" },
              { id: "done", label: "Concluídas", value: requests.completed, color: "#10b981" },
            ]}
          />
        </article>

        <article className="flex flex-col gap-5 rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm transition duration-300 hover:shadow-md">
          {isWarley ? (
            <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-white p-4 ring-1 ring-emerald-100">
              <div className="flex items-center gap-2 text-emerald-800">
                <PiggyBank className="size-4" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-wide">Economia gerada</span>
              </div>
              <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-emerald-700">
                {formatCurrency(savingsTotal)}
              </p>
              <p className="mt-1 text-xs text-emerald-800/80">
                {savingsProcesses > 0
                  ? `Diferença entre pesquisa e ata em ${savingsProcesses} processo${savingsProcesses === 1 ? "" : "s"}.`
                  : "Quando houver atas com economia, o valor aparece aqui."}
              </p>
            </div>
          ) : (
            <div className="rounded-xl bg-gradient-to-br from-slate-50 to-white p-4 ring-1 ring-border/60">
              <div className="flex items-center gap-2 text-primary">
                <Package className="size-4" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-wide">Estoque</span>
              </div>
              <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-primary">{stockAttention}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {stockAttention > 0
                  ? "Itens abaixo do mínimo — vale conferir a reposição."
                  : "Nada crítico no estoque neste momento."}
              </p>
              {stockAttention > 0 ? (
                <Link href="/estoque" className="mt-2 inline-block text-xs font-semibold text-primary hover:underline">
                  Ver estoque
                </Link>
              ) : null}
            </div>
          )}

          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Andamento dos processos</h3>
            <BarStatList items={processBars} emptyLabel="Ainda não há processos neste recorte." />
          </div>
        </article>
      </div>
    </section>
  );
}
