import type { Metadata } from "next";
import { Suspense } from "react";
import { ArrowDownToLine, ArrowUpFromLine, ClipboardList, Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { loadLookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { canInAnyCouncil } from "@/shared/lib/authz/policy";
import { ok } from "@/shared/lib/result";
import { LoadingState } from "@/shared/ui/feedback-states";
import { KpiCard } from "@/shared/ui/kpi-card";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { ModuleInsight, ModuleInsightFallback } from "@/shared/ui/module-insight";
import { SimpleTable } from "@/shared/ui/simple-table";
import { buildStockEntrySources } from "../entry-sources";
import { MovementForm } from "./movement-form";

// Route implementation lives outside page.tsx so its testable content export is valid in Next.js 16.

export const metadata: Metadata = { title: "Movimentações" };

const TYPE_LABEL: Record<string, string> = {
  entry: "Entrada no estoque",
  consumption: "Saída · entrega ao órgão",
  adjustment_in: "Ajuste",
  adjustment_out: "Ajuste",
  transfer_out: "Saída por transferência",
  transfer_in: "Entrada por transferência",
};

export async function Content() {
  const result = await loadScreen(async (ctx) => {
    const [lookups, requests, processes, atas, contracts] = await Promise.all([
      loadLookups(ctx),
      ctx.services.purchases.list(ctx.actor),
      ctx.services.processes.list(ctx.actor),
      ctx.services.atas.list(ctx.actor),
      ctx.services.contracts.list(ctx.actor),
    ]);
    if (!lookups.ok) return lookups;
    if (!requests.ok) return requests;
    if (!processes.ok) return processes;
    if (!atas.ok) return atas;
    if (!contracts.ok) return contracts;
    const lists = await Promise.all(lookups.data.councils.map((c) => ctx.services.inventory.listMovements(ctx.actor, c.id)));
    const failed = lists.find((list) => !list.ok);
    if (failed && !failed.ok) return failed;
    const movements = lists.flatMap((list) => (list.ok ? list.data : []));
    return ok({
      movements,
      lookups: lookups.data,
      entrySources: buildStockEntrySources({
        requests: requests.data,
        processes: processes.data,
        atas: atas.data,
        materialLabel: lookups.data.materialLabel,
        contracts: contracts.data.map((view) => ({
          processId: view.contract.processId ?? null,
          ataId: view.contract.ataId ?? null,
          ataItems: (view.contract.ataItems ?? []).map((item) => ({
            ataItemId: item.ataItemId,
            quantity: item.quantity,
          })),
        })),
      }),
      canMove: canInAnyCouncil(ctx.actor, "stock.move"),
      canAdjust: canInAnyCouncil(ctx.actor, "stock.adjust"),
    });
  });
  return (
    <Screen result={result}>
      {({ movements, lookups, entrySources, canMove, canAdjust }) => (
        <div className="space-y-6">
          <PageHeader eyebrow="Estoque · Histórico" backHref="/estoque" backLabel="Voltar para Estoque" title="Movimentações" description="Consulte entradas, saídas e ajustes por órgão. Cada lançamento atualiza o saldo do material." actions={canMove ? <a href="#nova-movimentacao" className={buttonVariants()}><Plus className="size-4" aria-hidden /> Registrar movimentação</a> : undefined} />
          <div className="grid gap-3 sm:grid-cols-3" aria-label="Resumo das movimentações">
            <KpiCard icon={<ClipboardList className="size-4" aria-hidden />} label="Registros" value={movements.length} />
            <KpiCard icon={<ArrowDownToLine className="size-4" aria-hidden />} label="Entradas" value={movements.filter((m) => ["entry", "adjustment_in", "transfer_in"].includes(m.type)).length} />
            <KpiCard icon={<ArrowUpFromLine className="size-4" aria-hidden />} label="Saídas" value={movements.filter((m) => ["consumption", "adjustment_out", "transfer_out"].includes(m.type)).length} />
          </div>
          <Suspense fallback={<ModuleInsightFallback />}>
            <ModuleInsight moduleName="Movimentações" sourceHref="/estoque/movimentacoes" facts={[
              { label: "Total", value: movements.length },
              { label: "Entradas", value: movements.filter((m) => m.type === "entry").length },
              { label: "Saídas", value: movements.filter((m) => ["consumption", "transfer_out"].includes(m.type)).length },
            ]} />
          </Suspense>
          {canMove ? (
            <section id="nova-movimentacao" aria-labelledby="nova" className="surface-card max-w-3xl scroll-mt-6 p-6">
              <h2 id="nova" className="mb-4 font-heading text-lg font-medium tracking-tight text-primary">Registrar quantidade</h2>
              <MovementForm
                councils={lookups.councils.map((c) => ({ value: c.id, label: c.label }))}
                materials={lookups.materials.map((m) => ({ value: m.id, label: m.label }))}
                entrySources={entrySources}
                defaultType="entry"
                allowAdjust={canAdjust}
              />
            </section>
          ) : null}
          <SimpleTable
            caption="Movimentações de estoque (ledger)"
            rows={movements.map((m) => ({ id: m.id, at: m.createdAt.toISOString(), council: lookups.councilLabel[m.councilId] ?? "—", material: lookups.materialLabel[m.materialId] ?? "—", type: TYPE_LABEL[m.type] ?? m.type, quantity: m.quantity, reason: m.reason }))}
            columns={[{ key: "at", header: "Quando", kind: "datetime" }, { key: "council", header: "Órgão" }, { key: "material", header: "Material" }, { key: "type", header: "Tipo" }, { key: "quantity", header: "Quantidade", kind: "number" }, { key: "reason", header: "Motivo" }]}
            filterKeys={[{ key: "type", label: "Tipo" }]}
            emptyTitle="Nenhuma movimentação registrada"
          />
        </div>
      )}
    </Screen>
  );
}

export default function MovementsPage() {
  return <Suspense fallback={<LoadingState />}><Content /></Suspense>;
}
