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

export const metadata: Metadata = { title: "Contratos" };

async function Content() {
  const result = await loadScreen(async (ctx) => {
    const [contracts, lookups] = await Promise.all([ctx.services.contracts.list(ctx.actor), loadLookups(ctx)]);
    if (!contracts.ok) return contracts;
    if (!lookups.ok) return lookups;
    return ok({ contracts: contracts.data, lookups: lookups.data, canCreate: canInAnyCouncil(ctx.actor, "contract.manage") });
  });
  return (
    <Screen result={result}>
      {({ contracts, lookups, canCreate }) => (
        <>
        <PageHeader title="Contratos" description="Prazos e valores com histórico de aditivos preservado." actions={canCreate ? <Link href="/contratos/novo" className={buttonVariants()}>Novo contrato</Link> : undefined} />
        <SimpleTable
          caption="Contratos"
          rows={contracts.map((c) => ({ id: c.contract.id, number: c.contract.number, council: lookups.councilLabel[c.contract.councilId] ?? "—", object: c.contract.object, endDate: c.terms.endDate, remaining: c.remainingDays, elapsed: c.elapsedPercent, href: `/contratos/${c.contract.id}` }))}
          columns={[
            { key: "number", header: "Número", kind: "link", hrefKey: "href" }, { key: "council", header: "Conselho" }, { key: "object", header: "Objeto" },
            { key: "endDate", header: "Vigência até", kind: "date" }, { key: "remaining", header: "Dias restantes", kind: "number" }, { key: "elapsed", header: "Vigência decorrida", kind: "progress" },
          ]}
          filterKeys={[{ key: "council", label: "Conselho" }]}
          emptyTitle="Nenhum contrato cadastrado"
        />
        </>
      )}
    </Screen>
  );
}

export default function ContractsPage() {
  return <Suspense fallback={<LoadingState />}><Content /></Suspense>;
}
