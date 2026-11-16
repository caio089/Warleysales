import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Archive, CircleAlert, Clock3, FileCheck2 } from "lucide-react";
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

export const metadata: Metadata = { title: "Atas de registro de preços" };

async function Content() {
  const result = await loadScreen(async (ctx) => {
    const [atas, lookups, processes] = await Promise.all([ctx.services.atas.list(ctx.actor), loadLookups(ctx), ctx.services.processes.list(ctx.actor)]);
    if (!atas.ok) return atas;
    if (!lookups.ok) return lookups;
    if (!processes.ok) return processes;
    const processLabel = Object.fromEntries(processes.data.map((view) => [view.process.id, `${view.process.number} — ${view.process.title}`]));
    return ok({ atas: atas.data, lookups: lookups.data, processLabel, canCreate: canInAnyCouncil(ctx.actor, "ata.manage") });
  });
  return (
    <Screen result={result}>
      {({ atas, lookups, processLabel, canCreate }) => (
        <>
        <PageHeader eyebrow="Acompanhamento · Compras" title="Atas de registro de preços" description="Acompanhe vigência, prorrogações e o vínculo de cada ata com seu processo. Rascunhos ainda não consomem saldo." actions={canCreate ? <Link href="/atas/nova" className={buttonVariants()}>Nova ata</Link> : undefined} />
        <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumo das atas">
          <KpiCard icon={<Archive className="size-4" aria-hidden />} label="Total de atas" value={atas.length} />
          <KpiCard icon={<Clock3 className="size-4" aria-hidden />} label="Rascunhos" value={atas.filter((a) => a.ata.status === "rascunho").length} hint="Aguardam ativação" />
          <KpiCard icon={<FileCheck2 className="size-4" aria-hidden />} label="Vigentes" value={atas.filter((a) => a.validity === "vigente" && a.ata.status !== "rascunho").length} />
          <KpiCard icon={<CircleAlert className="size-4" aria-hidden />} label="Vencidas" value={atas.filter((a) => a.validity !== "vigente" && a.ata.status !== "rascunho").length} accent={atas.some((a) => a.validity !== "vigente" && a.ata.status !== "rascunho")} />
        </div>
        <Suspense fallback={<ModuleInsightFallback />}>
          <ModuleInsight moduleName="Atas" sourceHref="/atas" facts={[
            { label: "Total", value: atas.length },
            { label: "Rascunhos", value: atas.filter((a) => a.ata.status === "rascunho").length },
            { label: "Vigentes", value: atas.filter((a) => a.validity === "vigente" && a.ata.status !== "rascunho").length },
            { label: "Vencidas", value: atas.filter((a) => a.validity !== "vigente" && a.ata.status !== "rascunho").length },
          ]} />
        </Suspense>
        <SimpleTable
          caption="Atas de registro de preços"
          rows={atas.map((a) => ({ id: a.ata.id, number: a.ata.number, council: lookups.councilLabel[a.ata.councilId] ?? "—", process: a.ata.processId ? (processLabel[a.ata.processId] ?? "Processo") : "—", status: a.ata.status === "rascunho" ? "Rascunho" : a.validity === "vigente" ? "Vigente" : "Vencida", endDate: a.endDate, extensions: a.ata.extensions.length, href: `/atas/${a.ata.id}`, processHref: a.ata.processId ? `/processos/${a.ata.processId}` : "" }))}
          columns={[
            { key: "number", header: "Número", kind: "link", hrefKey: "href" }, { key: "council", header: "Órgão gerenciador" },
            { key: "process", header: "Processo", kind: "link", hrefKey: "processHref" },
            { key: "status", header: "Situação" }, { key: "endDate", header: "Vigência até", kind: "date" }, { key: "extensions", header: "Prorrogações", kind: "number" },
          ]}
          filterKeys={[{ key: "status", label: "Situação" }]}
          emptyTitle="Nenhuma ata no banco"
          emptyDescription="Cadastre a ata, ative e use nas solicitações para o saldo comprometido aparecer."
          emptyAction={canCreate ? <Link href="/atas/nova" className={buttonVariants()}>Criar ata</Link> : undefined}
        />
        </>
      )}
    </Screen>
  );
}

export default function AtasPage() {
  return <Suspense fallback={<LoadingState />}><Content /></Suspense>;
}
