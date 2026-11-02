import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { buttonVariants } from "@/components/ui/button";
import { loadLookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { canInAnyCouncil } from "@/shared/lib/authz/policy";
import { ok } from "@/shared/lib/result";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { SimpleTable } from "@/shared/ui/simple-table";
import { MovementForm } from "./movimentacoes/movement-form";
import { MinimumForm } from "./minimum-form";

export const metadata: Metadata = { title: "Estoque" };

async function Content() {
  const result = await loadScreen(async (ctx) => {
    const [levels, lookups] = await Promise.all([ctx.services.inventory.listLevels(ctx.actor), loadLookups(ctx)]);
    if (!levels.ok) return levels;
    if (!lookups.ok) return lookups;
    return ok({
      levels: levels.data,
      lookups: lookups.data,
      canMove: canInAnyCouncil(ctx.actor, "stock.move"),
      canAdjust: canInAnyCouncil(ctx.actor, "stock.adjust"),
    });
  });
  return (
    <Screen result={result}>
      {({ levels, lookups, canMove, canAdjust }) => {
        const councils = lookups.councils.map((c) => ({ value: c.id, label: c.label }));
        const materials = lookups.materials.map((m) => ({ value: m.id, label: m.label }));
        return (
          <div className="flex flex-col-reverse gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
            <SimpleTable
              caption="Saldos de estoque"
              rows={levels.map((l) => ({
                id: `${l.councilId}:${l.materialId}`,
                council: lookups.councilLabel[l.councilId] ?? "—",
                material: lookups.materialLabel[l.materialId] ?? "—",
                physical: l.physical,
                reserved: l.reserved,
                available: l.available,
                minimum: l.minimum,
                level: l.level,
              }))}
              columns={[
                { key: "council", header: "Conselho" },
                { key: "material", header: "Material" },
                { key: "physical", header: "Físico", kind: "number" },
                { key: "reserved", header: "Reservado", kind: "number" },
                { key: "available", header: "Disponível", kind: "number" },
                { key: "minimum", header: "Mínimo", kind: "number" },
                { key: "level", header: "Nível", kind: "status", dictionary: "stock" },
              ]}
              filterKeys={[{ key: "level", label: "Nível", dictionary: "stock" }, { key: "council", label: "Conselho" }]}
              emptyTitle="Nenhum saldo registrado"
              emptyDescription="Informe a quantidade no formulário. Cada entrada vira uma movimentação no ledger."
            />
            {canMove ? (
              <div className="space-y-6">
                <section aria-labelledby="informar-quantidade" className="surface-card p-6">
                  <h2 id="informar-quantidade" className="font-heading text-lg font-medium tracking-tight text-primary">
                    Informar quantidade
                  </h2>
                  <p className="mt-1 mb-4 text-sm leading-relaxed text-muted-foreground">
                    A quantidade entra no saldo do conselho. O tipo padrão é entrada.
                  </p>
                  {materials.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Cadastre um material em{" "}
                      <Link href="/estoque/materiais" className="font-medium text-primary underline-offset-4 hover:text-highlight hover:underline">
                        Materiais
                      </Link>{" "}
                      antes de lançar quantidade.
                    </p>
                  ) : councils.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Cadastre um conselho antes de lançar estoque.</p>
                  ) : (
                    <MovementForm councils={councils} materials={materials} defaultType="entry" allowAdjust={canAdjust} />
                  )}
                </section>
                {canAdjust && materials.length > 0 && councils.length > 0 ? <MinimumForm councils={councils} materials={materials} /> : null}
              </div>
            ) : null}
          </div>
        );
      }}
    </Screen>
  );
}

export default function StockPage() {
  return (
    <>
      <PageHeader
        title="Estoque"
        description="Informe a quantidade aqui. O saldo físico, reservado e disponível é calculado pelas movimentações."
        actions={
          <>
            <Link href="/estoque/materiais" className={buttonVariants({ variant: "outline" })}>Materiais</Link>
            <Link href="/estoque/movimentacoes" className={buttonVariants({ variant: "outline" })}>Histórico</Link>
          </>
        }
      />
      <Suspense fallback={<LoadingState />}><Content /></Suspense>
    </>
  );
}
