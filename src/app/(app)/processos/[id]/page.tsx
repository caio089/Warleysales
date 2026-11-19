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

export async function ProcessContent({ params, initialTab }: { params: Promise<{ id: string }>; initialTab: "documentos" | "contratacao" | "governanca" }) {
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
    if (!documents.ok) return documents;
    if (!formalization.ok) return formalization;
    if (!suppliers.ok) return suppliers;
    if (!purchaseRequests.ok) return purchaseRequests;
    if (!atas.ok) return atas;
    if (!contracts.ok) return contracts;
    if (!lookups.ok) return lookups;
    const linkedRequest = purchaseRequests.data.find((r) => r.processId === id) ?? null;
    const materialName = lookups.data.materialName;
    const councilId = view.data.process.councilId;
    return ok({
      view: view.data,
      documents: documents.data,
      formalization: formalization.data,
      suppliers: suppliers.data,
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
      requestNotes: (linkedRequest?.events ?? []).map((event) => event.note ?? ""),
      linkedAtas: atas.data
        .filter((item) => item.ata.processId === id)
        .map((item) => ({ id: item.ata.id, number: item.ata.number, endDate: item.endDate, status: item.validity === "vigente" ? "Vigente" : "Vencida" })),
      linkedContracts: contracts.data
        .filter((item) => item.contract.processId === id)
        .map((item) => ({ id: item.contract.id, number: item.contract.number, object: item.contract.object, value: item.terms.value, endDate: item.terms.endDate })),
      availableAtas: atas.data
        .filter((item) => item.ata.councilId === councilId && !item.ata.processId)
        .map((item) => ({ value: item.ata.id, label: item.ata.number })),
      availableContracts: contracts.data
        .filter((item) => item.contract.councilId === councilId && !item.contract.processId)
        .map((item) => ({ value: item.contract.id, label: item.contract.number })),
      instrumentDraft: {
        councilLabel: lookups.data.councilLabel[councilId] ?? "Órgão",
        processLabel: `${view.data.process.number} — ${view.data.process.title}`,
        materials: lookups.data.materials.map((material) => ({ value: material.id, label: material.label })),
        suppliers: suppliers.data
          .filter((supplier) => supplier.active)
          .map((supplier) => ({ value: supplier.id, label: supplier.name, cnpj: supplier.cnpj })),
      },
    });
  });

  return (
    <Screen result={result}>
      {(data) => <ProcessView {...data} initialTab={initialTab} />}
    </Screen>
  );
}

export default async function ProcessPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ aba?: string }>;
}) {
  const { aba } = await searchParams;
  const initialTab = aba === "contratacao" || aba === "governanca" ? aba : "documentos";
  return (
    <Suspense fallback={<LoadingState />}>
      <ProcessContent params={params} initialTab={initialTab} />
    </Suspense>
  );
}
