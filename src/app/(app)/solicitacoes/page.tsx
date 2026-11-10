import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { loadLookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { canInAnyCouncil } from "@/shared/lib/authz/policy";
import { ok } from "@/shared/lib/result";
import { REQUEST_FLOW_STEPS } from "@/shared/ui/flow-copy";
import { FlowGuide } from "@/shared/ui/flow-guide";
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
    return ok({ requests: requests.data, lookups: lookups.data, canCreate: canInAnyCouncil(ctx.actor, "request.create") });
  });
  return (
    <Screen result={result}>
      {({ requests, lookups, canCreate }) => (
        <>
          <PageHeader
            eyebrow="Compras"
            title="Solicitações"
            description="Peça material, envie para o gestor, aprove e só depois registre o recebimento no estoque."
            actions={
              canCreate ? (
                <Link href="/solicitacoes/nova" className={buttonVariants()}>
                  Nova solicitação
                </Link>
              ) : (
                <Button
                  disabled
                  variant="outline"
                  title="Seu perfil não possui permissão para criar solicitações neste órgão."
                >
                  Nova solicitação
                </Button>
              )
            }
          />
          <FlowGuide title="Fluxo em 4 passos" steps={REQUEST_FLOW_STEPS} />
          <SimpleTable
            caption="Solicitações de compra"
            rows={requests.map((r) => ({
              id: r.id,
              title: r.title,
              council: lookups.councilLabel[r.councilId] ?? "—",
              status: r.status,
              items: r.items.length,
              createdAt: r.createdAt.toISOString(),
              href: `/solicitacoes/${r.id}`,
            }))}
            columns={[
              { key: "title", header: "Solicitação", kind: "link", hrefKey: "href" },
              { key: "council", header: "Órgão" },
              { key: "status", header: "Status", kind: "status", dictionary: "request" },
              { key: "items", header: "Itens", kind: "number" },
              { key: "createdAt", header: "Criada em", kind: "datetime" },
            ]}
            filterKeys={[{ key: "status", label: "Status", dictionary: "request" }]}
            emptyTitle="Nenhuma solicitação ainda"
            emptyDescription="Comece criando uma solicitação. Depois é só enviar → aprovar → receber no estoque."
            emptyAction={
              canCreate ? (
                <Link href="/solicitacoes/nova" className={buttonVariants()}>
                  Criar primeira solicitação
                </Link>
              ) : undefined
            }
          />
        </>
      )}
    </Screen>
  );
}

export default function RequestsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <Content />
    </Suspense>
  );
}
