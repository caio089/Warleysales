import type { Metadata } from "next";
import { Suspense } from "react";
import { loadScreen } from "@/server/screen";
import { ok } from "@/shared/lib/result";
import { can } from "@/shared/lib/authz/policy";
import { loadLookups } from "@/server/lookups";
import { LoadingState } from "@/shared/ui/feedback-states";
import { Screen } from "@/shared/ui/screen";
import { buildProcessHistory } from "./process-history";
import { ProcessView } from "./process-view";

export const metadata: Metadata = { title: "Processo" };

export async function ProcessContent({
  params,
  initialTab,
}: {
  params: Promise<{ id: string }>;
  initialTab: "aprovacoes" | "documentos" | "contratacao" | "governanca";
}) {
  const { id } = await params;
  const result = await loadScreen(async ({ services, actor }) => {
    const detail = await services.processes.getDetail(actor, id);
    if (!detail.ok) return detail;
    const { view, documents } = detail.data;
    const councilId = view.process.councilId;
    const instrumentScope = { id, councilId };
    const [formalization, suppliers, request, atas, contracts, lookups] = await Promise.all([
      services.formalizations.getByProcess(actor, id),
      services.suppliers.list(actor),
      services.purchases.findLinkedByProcess(actor, id),
      services.atas.list(actor, instrumentScope),
      services.contracts.list(actor, instrumentScope),
      loadLookups({ services, actor }),
    ]);
    if (!formalization.ok) return formalization;
    if (!suppliers.ok) return suppliers;
    if (!request.ok) return request;
    if (!atas.ok) return atas;
    if (!contracts.ok) return contracts;
    if (!lookups.ok) return lookups;
    const linkedRequest = request.data;
    const materialName = lookups.data.materialName;
    const requestItems = (linkedRequest?.items ?? []).map((item) => ({
      materialId: item.materialId,
      name: materialName[item.materialId] ?? "Item",
      quantity: item.quantity,
    }));
    const history = buildProcessHistory({
      process: {
        number: view.process.number,
        createdAt: view.process.createdAt.toISOString(),
        documentalCompletedAt: view.process.documentalCompletedAt?.toISOString() ?? null,
      },
      request: linkedRequest
        ? {
            title: linkedRequest.title,
            createdAt: linkedRequest.createdAt.toISOString(),
            events: linkedRequest.events.map((event) => ({
              to: event.to,
              at: event.at.toISOString(),
              note: event.note ?? null,
            })),
          }
        : null,
      documents: documents.map((document) => ({
        id: document.id,
        typeCode: document.typeCode,
        fileName: document.fileName,
        createdAt: document.createdAt instanceof Date
          ? document.createdAt.toISOString()
          : document.createdAt
            ? String(document.createdAt)
            : null,
        linkStatus: document.linkStatus,
      })),
      formalization: formalization.data
        ? {
            createdAt: formalization.data.createdAt.toISOString(),
            status: formalization.data.status,
            homologatedAt: formalization.data.homologatedAt?.toISOString() ?? null,
            homologationNote: formalization.data.homologationNote,
            auctionDate: formalization.data.auctionDate ?? null,
          }
        : null,
    });

    return ok({
      view,
      documents,
      formalization: formalization.data,
      suppliers: suppliers.data,
      canManage: can(actor, "process.create", councilId),
      canUnlink: can(actor, "document.unlink", councilId),
      canRegisterClosing: can(actor, "retention.manage", councilId),
      isWarley: actor.isCentralAdmin,
      defaultEstimatedValue: linkedRequest?.estimatedValue ?? null,
      requestId: linkedRequest?.id ?? null,
      requestItems,
      requestNotes: (linkedRequest?.events ?? []).map((event) => event.note ?? ""),
      history,
      approvalRequest: linkedRequest
        ? {
            id: linkedRequest.id,
            title: linkedRequest.title,
            status: linkedRequest.status,
            councilLabel: lookups.data.councilLabel[councilId] ?? "Órgão",
            estimatedValue: linkedRequest.estimatedValue ?? null,
            createdAt: linkedRequest.createdAt.toISOString(),
            events: linkedRequest.events.map((event) => ({
              to: event.to,
              at: event.at.toISOString(),
              note: event.note ?? null,
            })),
            items: linkedRequest.items.map((item) => ({
              id: item.id,
              label: materialName[item.materialId] ?? "Item",
              quantity: item.quantity,
              receivedTotal: item.receivedTotal,
            })),
            canDecide: can(actor, "request.decide", councilId),
            canCreate: can(actor, "request.create", councilId),
            canReceive: can(actor, "stock.move", councilId),
          }
        : null,
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
        processLabel: `${view.process.number} — ${view.process.title}`,
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
  const initialTab =
    aba === "aprovacoes" || aba === "contratacao" || aba === "governanca" ? aba : "documentos";
  return (
    <Suspense fallback={<LoadingState />}>
      <ProcessContent params={params} initialTab={initialTab} />
    </Suspense>
  );
}
