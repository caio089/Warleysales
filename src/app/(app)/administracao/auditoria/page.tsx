import type { Metadata } from "next";
import { Suspense } from "react";
import type { AuditFilter } from "@/modules/audit/schemas";
import { loadLookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { ok } from "@/shared/lib/result";
import { toFortalezaDate } from "@/shared/lib/time";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { AuditTrailTab } from "../../relatorios/audit-trail-tab";

export const metadata: Metadata = { title: "Auditoria" };

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

interface AuditPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function Content({ rawParams }: { rawParams: Record<string, string | string[] | undefined> }) {
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

export default async function AuditPage(props: AuditPageProps) {
  const rawParams = props.searchParams ? await props.searchParams : {};
  return (
    <>
      <PageHeader
        title="Auditoria"
        description="Registros somente de inclusão: não podem ser alterados nem apagados."
      />
      <Suspense fallback={<LoadingState />}>
        <Content rawParams={rawParams} />
      </Suspense>
    </>
  );
}
