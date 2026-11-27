import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BarChart3, Download, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuditFilter } from "@/modules/audit/schemas";
import { auditSources, operationalSources } from "@/modules/reports/analysis";
import { demoCouncilIds, hasOperationalData, savingsForExport } from "@/modules/reports/export-data";
import { loadLookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { canReportOnPerson } from "@/shared/lib/authz/policy";
import { formatCurrency, formatPercent } from "@/shared/lib/format";
import { fail, ok } from "@/shared/lib/result";
import { toFortalezaDate } from "@/shared/lib/time";
import { LoadingState } from "@/shared/ui/feedback-states";
import { KpiCard } from "@/shared/ui/kpi-card";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { ModuleInsightFallback } from "@/shared/ui/module-insight";
import { presentationOf, PROCESS_STATUS } from "@/shared/ui/status-presentation";
import { AuditTrailTab } from "./audit-trail-tab";
import { ReportAnalysisPanel } from "./report-analysis";
import { ReportCentral } from "./central";

export const metadata: Metadata = { title: "Relatórios" };

function one(val: string | string[] | undefined): string | undefined {
  return Array.isArray(val) ? val[0] : val;
}

interface ReportsPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function OperationalContent({ officialOnly }: { officialOnly: boolean }) {
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
    const officialFormalizations = formalizations.data.filter((item) => !excludedIds.includes(item.councilId));
    const mayPreview = !officialOnly && excludedIds.length > 0 && !hasOperationalData(operational.data, officialFormalizations.length);
    const candidate = mayPreview ? await services.reports.operationalSummary(actor) : operational;
    if (!candidate.ok) return candidate;
    const preview = mayPreview && hasOperationalData(candidate.data, formalizations.data.length);
    return ok({
      summary: preview ? candidate.data : operational.data,
      savings: savingsForExport(preview ? formalizations.data : officialFormalizations),
      preview,
      officialOnly,
    });
  });

  return (
    <Screen result={result}>
      {({ summary: s, savings, preview, officialOnly: onlyOfficial }) => (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">{preview ? "Prévia de demonstração: estes dados servem para conhecer o sistema." : "Indicadores oficiais: dados de demonstração excluídos."}</p>
            <a href={`/api/reports/pdf?kind=operational${onlyOfficial ? "&mode=official" : ""}`} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:border-primary/40 hover:text-primary">
              <Download className="size-4" aria-hidden />
              Baixar relatório em PDF
            </a>
          </div>
          {preview ? <div role="status" className="rounded-xl border border-warning-foreground/30 bg-warning p-4 text-sm text-warning-foreground"><strong>Dados de demonstração.</strong> Ainda não há registros operacionais oficiais. Os números abaixo e o PDF são uma prévia e não devem ser usados como prestação de contas. <Link href="/relatorios?tab=indicadores&mode=official" className="font-semibold underline">Ver somente dados oficiais</Link>.</div> : null}
          {onlyOfficial && !hasOperationalData(s, savings.count) ? <div role="status" className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">Ainda não há registros operacionais oficiais. <Link href="/relatorios?tab=indicadores" className="font-semibold text-primary underline">Ver prévia de demonstração</Link>.</div> : null}
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
    if (filter.actorId && !canReportOnPerson(ctx.actor, filter.actorId)) {
      return fail("FORBIDDEN", "Você não pode emitir um relatório individual sobre sua própria atuação.");
    }
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

async function ReportTabs(props: ReportsPageProps) {
  const rawParams = props.searchParams ? await props.searchParams : {};
  const tab = one(rawParams.tab) === "auditoria" ? "auditoria" : one(rawParams.tab) === "central" ? "central" : "indicadores";
  const officialOnly = one(rawParams.mode) === "official";

  return (
      <div className="space-y-6">
        <div role="tablist" aria-label="Abas de relatórios" className="flex flex-wrap gap-2 border-b border-border pb-4">
          <Link href="/relatorios?tab=central" role="tab" aria-selected={tab === "central"} className={cn("inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium", tab === "central" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground")}>Central de Relatórios</Link>
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

        <Suspense key={`${tab}-${officialOnly}`} fallback={<LoadingState />}>
          {tab === "central" ? <ReportCentral raw={rawParams} /> : tab === "indicadores" ? (
            <OperationalContent officialOnly={officialOnly} />
          ) : (
            <AuditContent rawParams={rawParams} />
          )}
        </Suspense>
      </div>
  );
}

export default function ReportsPage(props: ReportsPageProps) {
  return (
    <>
      <PageHeader title="Relatórios" description="Indicadores operacionais e trilha completa de auditoria com conformidade normativa." />
      <Suspense fallback={<LoadingState title="Carregando relatórios…" />}>
        <ReportTabs searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}
