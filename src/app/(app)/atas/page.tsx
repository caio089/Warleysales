import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { buttonVariants } from "@/components/ui/button";
import { loadLookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { canInAnyCouncil } from "@/shared/lib/authz/policy";
import { ok } from "@/shared/lib/result";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
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
        <PageHeader eyebrow="Compras" title="Atas de registro de preços" description="Vigência de 1 ano, prorrogável 1× (art. 84, Lei 14.133/2021). Rascunho não consome saldo. A ata ligada a um processo aparece junto do contrato desse processo." actions={canCreate ? <Link href="/atas/nova" className={buttonVariants()}>Nova ata</Link> : undefined} />
        <SimpleTable
          caption="Atas de registro de preços"
          rows={atas.map((a) => ({ id: a.ata.id, number: a.ata.number, council: lookups.councilLabel[a.ata.councilId] ?? "—", process: a.ata.processId ? (processLabel[a.ata.processId] ?? "Processo") : "—", status: a.ata.status === "rascunho" ? "Rascunho" : a.validity === "vigente" ? "Vigente" : "Vencida", endDate: a.endDate, extensions: a.ata.extensions.length, href: `/atas/${a.ata.id}`, processHref: a.ata.processId ? `/processos/${a.ata.processId}` : "" }))}
          columns={[
            { key: "number", header: "Número", kind: "link", hrefKey: "href" }, { key: "council", header: "Conselho gerenciador" },
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
