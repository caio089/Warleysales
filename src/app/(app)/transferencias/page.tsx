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
        <PageHeader title="Transferências" description="Material em trânsito não está disponível em nenhum dos conselhos." actions={canCreate ? <Link href="/transferencias/nova" className={buttonVariants()}>Nova transferência</Link> : undefined} />
        <SimpleTable
          caption="Transferências entre conselhos"
          rows={transfers.map((t) => ({ id: t.id, origin: lookups.councilLabel[t.originCouncilId] ?? "—", destination: lookups.councilLabel[t.destinationCouncilId] ?? "—", status: t.status, items: t.items.length, createdAt: t.createdAt.toISOString(), href: `/transferencias/${t.id}` }))}
          columns={[
            { key: "origin", header: "Origem", kind: "link", hrefKey: "href" }, { key: "destination", header: "Destino" },
            { key: "status", header: "Status", kind: "status", dictionary: "transfer" }, { key: "items", header: "Itens", kind: "number" }, { key: "createdAt", header: "Solicitada em", kind: "datetime" },
          ]}
          filterKeys={[{ key: "status", label: "Status", dictionary: "transfer" }]}
          emptyTitle="Nenhuma transferência"
        />
        </>
      )}
    </Screen>
  );
}

export default function TransfersPage() {
  return <Suspense fallback={<LoadingState />}><Content /></Suspense>;
}
