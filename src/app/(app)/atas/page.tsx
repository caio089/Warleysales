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
    const [atas, lookups] = await Promise.all([ctx.services.atas.list(ctx.actor), loadLookups(ctx)]);
    if (!atas.ok) return atas;
    if (!lookups.ok) return lookups;
    return ok({ atas: atas.data, lookups: lookups.data, canCreate: canInAnyCouncil(ctx.actor, "ata.manage") });
  });
  return (
    <Screen result={result}>
      {({ atas, lookups, canCreate }) => (
        <>
        <PageHeader title="Atas de registro de preços" description="Vigência de 1 ano, prorrogável uma vez por igual período (art. 84, Lei 14.133/2021)." actions={canCreate ? <Link href="/atas/nova" className={buttonVariants()}>Nova ata</Link> : undefined} />
        <SimpleTable
          caption="Atas de registro de preços"
          rows={atas.map((a) => ({ id: a.ata.id, number: a.ata.number, council: lookups.councilLabel[a.ata.councilId] ?? "—", status: a.ata.status === "rascunho" ? "Rascunho" : a.validity === "vigente" ? "Vigente" : "Vencida", endDate: a.endDate, extensions: a.ata.extensions.length, href: `/atas/${a.ata.id}` }))}
          columns={[
            { key: "number", header: "Número", kind: "link", hrefKey: "href" }, { key: "council", header: "Conselho gerenciador" },
            { key: "status", header: "Situação" }, { key: "endDate", header: "Vigência até", kind: "date" }, { key: "extensions", header: "Prorrogações", kind: "number" },
          ]}
          filterKeys={[{ key: "status", label: "Situação" }]}
          emptyTitle="Nenhuma ata cadastrada"
          emptyDescription="Atas de registro de preços são distintas de contratos, estoque e atas de reunião."
        />
        </>
      )}
    </Screen>
  );
}

export default function AtasPage() {
  return <Suspense fallback={<LoadingState />}><Content /></Suspense>;
}
