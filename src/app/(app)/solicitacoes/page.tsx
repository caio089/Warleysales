import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { buttonVariants } from "@/components/ui/button";
import { loadLookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { ok } from "@/shared/lib/result";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { SimpleTable } from "@/shared/ui/simple-table";

export const metadata: Metadata = { title: "Solicitações" };

async function Content() {
  const result = await loadScreen(async (ctx) => {
    const [requests, lookups] = await Promise.all([ctx.services.purchases.list(ctx.actor), loadLookups(ctx)]);
    if (!requests.ok) return requests;
    if (!lookups.ok) return lookups;
    return ok({ requests: requests.data, lookups: lookups.data });
  });
  return (
    <Screen result={result}>
      {({ requests, lookups }) => (
        <SimpleTable
          caption="Solicitações de compra"
          rows={requests.map((r) => ({ id: r.id, title: r.title, council: lookups.councilLabel[r.councilId] ?? "—", status: r.status, items: r.items.length, createdAt: r.createdAt.toISOString(), href: `/solicitacoes/${r.id}` }))}
          columns={[
            { key: "title", header: "Solicitação", kind: "link", hrefKey: "href" },
            { key: "council", header: "Conselho" },
            { key: "status", header: "Status", kind: "status", dictionary: "request" },
            { key: "items", header: "Itens", kind: "number" },
            { key: "createdAt", header: "Criada em", kind: "datetime" },
          ]}
          filterKeys={[{ key: "status", label: "Status", dictionary: "request" }]}
          emptyTitle="Nenhuma solicitação"
          emptyDescription="Crie uma solicitação para pedir materiais."
        />
      )}
    </Screen>
  );
}

export default function RequestsPage() {
  return (
    <>
      <PageHeader title="Solicitações" description="Solicitações de compra e seu atendimento." actions={<Link href="/solicitacoes/nova" className={buttonVariants()}>Nova solicitação</Link>} />
      <Suspense fallback={<LoadingState />}><Content /></Suspense>
    </>
  );
}
