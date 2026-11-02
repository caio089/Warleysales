import type { Metadata } from "next";
import { Suspense } from "react";
import { loadLookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { canInAnyCouncil } from "@/shared/lib/authz/policy";
import { ok } from "@/shared/lib/result";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { SimpleTable } from "@/shared/ui/simple-table";
import { MovementForm } from "./movement-form";

export const metadata: Metadata = { title: "Movimentações" };

const TYPE_LABEL: Record<string, string> = { entry: "Entrada", consumption: "Consumo", adjustment_in: "Ajuste (+)", adjustment_out: "Ajuste (−)", transfer_out: "Saída por transferência", transfer_in: "Entrada por transferência" };

async function Content() {
  const result = await loadScreen(async (ctx) => {
    const lookups = await loadLookups(ctx);
    if (!lookups.ok) return lookups;
    const lists = await Promise.all(lookups.data.councils.map((c) => ctx.services.inventory.listMovements(ctx.actor, c.id)));
    const movements = lists.flatMap((l) => (l.ok ? l.data : []));
    return ok({
      movements,
      lookups: lookups.data,
      canMove: canInAnyCouncil(ctx.actor, "stock.move"),
      canAdjust: canInAnyCouncil(ctx.actor, "stock.adjust"),
    });
  });
  return (
    <Screen result={result}>
      {({ movements, lookups, canMove, canAdjust }) => (
        <div className="space-y-8">
          {canMove ? (
            <section aria-labelledby="nova" className="surface-card max-w-lg p-6">
              <h2 id="nova" className="mb-4 font-heading text-lg font-medium tracking-tight text-primary">Registrar quantidade</h2>
              <MovementForm councils={lookups.councils.map((c) => ({ value: c.id, label: c.label }))} materials={lookups.materials.map((m) => ({ value: m.id, label: m.label }))} defaultType="entry" allowAdjust={canAdjust} />
            </section>
          ) : null}
          <SimpleTable
            caption="Movimentações de estoque (ledger)"
            rows={movements.map((m) => ({ id: m.id, at: m.createdAt.toISOString(), council: lookups.councilLabel[m.councilId] ?? "—", material: lookups.materialLabel[m.materialId] ?? "—", type: TYPE_LABEL[m.type] ?? m.type, quantity: m.quantity, reason: m.reason }))}
            columns={[{ key: "at", header: "Quando", kind: "datetime" }, { key: "council", header: "Conselho" }, { key: "material", header: "Material" }, { key: "type", header: "Tipo" }, { key: "quantity", header: "Quantidade", kind: "number" }, { key: "reason", header: "Motivo" }]}
            filterKeys={[{ key: "type", label: "Tipo" }]}
            emptyTitle="Nenhuma movimentação registrada"
          />
        </div>
      )}
    </Screen>
  );
}

export default function MovementsPage() {
  return (<><PageHeader title="Movimentações" description="Informe a quantidade no formulário. O saldo do estoque é a soma deste ledger." /><Suspense fallback={<LoadingState />}><Content /></Suspense></>);
}
