import type { Metadata } from "next";
import { Suspense } from "react";
import { loadLookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { ok } from "@/shared/lib/result";
import { ActivityTimeline } from "@/shared/ui/activity-timeline";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { SimpleTable } from "@/shared/ui/simple-table";
import { StatusBadge } from "@/shared/ui/status-badge";
import { TRANSFER_STATUS, presentationOf } from "@/shared/ui/status-presentation";

export const metadata: Metadata = { title: "Transferência" };

async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await loadScreen(async (ctx) => {
    const [transfer, lookups] = await Promise.all([ctx.services.transfers.get(ctx.actor, id), loadLookups(ctx)]);
    if (!transfer.ok) return transfer;
    if (!lookups.ok) return lookups;
    return ok({ transfer: transfer.data, lookups: lookups.data });
  });
  return (
    <Screen result={result}>
      {({ transfer, lookups }) => {
        const status = presentationOf(TRANSFER_STATUS, transfer.status);
        return (
          <>
            <PageHeader eyebrow="Estoque · Transferências" backHref="/transferencias" returnToPath="/transferencias" backLabel="Todas as transferências" title={`${lookups.councilLabel[transfer.originCouncilId]} → ${lookups.councilLabel[transfer.destinationCouncilId]}`} actions={<StatusBadge label={status.label} tone={status.tone} />} />
            <div className="space-y-8">
              <SimpleTable
                caption="Itens da transferência"
                rows={transfer.items.map((i) => ({ id: i.materialId, material: lookups.materialLabel[i.materialId] ?? "—", quantity: i.quantity, received: i.receivedQuantity }))}
                columns={[{ key: "material", header: "Material" }, { key: "quantity", header: "Enviado/solicitado", kind: "number" }, { key: "received", header: "Recebido", kind: "number" }]}
              />
              <section aria-labelledby="hist"><h2 id="hist" className="mb-3 text-base font-semibold">Histórico</h2>
                <ActivityTimeline entries={transfer.events.map((e, i) => ({ id: String(i), title: presentationOf(TRANSFER_STATUS, e.to).label, description: e.note, occurredAt: e.at.toISOString() }))} />
              </section>
            </div>
          </>
        );
      }}
    </Screen>
  );
}

export default function TransferPage({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense fallback={<LoadingState />}><Content params={params} /></Suspense>;
}
