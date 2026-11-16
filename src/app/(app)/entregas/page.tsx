import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckCircle2, Clock, PackageCheck, Truck } from "lucide-react";
import { loadLookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { ok } from "@/shared/lib/result";
import { KpiCard } from "@/shared/ui/kpi-card";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader, SectionLabel } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { ModuleInsight, ModuleInsightFallback } from "@/shared/ui/module-insight";
import { SimpleTable } from "@/shared/ui/simple-table";

export const metadata: Metadata = { title: "Central de Entregas" };

async function DeliveriesContent() {
  const result = await loadScreen(async (ctx) => {
    const [requestsRes, lookupsRes] = await Promise.all([
      ctx.services.purchases.list(ctx.actor),
      loadLookups(ctx),
    ]);

    if (!requestsRes.ok) return requestsRes;
    if (!lookupsRes.ok) return lookupsRes;

    const requests = requestsRes.data;
    const lookups = lookupsRes.data;

    // Entradas no histórico para todos os órgãos acessíveis.
    const movementsLists = await Promise.all(
      lookups.councils.map((c) => ctx.services.inventory.listMovements(ctx.actor, c.id)),
    );
    const allMovements = movementsLists.flatMap((l) => (l.ok ? l.data : []));
    const deliveryMovements = allMovements
      .filter((m) => m.type === "entry" || m.type === "transfer_in")
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Linhas de entrega por item de solicitação
    const deliveryLines: {
      id: string;
      requestId: string;
      requestTitle: string;
      councilId: string;
      organization: string;
      materialId: string;
      material: string;
      quantity: number;
      receivedTotal: number;
      pending: number;
      progressPct: number;
    }[] = [];

    let totalDeliveredUnits = 0;
    let totalPendingUnits = 0;
    let inProgressRequestsCount = 0;
    let completedRequestsCount = 0;

    requests.forEach((r) => {
      const isApprovedOrDelivering = ["aprovada", "em_atendimento", "parcialmente_atendida"].includes(r.status);
      const isCompleted = r.status === "atendida";

      if (isApprovedOrDelivering) inProgressRequestsCount += 1;
      if (isCompleted) completedRequestsCount += 1;

      if (isApprovedOrDelivering || isCompleted) {
        r.items.forEach((item) => {
          const qty = Number(item.quantity);
          const rec = Number(item.receivedTotal || 0);
          const pend = Math.max(0, qty - rec);

          totalDeliveredUnits += rec;
          if (isApprovedOrDelivering) totalPendingUnits += pend;

          const progressPct = qty > 0 ? Math.min(100, Math.round((rec / qty) * 100)) : 100;

          deliveryLines.push({
            id: `${r.id}:${item.id}`,
            requestId: r.id,
            requestTitle: r.title,
            councilId: r.councilId,
            organization: lookups.councilLabel[r.councilId] ?? "—",
            materialId: item.materialId,
            material: lookups.materialLabel[item.materialId] ?? "—",
            quantity: qty,
            receivedTotal: rec,
            pending: pend,
            progressPct,
          });
        });
      }
    });

    return ok({
      deliveryLines,
      deliveryMovements: deliveryMovements.slice(0, 20),
      totalDeliveredUnits,
      totalPendingUnits,
      inProgressRequestsCount,
      completedRequestsCount,
      lookups,
    });
  });

  return (
    <Screen result={result}>
      {({
        deliveryLines,
        deliveryMovements,
        totalDeliveredUnits,
        totalPendingUnits,
        inProgressRequestsCount,
        completedRequestsCount,
        lookups,
      }) => (
        <div className="space-y-8">
          <Suspense fallback={<ModuleInsightFallback />}>
            <ModuleInsight moduleName="Entregas" sourceHref="/entregas" facts={[
              { label: "Unidades entregues", value: totalDeliveredUnits },
              { label: "Unidades pendentes", value: totalPendingUnits },
              { label: "Pedidos em entrega", value: inProgressRequestsCount },
              { label: "Pedidos concluídos", value: completedRequestsCount },
            ]} />
          </Suspense>
          {/* KPIs de Entregas */}
          <section aria-label="Métricas de Entregas" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              icon={<PackageCheck className="size-4" aria-hidden />}
              label="Unidades Já Entregues"
              value={`${totalDeliveredUnits} un`}
              hint="Recebidas e conferidas"
            />
            <KpiCard
              icon={<Truck className="size-4" aria-hidden />}
              label="Unidades Pendentes"
              value={`${totalPendingUnits} un`}
              accent={totalPendingUnits > 0}
              hint="Aguardando entrega"
            />
            <KpiCard
              icon={<Clock className="size-4" aria-hidden />}
              label="Pedidos em Entrega"
              value={inProgressRequestsCount}
              accent={inProgressRequestsCount > 0}
              hint="Atendimento em andamento"
            />
            <KpiCard
              icon={<CheckCircle2 className="size-4" aria-hidden />}
              label="Pedidos 100% Entregues"
              value={completedRequestsCount}
              hint="Solicitações finalizadas"
            />
          </section>

          <section aria-label="Entregas pendentes" className="space-y-3">
            <SectionLabel>Precisam de acompanhamento</SectionLabel>
            <p className="text-sm text-muted-foreground">Itens com quantidade ainda não recebida. Abra a solicitação para registrar o recebimento.</p>
            <SimpleTable
              caption="Entregas pendentes por solicitação"
              rows={deliveryLines.filter((line) => line.pending > 0).map((line) => ({
                id: line.id,
                organization: line.organization,
                request: line.requestTitle,
                material: line.material,
                received: `${line.receivedTotal} de ${line.quantity}`,
                pending: line.pending,
                progress: line.progressPct,
                href: `/solicitacoes/${line.requestId}`,
              }))}
              columns={[
                { key: "request", header: "Solicitação", kind: "link", hrefKey: "href" },
                { key: "organization", header: "Órgão" },
                { key: "material", header: "Material" },
                { key: "received", header: "Recebido" },
                { key: "pending", header: "Falta receber", kind: "number" },
                { key: "progress", header: "Progresso", kind: "progress" },
              ]}
              filterKeys={[{ key: "organization", label: "Órgão" }]}
              emptyTitle="Nenhuma entrega pendente"
              emptyDescription="Os itens aprovados e ainda não recebidos aparecerão aqui."
            />
          </section>

          <section aria-label="Itens concluídos" className="space-y-3">
            <SectionLabel>Entregues integralmente</SectionLabel>
            <SimpleTable
              caption="Itens com recebimento completo"
              rows={deliveryLines.filter((line) => line.pending === 0).map((line) => ({
                id: line.id,
                organization: line.organization,
                request: line.requestTitle,
                material: line.material,
                quantity: line.quantity,
                received: line.receivedTotal,
                href: `/solicitacoes/${line.requestId}`,
              }))}
              columns={[
                { key: "request", header: "Solicitação", kind: "link", hrefKey: "href" },
                { key: "organization", header: "Órgão" },
                { key: "material", header: "Material" },
                { key: "quantity", header: "Solicitado", kind: "number" },
                { key: "received", header: "Recebido", kind: "number" },
              ]}
              filterKeys={[{ key: "organization", label: "Órgão" }]}
              emptyTitle="Nenhum item concluído"
            />
          </section>

          <details className="surface-card group p-5">
            <summary className="cursor-pointer text-sm font-semibold text-primary focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Histórico de entradas no estoque <span className="font-normal text-muted-foreground">· últimas {deliveryMovements.length} movimentações</span></summary>
            <div className="mt-5">
              <SimpleTable
                caption="Histórico de entradas registradas no estoque"
                rows={deliveryMovements.map((m) => ({
                  id: String(m.id),
                  at: m.createdAt.toISOString(),
                  organization: lookups.councilLabel[m.councilId] ?? "—",
                  material: lookups.materialLabel[m.materialId] ?? "—",
                  quantity: m.quantity,
                  reason: m.reason || "Entrada registrada",
                }))}
                columns={[
                  { key: "at", header: "Registrado em", kind: "datetime" },
                  { key: "organization", header: "Órgão" },
                  { key: "material", header: "Material" },
                  { key: "quantity", header: "Quantidade", kind: "number" },
                  { key: "reason", header: "Origem" },
                ]}
                emptyTitle="Nenhuma entrada registrada"
              />
            </div>
          </details>
        </div>
      )}
    </Screen>
  );
}

export default function DeliveriesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Operação · Logística"
        title="Central de Entregas"
        description="Veja primeiro o que falta receber, depois os itens concluídos e o histórico de entradas por órgão."
      />
      <Suspense fallback={<LoadingState />}>
        <DeliveriesContent />
      </Suspense>
    </>
  );
}
