import type { Metadata } from "next";
import { Suspense } from "react";
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
import { RequestActions } from "./request-actions";

export const metadata: Metadata = { title: "Solicitação" };

async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await loadScreen(async (ctx) => {
    const [request, lookups] = await Promise.all([ctx.services.purchases.get(ctx.actor, id), loadLookups(ctx)]);
    if (!request.ok) return request;
    if (!lookups.ok) return lookups;
    const councilId = request.data.councilId;
    return ok({
      request: request.data,
      lookups: lookups.data,
      canDecide: can(ctx.actor, "request.decide", councilId),
      canCreate: can(ctx.actor, "request.create", councilId),
      canReceive: can(ctx.actor, "stock.move", councilId),
    });
  });
  return (
    <Screen result={result}>
      {({ request, lookups, canDecide, canCreate, canReceive }) => {
        const status = presentationOf(REQUEST_STATUS, request.status);
        const next = requestNextStep(request.status, { canCreate, canDecide, canReceive });
        const pendingItems = request.items
          .filter((i) => i.quantity - i.receivedTotal > 0)
          .map((i) => ({
            id: i.id,
            label: lookups.materialLabel[i.materialId] ?? "—",
            pending: i.quantity - i.receivedTotal,
          }));
        return (
          <>
            <PageHeader
              eyebrow="Solicitações"
              title={request.title}
              description={`Conselho ${lookups.councilLabel[request.councilId] ?? "—"} · siga o próximo passo abaixo`}
              actions={<StatusBadge label={status.label} tone={status.tone} />}
            />
            <LifecycleRail steps={[...REQUEST_LIFECYCLE]} currentKey={requestRailKey(request.status)} />
            <NextStepCallout {...next} />
            <div className="space-y-8">
              <SimpleTable
                caption="Itens da solicitação"
                rows={request.items.map((i) => ({
                  id: i.id,
                  material: lookups.materialLabel[i.materialId] ?? "—",
                  quantity: i.quantity,
                  received: i.receivedTotal,
                  pending: i.quantity - i.receivedTotal,
                  ata: i.ataItemId ? "Vinculada" : "—",
                }))}
                columns={[
                  { key: "material", header: "Material" },
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
