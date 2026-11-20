import type { Metadata } from "next";
import { Suspense } from "react";
import type { ProcessView } from "@/modules/processes/service";
import { loadLookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { ok } from "@/shared/lib/result";
import { can } from "@/shared/lib/authz/policy";
import { ActivityTimeline } from "@/shared/ui/activity-timeline";
import { REQUEST_LIFECYCLE, requestNextStep, requestRailKey } from "@/shared/ui/flow-copy";
import { LifecycleRail, NextStepCallout } from "@/shared/ui/flow-guide";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { StatusBadge } from "@/shared/ui/status-badge";
import { REQUEST_STATUS, presentationOf } from "@/shared/ui/status-presentation";
import { SimpleTable } from "@/shared/ui/simple-table";
import { LinkedProcessCard } from "./linked-process-card";
import { PlanDossierCard } from "../plan-dossier-card";
import { RequestActions } from "./request-actions";
import { planDossier } from "../request-facets";
import { CorrectionForm } from "./correction-form";
import { getServiceClient } from "@/server/supabase/client";

export const metadata: Metadata = { title: "Solicitação" };

async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await loadScreen(async (ctx) => {
    const [request, lookups] = await Promise.all([ctx.services.purchases.get(ctx.actor, id), loadLookups(ctx)]);
    if (!request.ok) return request;
    if (!lookups.ok) return lookups;
    const councilId = request.data.councilId;
    const materials = await ctx.services.inventory.listMaterials(ctx.actor);
    if (!materials.ok) return materials;
    const canCorrect = can(ctx.actor, "request.create", councilId);
    let revision: string | null = null;
    if (canCorrect) {
      const response = await getServiceClient().rpc("purchase_request_revision", { p_request: id });
      if (!response.error) revision = response.data as string;
    }

    let linkedProcess: ProcessView | null = null;
    if (request.data.processId) {
      const procResult = await ctx.services.processes.get(ctx.actor, request.data.processId);
      if (procResult.ok) {
        linkedProcess = procResult.data;
      }
    }

    return ok({
      request: request.data,
      revision,
      correctionItems: request.data.items.map((item) => {
        const material = materials.data.find((entry) => entry.id === item.materialId);
        return { materialId: item.materialId, description: material?.name ?? "", unit: material?.unit ?? "un", quantity: item.quantity };
      }),
      correctionCouncils: lookups.data.councils.filter((council) => can(ctx.actor, "request.create", council.id)),
      lookups: lookups.data,
      linkedProcess,
      canDecide: can(ctx.actor, "request.decide", councilId),
      canCreate: can(ctx.actor, "request.create", councilId),
      canReceive: can(ctx.actor, "stock.move", councilId),
    });
  });
  return (
    <Screen result={result}>
      {({ request, lookups, linkedProcess, canDecide, canCreate, canReceive, revision, correctionItems, correctionCouncils }) => {
        const status = presentationOf(REQUEST_STATUS, request.status);
        const next = requestNextStep(request.status, { canCreate, canDecide, canReceive });
        const dossier = planDossier(request.events.map((event) => event.note), request.estimatedValue, request.title);
        const pendingItems = request.items
          .filter((i) => i.quantity - i.receivedTotal > 0)
          .map((i) => ({
            id: i.id,
            label: lookups.materialName[i.materialId] ?? lookups.materialLabel[i.materialId] ?? "—",
            pending: i.quantity - i.receivedTotal,
          }));
        return (
          <>
            <PageHeader
              eyebrow="Solicitações"
              backHref="/solicitacoes"
              returnToPath="/solicitacoes"
              backLabel="Todas as solicitações"
              title={request.title}
              description={
                dossier.itemNumber
                  ? `${lookups.councilLabel[request.councilId] ?? "Órgão"} · item ${dossier.itemNumber} do PCA · concluir em ${dossier.plannedMonth} · vencimento ${dossier.expiry?.raw ?? "não informado"}`
                  : `Órgão ${lookups.councilLabel[request.councilId] ?? "—"} · siga o próximo passo abaixo`
              }
              actions={<StatusBadge label={status.label} tone={status.tone} />}
            />
            <LifecycleRail steps={[...REQUEST_LIFECYCLE]} currentKey={requestRailKey(request.status)} />
            <NextStepCallout {...next} />
            <div className="space-y-8">
              <PlanDossierCard dossier={dossier} objectText={request.title} />
              {canCreate && !revision ? <p role="status" className="rounded border p-3 text-sm">O formulário de correção ficará disponível após a atualização do banco de dados.</p> : null}
              {canCreate && revision ? <CorrectionForm key={revision} requestId={request.id} revision={revision} title={request.title}
                councilId={request.councilId} councils={correctionCouncils} estimatedValue={request.estimatedValue ?? null}
                priority={dossier.priority} items={correctionItems} /> : null}
              {linkedProcess ? <LinkedProcessCard processView={linkedProcess} /> : null}
              <SimpleTable
                caption="Itens da solicitação"
                rows={request.items.map((i) => ({
                  id: i.id,
                  material: lookups.materialName[i.materialId] ?? lookups.materialLabel[i.materialId] ?? "—",
                  quantity: i.quantity,
                  received: i.receivedTotal,
                  pending: i.quantity - i.receivedTotal,
                  ata: i.ataItemId ? "Vinculada" : "—",
                }))}
                columns={[
                  { key: "material", header: "Item" },
                  { key: "quantity", header: "Solicitado", kind: "number" },
                  { key: "received", header: "Recebido", kind: "number" },
                  { key: "pending", header: "Pendente", kind: "number" },
                  { key: "ata", header: "Ata" },
                ]}
              />
              <RequestActions
                requestId={request.id}
                status={request.status}
                canDecide={canDecide}
                canCreate={canCreate}
                canReceive={canReceive}
                pendingItems={pendingItems}
              />
              <section aria-labelledby="hist">
                <h2 id="hist" className="mb-3 text-base font-semibold">
                  Histórico
                </h2>
                <ActivityTimeline
                  entries={request.events.map((e, i) => ({
                    id: String(i),
                    title: presentationOf(REQUEST_STATUS, e.to).label,
                    description: e.note,
                    occurredAt: e.at.toISOString(),
                  }))}
                />
              </section>
            </div>
          </>
        );
      }}
    </Screen>
  );
}

export default function RequestPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<LoadingState />}>
      <Content params={params} />
    </Suspense>
  );
}
