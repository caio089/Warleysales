import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeftRight, CheckCircle2, Clock3, Package } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { loadLookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { canInAnyCouncil } from "@/shared/lib/authz/policy";
import { ok } from "@/shared/lib/result";
import { LoadingState } from "@/shared/ui/feedback-states";
import { KpiCard } from "@/shared/ui/kpi-card";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { ModuleInsight, ModuleInsightFallback } from "@/shared/ui/module-insight";
import { SimpleTable } from "@/shared/ui/simple-table";

export const metadata: Metadata = { title: "Transferências" };

async function Content() {
  const result = await loadScreen(async (ctx) => {
    const [transfers, lookups] = await Promise.all([ctx.services.transfers.list(ctx.actor), loadLookups(ctx)]);
    if (!transfers.ok) return transfers;
    if (!lookups.ok) return lookups;
    return ok({ transfers: transfers.data, lookups: lookups.data, canCreate: canInAnyCouncil(ctx.actor, "transfer.request") });
  });
  return (
    <Screen result={result}>
      {({ transfers, lookups, canCreate }) => (
        <>
        <PageHeader eyebrow="Estoque · Distribuição" title="Transferências" description="Acompanhe as solicitações entre órgãos. Material em trânsito não fica disponível na origem nem no destino." actions={canCreate ? <Link href="/transferencias/nova" className={buttonVariants()}>Nova transferência</Link> : undefined} />
        <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumo das transferências">
          <KpiCard icon={<ArrowLeftRight className="size-4" aria-hidden />} label="Total" value={transfers.length} />
          <KpiCard icon={<Clock3 className="size-4" aria-hidden />} label="Em andamento" value={transfers.filter((t) => !["recebida", "cancelada", "recusada"].includes(t.status)).length} accent={transfers.some((t) => !["recebida", "cancelada", "recusada"].includes(t.status))} />
          <KpiCard icon={<CheckCircle2 className="size-4" aria-hidden />} label="Recebidas" value={transfers.filter((t) => t.status === "recebida").length} />
          <KpiCard icon={<Package className="size-4" aria-hidden />} label="Itens solicitados" value={transfers.reduce((sum, t) => sum + t.items.length, 0)} />
        </div>
        <Suspense fallback={<ModuleInsightFallback />}>
          <ModuleInsight moduleName="Transferências" sourceHref="/transferencias" facts={[
            { label: "Total", value: transfers.length },
            { label: "Em andamento", value: transfers.filter((t) => !["recebida", "cancelada", "recusada"].includes(t.status)).length },
            { label: "Recebidas", value: transfers.filter((t) => t.status === "recebida").length },
          ]} />
        </Suspense>
        <SimpleTable
          caption="Transferências entre conselhos"
          rows={transfers.map((t) => ({ id: t.id, origin: lookups.councilLabel[t.originCouncilId] ?? "—", destination: lookups.councilLabel[t.destinationCouncilId] ?? "—", status: t.status, items: t.items.length, createdAt: t.createdAt.toISOString(), href: `/transferencias/${t.id}` }))}
          columns={[
            { key: "origin", header: "Origem", kind: "link", hrefKey: "href" }, { key: "destination", header: "Destino" },
            { key: "status", header: "Status", kind: "status", dictionary: "transfer" }, { key: "items", header: "Itens", kind: "number" }, { key: "createdAt", header: "Solicitada em", kind: "datetime" },
          ]}
          filterKeys={[{ key: "status", label: "Status", dictionary: "transfer" }]}
          emptyTitle="Nenhuma transferência no banco"
          emptyDescription="Solicite a transferência pelo conselho de destino. A origem aprova, separa e despacha."
          emptyAction={canCreate ? <Link href="/transferencias/nova" className={buttonVariants()}>Nova transferência</Link> : undefined}
        />
        </>
      )}
    </Screen>
  );
}

export default function TransfersPage() {
  return <Suspense fallback={<LoadingState />}><Content /></Suspense>;
}
