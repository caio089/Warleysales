import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CalendarClock, CircleAlert, FileText, Wallet } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { loadLookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { canInAnyCouncil } from "@/shared/lib/authz/policy";
import { formatCurrency } from "@/shared/lib/format";
import { ok } from "@/shared/lib/result";
import { LoadingState } from "@/shared/ui/feedback-states";
import { KpiCard } from "@/shared/ui/kpi-card";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { ModuleInsight, ModuleInsightFallback } from "@/shared/ui/module-insight";
import { SimpleTable } from "@/shared/ui/simple-table";

export const metadata: Metadata = { title: "Contratos" };

async function Content() {
  const result = await loadScreen(async (ctx) => {
    const [contracts, lookups, processes] = await Promise.all([ctx.services.contracts.list(ctx.actor), loadLookups(ctx), ctx.services.processes.list(ctx.actor)]);
    if (!contracts.ok) return contracts;
    if (!lookups.ok) return lookups;
    if (!processes.ok) return processes;
    const processLabel = Object.fromEntries(processes.data.map((view) => [view.process.id, `${view.process.number} — ${view.process.title}`]));
    return ok({ contracts: contracts.data, lookups: lookups.data, processLabel, canCreate: canInAnyCouncil(ctx.actor, "contract.create") });
  });
  return (
    <Screen result={result}>
      {({ contracts, lookups, processLabel, canCreate }) => (
        <>
        <PageHeader eyebrow="Acompanhamento · Compras" title="Contratos" description="Consulte vigências, valores e aditivos. Contratos vinculados a processos aparecem junto das respectivas atas." actions={canCreate ? <Link href="/contratos/novo" className={buttonVariants()}>Novo contrato</Link> : undefined} />
        <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumo dos contratos">
          <KpiCard icon={<FileText className="size-4" aria-hidden />} label="Total de contratos" value={contracts.length} />
          <KpiCard icon={<CalendarClock className="size-4" aria-hidden />} label="Vencem em 30 dias" value={contracts.filter((c) => c.remainingDays >= 0 && c.remainingDays <= 30).length} accent={contracts.some((c) => c.remainingDays >= 0 && c.remainingDays <= 30)} />
          <KpiCard icon={<CircleAlert className="size-4" aria-hidden />} label="Vencidos" value={contracts.filter((c) => c.remainingDays < 0).length} accent={contracts.some((c) => c.remainingDays < 0)} />
          <KpiCard icon={<Wallet className="size-4" aria-hidden />} label="Valor vigente" value={formatCurrency(contracts.reduce((sum, c) => sum + c.terms.value, 0))} hint="Soma dos contratos" />
        </div>
        <Suspense fallback={<ModuleInsightFallback />}>
          <ModuleInsight moduleName="Contratos" sourceHref="/contratos" facts={[
            { label: "Total", value: contracts.length },
            { label: "Vencidos", value: contracts.filter((c) => c.remainingDays < 0).length },
            { label: "Vencem em 30 dias", value: contracts.filter((c) => c.remainingDays >= 0 && c.remainingDays <= 30).length },
          ]} />
        </Suspense>
        <SimpleTable
          caption="Contratos"
          rows={contracts.map((c) => ({ id: c.contract.id, number: c.contract.number, council: lookups.councilLabel[c.contract.councilId] ?? "—", process: c.contract.processId ? (processLabel[c.contract.processId] ?? "Processo") : "—", object: c.contract.object, endDate: c.terms.endDate, remaining: c.remainingDays, elapsed: c.elapsedPercent, href: `/contratos/${c.contract.id}`, processHref: c.contract.processId ? `/processos/${c.contract.processId}` : "" }))}
          columns={[
            { key: "number", header: "Número", kind: "link", hrefKey: "href" }, { key: "council", header: "Órgão" }, { key: "process", header: "Processo", kind: "link", hrefKey: "processHref" }, { key: "object", header: "Objeto" },
            { key: "endDate", header: "Vigência até", kind: "date" }, { key: "remaining", header: "Dias restantes", kind: "number" }, { key: "elapsed", header: "Vigência decorrida", kind: "progress" },
          ]}
          filterKeys={[{ key: "council", label: "Órgão" }]}
          emptyTitle="Nenhum contrato no banco"
          emptyDescription="Cadastre o primeiro contrato. Aditivos preservam prazo e valor anteriores."
          emptyAction={canCreate ? <Link href="/contratos/novo" className={buttonVariants()}>Criar contrato</Link> : undefined}
        />
        </>
      )}
    </Screen>
  );
}

export default function ContractsPage() {
  return <Suspense fallback={<LoadingState />}><Content /></Suspense>;
}
