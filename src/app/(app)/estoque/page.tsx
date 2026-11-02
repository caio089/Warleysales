import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { buttonVariants } from "@/components/ui/button";
import { loadLookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { ok } from "@/shared/lib/result";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { SimpleTable } from "@/shared/ui/simple-table";

export const metadata: Metadata = { title: "Estoque" };

async function Content() {
  const result = await loadScreen(async (ctx) => {
    const [levels, lookups] = await Promise.all([ctx.services.inventory.listLevels(ctx.actor), loadLookups(ctx)]);
    if (!levels.ok) return levels;
    if (!lookups.ok) return lookups;
    return ok({ levels: levels.data, lookups: lookups.data });
  });
  return (
    <Screen result={result}>
      {({ levels, lookups }) => (
        <SimpleTable
          caption="Saldos de estoque"
          rows={levels.map((l) => ({
            id: `${l.councilId}:${l.materialId}`, council: lookups.councilLabel[l.councilId] ?? "—", material: lookups.materialLabel[l.materialId] ?? "—",
            physical: l.physical, reserved: l.reserved, available: l.available, minimum: l.minimum, level: l.level,
          }))}
          columns={[
            { key: "council", header: "Conselho" }, { key: "material", header: "Material" },
            { key: "physical", header: "Físico", kind: "number" }, { key: "reserved", header: "Reservado", kind: "number" },
            { key: "available", header: "Disponível", kind: "number" }, { key: "minimum", header: "Mínimo", kind: "number" },
            { key: "level", header: "Nível", kind: "status", dictionary: "stock" },
          ]}
          filterKeys={[{ key: "level", label: "Nível", dictionary: "stock" }, { key: "council", label: "Conselho" }]}
          emptyTitle="Nenhum saldo registrado"
          emptyDescription="O estoque só aumenta por recebimentos e movimentações registradas."
        />
      )}
    </Screen>
  );
}

export default function StockPage() {
  return (
    <>
      <PageHeader title="Estoque" description="Saldo físico, reservado e disponível por conselho." actions={<>
        <Link href="/estoque/materiais" className={buttonVariants({ variant: "outline" })}>Materiais</Link>
        <Link href="/estoque/movimentacoes" className={buttonVariants()}>Movimentações</Link>
      </>} />
      <Suspense fallback={<LoadingState />}><Content /></Suspense>
    </>
  );
}
