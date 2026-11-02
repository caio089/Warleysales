import type { Metadata } from "next";
import { Suspense } from "react";
import { loadScreen } from "@/server/screen";
import { ok } from "@/shared/lib/result";
import { can } from "@/shared/lib/authz/policy";
import { formatDateOnly } from "@/shared/lib/time";
import { LoadingState } from "@/shared/ui/feedback-states";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { SimpleTable } from "@/shared/ui/simple-table";
import { ataStepFormAction } from "@/modules/atas/actions";
import { ATA_MAX_EXTENSIONS } from "@/modules/atas/domain/validity";

export const metadata: Metadata = { title: "Ata" };

async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await loadScreen(async ({ services, actor }) => {
    const view = await services.atas.get(actor, id);
    if (!view.ok) return view;
    return ok({ view: view.data, canManage: can(actor, "ata.manage", view.data.ata.councilId) });
  });
  return (
    <Screen result={result}>
      {({ view, canManage }) => (
        <>
          <PageHeader title={`Ata ${view.ata.number}`} description={`Vigência até ${formatDateOnly(view.endDate)} · ${view.validity === "vigente" ? "vigente" : "vencida"} · ${view.ata.status === "rascunho" ? "rascunho (não consome saldo)" : "ativa"}`} />
          <div className="space-y-8">
            <SimpleTable
              caption="Saldo por item"
              rows={view.items.map((i) => ({ id: i.itemId, description: i.description, registered: i.balance.registered, committed: i.balance.committed, balance: i.balance.balance }))}
              columns={[{ key: "description", header: "Item" }, { key: "registered", header: "Registrada", kind: "number" }, { key: "committed", header: "Comprometida", kind: "number" }, { key: "balance", header: "Saldo", kind: "number" }]}
            />
            {canManage ? (
              <div className="flex flex-wrap gap-3">
                {view.ata.status === "rascunho" ? <ActionForm action={ataStepFormAction} submitLabel="Ativar ata" hiddenFields={{ ataId: view.ata.id, step: "activate" }}>{() => null}</ActionForm> : null}
                {view.ata.status === "vigente" && view.validity === "vigente" && view.ata.extensions.length < ATA_MAX_EXTENSIONS ? (
                  <ActionForm action={ataStepFormAction} submitLabel="Prorrogar por 1 ano" submitVariant="outline" hiddenFields={{ ataId: view.ata.id, step: "extend" }}>{() => null}</ActionForm>
                ) : null}
              </div>
            ) : null}
            {view.ata.extensions.length > 0 ? (
              <section aria-labelledby="prorrog"><h2 id="prorrog" className="mb-2 text-base font-semibold">Prorrogações</h2>
                <ul className="text-sm">{view.ata.extensions.map((e, i) => <li key={i}>{formatDateOnly(e.previousEndDate)} → {formatDateOnly(e.newEndDate)} · {e.legalBasis}</li>)}</ul>
              </section>
            ) : null}
          </div>
        </>
      )}
    </Screen>
  );
}

export default function AtaPage({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense fallback={<LoadingState />}><Content params={params} /></Suspense>;
}
