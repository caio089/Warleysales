import type { Metadata } from "next";
import { Suspense } from "react";
import { loadScreen } from "@/server/screen";
import { ok } from "@/shared/lib/result";
import { can } from "@/shared/lib/authz/policy";
import { loadLookups } from "@/server/lookups";
import { LoadingState } from "@/shared/ui/feedback-states";
import { Screen } from "@/shared/ui/screen";
import { ProcessView } from "./process-view";

export const metadata: Metadata = { title: "Processo" };

async function ProcessContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await loadScreen(async ({ services, actor }) => {
    const view = await services.processes.get(actor, id);
    if (!view.ok) return view;
    const documents = await services.documents.listByProcess(actor, id);
    const formalization = await services.formalizations.getByProcess(actor, id);
    const suppliers = await services.suppliers.list(actor);
    const [purchaseRequests, atas, contracts] = await Promise.all([
      services.purchases.list(actor),
      services.atas.list(actor),
      services.contracts.list(actor),
    ]);
    const lookups = await loadLookups({ services, actor });
    const linkedRequest = purchaseRequests.ok
      ? purchaseRequests.data.find((r) => r.processId === id) ?? null
      : null;
    const materialName = lookups.ok ? lookups.data.materialName : {};
    const councilId = view.data.process.councilId;
    return ok({
      view: view.data,
      documents: documents.ok ? documents.data : [],
      formalization: formalization.ok ? formalization.data : null,
      suppliers: suppliers.ok ? suppliers.data : [],
      canManage: can(actor, "process.create", councilId),
      canUnlink: can(actor, "document.unlink", councilId),
      canRegisterClosing: can(actor, "retention.manage", councilId),
      isSpecialDeleter: actor.isSpecialDeleter,
      isWarley: actor.isCentralAdmin,
      defaultEstimatedValue: linkedRequest?.estimatedValue ?? null,
      requestId: linkedRequest?.id ?? null,
      requestItems: (linkedRequest?.items ?? []).map((item) => ({
        materialId: item.materialId,
        name: materialName[item.materialId] ?? "Item",
        quantity: item.quantity,
      })),
      linkedAtas: atas.ok
        ? atas.data
            .filter((item) => item.ata.processId === id)
            .map((item) => ({
              id: item.ata.id,
              number: item.ata.number,
              endDate: item.endDate,
              status: item.validity === "vigente" ? "Vigente" : "Vencida",
            }))
        : [],
      linkedContracts: contracts.ok
        ? contracts.data
            .filter((item) => item.contract.processId === id)
            .map((item) => ({
              id: item.contract.id,
              number: item.contract.number,
              object: item.contract.object,
              value: item.terms.value,
              endDate: item.terms.endDate,
            }))
        : [],
    });
  });

  return (
    <Screen result={result}>
      {(data) => <ProcessView {...data} />}
    </Screen>
  );
}

export default function ProcessPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<LoadingState />}>
      <ProcessContent params={params} />
    </Suspense>
  );
}
