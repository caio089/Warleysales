import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CheckCircle2, Clock, PackageCheck, ShoppingCart, Truck } from "lucide-react";
import { loadLookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { ok } from "@/shared/lib/result";
import { KpiCard } from "@/shared/ui/kpi-card";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader, SectionLabel } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
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

    // Entradas no ledger para todas as empresas acessíveis
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
      company: string;
      materialId: string;
      material: string;
      quantity: number;
      receivedTotal: number;
      pending: number;
      progressPct: number;
      status: string;
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
            company: lookups.councilLabel[r.councilId] ?? "—",
            materialId: item.materialId,
            material: lookups.materialLabel[item.materialId] ?? "—",
            quantity: qty,
            receivedTotal: rec,
            pending: pend,
            progressPct,
            status: r.status,
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

          {/* Tabela de Acompanhamento de Entregas por Pedido e Produto */}
          <section aria-label="Acompanhamento por Item" className="space-y-3">
            <SectionLabel>Status de Entrega por Pedido e Produto</SectionLabel>
            <SimpleTable
              caption="Acompanhamento detalhado de entregas"
              rows={deliveryLines.map((line) => ({
                id: line.id,
                company: line.company,
                request: line.requestTitle,
                material: line.material,
                quantity: line.quantity,
                received: line.receivedTotal,
                pending: line.pending,
                progress: line.progressPct,
                status: line.status,
                href: `/solicitacoes/${line.requestId}`,
              }))}
              columns={[
                { key: "company", header: "Empresa Destinatária" },
                { key: "request", header: "Solicitação / Pedido", kind: "link", hrefKey: "href" },
                { key: "material", header: "Produto" },
                { key: "quantity", header: "Solicitado", kind: "number" },
                { key: "received", header: "Recebido", kind: "number" },
                { key: "pending", header: "Pendente", kind: "number" },
                { key: "progress", header: "Atendimento", kind: "progress" },
                { key: "status", header: "Situação", kind: "status", dictionary: "request" },
              ]}
              filterKeys={[
                { key: "company", label: "Empresa" },
                { key: "status", label: "Situação", dictionary: "request" },
              ]}
              emptyTitle="Nenhuma entrega em andamento"
              emptyDescription="Quando as solicitações são aprovadas, o acompanhamento de entregas é exibido aqui em tempo real."
            />
          </section>

          {/* Histórico Recente de Entradas no Estoque (Ledger) */}
          <section aria-label="Histórico de Recebimentos" className="space-y-3">
            <SectionLabel>Histórico Recente de Recebimentos e Entradas</SectionLabel>
            <SimpleTable
              caption="Histórico de entradas registradas no estoque"
              rows={deliveryMovements.map((m) => ({
                id: String(m.id),
                at: m.createdAt.toISOString(),
                company: lookups.councilLabel[m.councilId] ?? "—",
                material: lookups.materialLabel[m.materialId] ?? "—",
                quantity: m.quantity,
                reason: m.reason || "Recebimento de compra",
              }))}
              columns={[
                { key: "at", header: "Data da Entrega", kind: "datetime" },
                { key: "company", header: "Empresa" },
                { key: "material", header: "Produto Entregue" },
                { key: "quantity", header: "Quantidade", kind: "number" },
                { key: "reason", header: "Motivo / Origem" },
              ]}
              emptyTitle="Nenhum histórico de recebimento ainda"
              emptyDescription="As entregas confirmadas nas solicitações geram histórico permanente aqui."
            />
          </section>
        </div>
      )}
    </Screen>
  );
}

export default function DeliveriesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Operação & Logística"
        title="Central de Entregas"
        description="Controle e transparência de tudo o que já foi entregue a cada empresa e o saldo que ainda está pendente de recebimento."
      />
      <Suspense fallback={<LoadingState />}>
        <DeliveriesContent />
      </Suspense>
    </>
  );
}
