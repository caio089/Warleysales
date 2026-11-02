import type { Metadata } from "next";
import { Suspense } from "react";
import { loadLookups } from "@/server/lookups";
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
import { AllocationForm } from "./allocation-form";

export const metadata: Metadata = { title: "Ata" };

async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await loadScreen(async ({ services, actor }) => {
    const [view, lookups] = await Promise.all([services.atas.get(actor, id), loadLookups({ services, actor })]);
    if (!view.ok) return view;
    if (!lookups.ok) return lookups;
    return ok({ view: view.data, lookups: lookups.data, canManage: can(actor, "ata.manage", view.data.ata.councilId) });
  });
  return (
    <Screen result={result}>
      {({ view, lookups, canManage }) => (
        <>
          <PageHeader title={`Ata ${view.ata.number}`} description={`Vigência até ${formatDateOnly(view.endDate)} · ${view.validity === "vigente" ? "vigente" : "vencida"} · ${view.ata.status === "rascunho" ? "rascunho (não consome saldo)" : "ativa"}`} />
          <div className="space-y-8">
            <SimpleTable
              caption="Saldo por item"
              rows={view.items.map((i) => ({
                id: i.itemId,
                description: i.description,
                material: i.materialId ? (lookups.materialLabel[i.materialId] ?? "—") : "—",
                registered: i.balance.registered,
                committed: i.balance.committed,
                balance: i.balance.balance,
                allocation: i.allocations.length ? i.allocations.map((a) => `${lookups.councilLabel[a.councilId] ?? "—"}: ${a.quantity}`).join("; ") : "Comum",
              }))}
              columns={[
                { key: "description", header: "Item" },
                { key: "material", header: "Material" },
                { key: "registered", header: "Registrada", kind: "number" },
                { key: "committed", header: "Comprometida", kind: "number" },
                { key: "balance", header: "Saldo", kind: "number" },
                { key: "allocation", header: "Alocação" },
              ]}
            />
            {canManage ? (
              <div className="flex flex-wrap gap-3">
                {view.ata.status === "rascunho" ? <ActionForm action={ataStepFormAction} submitLabel="Ativar ata" hiddenFields={{ ataId: view.ata.id, step: "activate" }}>{() => null}</ActionForm> : null}
                {view.ata.status === "vigente" && view.validity === "vigente" && view.ata.extensions.length < ATA_MAX_EXTENSIONS ? (
                  <ActionForm action={ataStepFormAction} submitLabel="Prorrogar por 1 ano" submitVariant="outline" hiddenFields={{ ataId: view.ata.id, step: "extend" }}>{() => null}</ActionForm>
                ) : null}
              </div>
            ) : null}
            {canManage ? (
              <AllocationForm
                ataId={view.ata.id}
                items={view.items.map((i) => ({ value: i.itemId, label: i.description }))}
                councils={lookups.councils.map((c) => ({ value: c.id, label: c.label }))}
              />
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
