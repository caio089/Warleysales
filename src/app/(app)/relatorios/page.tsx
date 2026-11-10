import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BarChart3, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuditFilter } from "@/modules/audit/schemas";
import { loadLookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { formatCurrency, formatPercent } from "@/shared/lib/format";
import { ok } from "@/shared/lib/result";
import { toFortalezaDate } from "@/shared/lib/time";
import { LoadingState } from "@/shared/ui/feedback-states";
import { KpiCard } from "@/shared/ui/kpi-card";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { presentationOf, PROCESS_STATUS } from "@/shared/ui/status-presentation";
import { AuditTrailTab } from "./audit-trail-tab";

export const metadata: Metadata = { title: "Relatórios" };

function one(val: string | string[] | undefined): string | undefined {
  return Array.isArray(val) ? val[0] : val;
}

interface ReportsPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function OperationalContent() {
  const result = await loadScreen(async ({ services, actor }) => {
    const [operational, savings] = await Promise.all([
      services.reports.operationalSummary(actor),
      services.formalizations.getSavingsSummary(actor),
    ]);
    if (!operational.ok) return operational;
    return ok({
      summary: operational.data,
      savings: savings.ok ? savings.data : null,
    });
  });

  return (
    <Screen result={result}>
      {({ summary: s, savings }) => (
        <div className="space-y-6">
          <section aria-labelledby="proc">
            <h2 id="proc" className="mb-3 text-base font-semibold">Processos por situação</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Object.keys(s.processes.byStatus).length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum processo no período.</p>
              ) : null}
              {Object.entries(s.processes.byStatus).map(([status, count]) => (
                <KpiCard key={status} label={presentationOf(PROCESS_STATUS, status).label} value={count} />
              ))}
              <KpiCard
                label="Progresso documental médio"
                value={s.processes.averageProgress === null ? null : formatPercent(s.processes.averageProgress)}
              />
            </div>
          </section>

          <section aria-labelledby="est">
            <h2 id="est" className="mb-3 text-base font-semibold">Estoque, contratos e atas</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard label="Itens críticos" value={s.stock.critical} />
              <KpiCard label="Sem disponibilidade" value={s.stock.withoutAvailability} />
              <KpiCard label="Contratos vencendo em 30 dias" value={s.contracts.expiring30} />
              <KpiCard label="Atas vencidas" value={s.atas.expired} />
            </div>
          </section>

          <section aria-labelledby="econ">
            <h2 id="econ" className="mb-3 text-base font-semibold">Economia e formalizações homologadas</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard
                label="Economia Gerada"
                value={savings ? formatCurrency(savings.totalSavings) : "—"}
                hint={savings ? `${formatPercent(savings.averageSavingsPercent)} redução média` : undefined}
                accent={Boolean(savings && savings.totalSavings > 0)}
              />
              <KpiCard
                label="Total Estimado"
                value={savings ? formatCurrency(savings.totalEstimated) : "—"}
              />
              <KpiCard
                label="Total Contratado"
                value={savings ? formatCurrency(savings.totalContracted) : "—"}
              />
              <KpiCard
                label="Contratações Homologadas"
                value={savings ? savings.count : "—"}
              />
            </div>
          </section>
        </div>
      )}
    </Screen>
  );
}

async function AuditContent({ rawParams }: { rawParams: Record<string, string | string[] | undefined> }) {
  const councilId = one(rawParams.councilId);
  const entity = one(rawParams.entity);
  const actorId = one(rawParams.actorId);
  const period = one(rawParams.period);
  const resultFilter = one(rawParams.result);

  const filter: AuditFilter = {};
  if (councilId) filter.councilId = councilId;
  if (entity) filter.entity = entity;
  if (actorId) filter.actorId = actorId;
  if (
    resultFilter &&
    resultFilter !== "todos" &&
    (resultFilter === "success" || resultFilter === "denied" || resultFilter === "error")
  ) {
    filter.result = resultFilter;
  }
  if (period === "hoje") {
    filter.startDate = toFortalezaDate(new Date());
  } else if (period === "7d") {
    filter.startDate = new Date(Date.now() - 7 * 86_400_000).toISOString();
  } else if (period === "30d") {
    filter.startDate = new Date(Date.now() - 30 * 86_400_000).toISOString();
  }

  const result = await loadScreen(async (ctx) => {
    const [entriesRes, lookupsRes] = await Promise.all([
      ctx.services.audit.list(ctx.actor, filter),
      loadLookups(ctx),
    ]);
    if (!entriesRes.ok) return entriesRes;
    const lookups = lookupsRes.ok
      ? lookupsRes.data
      : { councils: [], councilLabel: {}, materials: [], materialLabel: {} };
    return ok({
      entries: entriesRes.data,
      lookups,
    });
  });

  return (
    <Screen result={result}>
      {({ entries, lookups }) => (
        <AuditTrailTab
          entries={entries}
          councils={lookups.councils}
          councilLabel={lookups.councilLabel}
          initialFilters={{
            councilId,
            entity,
            actorId,
            period,
            result: resultFilter,
          }}
        />
      )}
    </Screen>
  );
}

export default async function ReportsPage(props: ReportsPageProps) {
  const rawParams = props.searchParams ? await props.searchParams : {};
  const tab = one(rawParams.tab) === "auditoria" ? "auditoria" : "indicadores";

  return (
    <>
      <PageHeader
        title="Relatórios"
        description="Indicadores operacionais e trilha completa de auditoria com conformidade normativa."
      />
      <div className="space-y-6">
        <div role="tablist" aria-label="Abas de relatórios" className="flex flex-wrap gap-2 border-b border-border pb-4">
          <Link
            href="/relatorios?tab=indicadores"
            role="tab"
            aria-selected={tab === "indicadores"}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
              tab === "indicadores"
                ? "border-primary bg-primary text-primary-foreground shadow-xs"
                : "border-border bg-card text-muted-foreground hover:-translate-y-0.5 hover:border-primary/30 hover:text-primary hover:shadow-xs",
            )}
          >
            <BarChart3 className="size-4" aria-hidden />
            Indicadores Operacionais
          </Link>
          <Link
            href="/relatorios?tab=auditoria"
            role="tab"
            aria-selected={tab === "auditoria"}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
              tab === "auditoria"
                ? "border-primary bg-primary text-primary-foreground shadow-xs"
                : "border-border bg-card text-muted-foreground hover:-translate-y-0.5 hover:border-primary/30 hover:text-primary hover:shadow-xs",
            )}
          >
            <ShieldCheck className="size-4" aria-hidden />
            Trilha de Auditoria & Conformidade
          </Link>
        </div>

        <Suspense key={tab} fallback={<LoadingState />}>
          {tab === "indicadores" ? (
            <OperationalContent />
          ) : (
            <AuditContent rawParams={rawParams} />
          )}
        </Suspense>
      </div>
    </>
  );
}
