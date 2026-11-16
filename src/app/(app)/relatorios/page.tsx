import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BarChart3, Download, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuditFilter } from "@/modules/audit/schemas";
import { auditSources, operationalSources } from "@/modules/reports/analysis";
import { demoCouncilIds, savingsForExport } from "@/modules/reports/export-data";
import { loadLookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { formatCurrency, formatPercent } from "@/shared/lib/format";
import { ok } from "@/shared/lib/result";
import { toFortalezaDate } from "@/shared/lib/time";
import { LoadingState } from "@/shared/ui/feedback-states";
import { KpiCard } from "@/shared/ui/kpi-card";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { ModuleInsightFallback } from "@/shared/ui/module-insight";
import { presentationOf, PROCESS_STATUS } from "@/shared/ui/status-presentation";
import { AuditTrailTab } from "./audit-trail-tab";
import { ReportAnalysisPanel } from "./report-analysis";

export const metadata: Metadata = { title: "Relatórios" };

function one(val: string | string[] | undefined): string | undefined {
  return Array.isArray(val) ? val[0] : val;
}

interface ReportsPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function OperationalContent() {
  const result = await loadScreen(async ({ services, actor }) => {
    const councils = await services.councils.list(actor);
    if (!councils.ok) return councils;
    const excludedIds = demoCouncilIds(councils.data);
    const [operational, formalizations] = await Promise.all([
      services.reports.operationalSummary(actor, { excludeCouncilIds: excludedIds }),
      services.formalizations.listHomologated(actor),
    ]);
    if (!operational.ok) return operational;
    if (!formalizations.ok) return formalizations;
    return ok({
      summary: operational.data,
      savings: savingsForExport(formalizations.data.filter((item) => !excludedIds.includes(item.councilId))),
    });
  });

  return (
    <Screen result={result}>
      {({ summary: s, savings }) => (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">Indicadores oficiais: registros de demonstração não entram no consolidado nem no PDF.</p>
            <a href="/api/reports/pdf?kind=operational" className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:border-primary/40 hover:text-primary">
              <Download className="size-4" aria-hidden />
              Baixar relatório em PDF
            </a>
          </div>
          <Suspense fallback={<ModuleInsightFallback />}>
            <ReportAnalysisPanel sources={operationalSources(s, savings)} />
          </Suspense>
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
  const action = one(rawParams.action);
  const actorId = one(rawParams.actorId);
  const period = one(rawParams.period);
  const resultFilter = one(rawParams.result);

  const filter: AuditFilter = {};
  if (councilId) filter.councilId = councilId;
  if (entity) filter.entity = entity;
  if (action) filter.action = action;
  if (actorId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(actorId)) filter.actorId = actorId;
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
    filter.startDate = new Date(new Date().getTime() - 7 * 86_400_000).toISOString();
  } else if (period === "30d") {
    filter.startDate = new Date(new Date().getTime() - 30 * 86_400_000).toISOString();
  }

  const result = await loadScreen(async (ctx) => {
    const [entriesRes, lookupsRes] = await Promise.all([
      ctx.services.audit.list(ctx.actor, filter),
      loadLookups(ctx),
    ]);
    if (!entriesRes.ok) return entriesRes;
    const lookups = lookupsRes.ok
      ? lookupsRes.data
      : { councils: [], councilLabel: {}, materials: [], materialLabel: {}, materialName: {} };
    return ok({
      entries: entriesRes.data,
      lookups,
    });
  });
  const sourceParams = new URLSearchParams();
  if (councilId) sourceParams.set("councilId", councilId);
  if (entity) sourceParams.set("entity", entity);
  if (action) sourceParams.set("action", action);
  if (actorId) sourceParams.set("actorId", actorId);
  if (period) sourceParams.set("period", period);
  if (resultFilter) sourceParams.set("result", resultFilter);

  return (
    <Screen result={result}>
      {({ entries, lookups }) => (
        <div className="space-y-6">
          <Suspense fallback={<ModuleInsightFallback />}>
            <ReportAnalysisPanel sources={auditSources(entries, sourceParams.toString())} />
          </Suspense>
        <AuditTrailTab
          key={JSON.stringify([councilId, entity, action, actorId, period, resultFilter, entries[0]?.id])}
          entries={entries}
          councils={lookups.councils}
          councilLabel={lookups.councilLabel}
          initialFilters={{
            councilId,
            entity,
            action,
            actorId,
            period,
            result: resultFilter,
          }}
        />
        </div>
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
