import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AlertTriangle, CheckCircle2, History, Package, PackagePlus, PackageX } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { loadLookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { canInAnyCouncil } from "@/shared/lib/authz/policy";
import { ok } from "@/shared/lib/result";
import { KpiCard } from "@/shared/ui/kpi-card";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader, SectionLabel } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { SimpleTable } from "@/shared/ui/simple-table";
import { MovementForm } from "./movimentacoes/movement-form";
import { MinimumForm } from "./minimum-form";

export const metadata: Metadata = { title: "Gestão de Estoque" };

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

        const totalPhysical = levels.reduce((acc, l) => acc + Number(l.physical), 0);
        const totalReserved = levels.reduce((acc, l) => acc + Number(l.reserved), 0);
        const totalAvailable = levels.reduce((acc, l) => acc + Number(l.available), 0);
        const criticalItems = levels.filter((l) => l.level !== "normal");

        return (
          <div className="space-y-8">
            {/* KPIs de Estoque */}
            <section aria-label="Métricas de Estoque" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <KpiCard
                href="/estoque/materiais"
                icon={<Package className="size-4" aria-hidden />}
                label="Catálogo de Produtos"
                value={materials.length}
                hint="Materiais cadastrados"
              />
              <KpiCard
                icon={<Package className="size-4" aria-hidden />}
                label="Saldo Disponível Total"
                value={`${totalAvailable} un`}
                hint="Pronto para uso/entrega"
              />
              <KpiCard
                icon={<Package className="size-4" aria-hidden />}
                label="Saldo Físico Total"
                value={`${totalPhysical} un`}
                hint="Total em armazém"
              />
              <KpiCard
                icon={<Package className="size-4" aria-hidden />}
                label="Saldo Reservado"
                value={`${totalReserved} un`}
                hint="Em trânsito / alocado"
              />
              <KpiCard
                icon={<PackageX className="size-4" aria-hidden />}
                label="Itens Críticos"
                value={criticalItems.length}
                accent={criticalItems.length > 0}
                hint={criticalItems.length > 0 ? "Abaixo do mínimo" : "Estoque regular"}
              />
            </section>

            {/* Tabela de Saldos em Largura Total */}
            <section aria-label="Tabela de Saldos" className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <SectionLabel>Saldos de Estoque por Empresa</SectionLabel>
                  <p className="text-xs text-muted-foreground">
                    O saldo disponível é o físico deduzido do reservado. Níveis calculados conforme o mínimo de segurança.
                  </p>
                </div>
              </div>

              <SimpleTable
                caption="Saldos de estoque"
                rows={levels.map((l) => ({
                  id: `${l.councilId}:${l.materialId}`,
                  council: lookups.councilLabel[l.councilId] ?? "—",
                  material: lookups.materialLabel[l.materialId] ?? "—",
                  available: l.available,
                  physical: l.physical,
                  reserved: l.reserved,
                  minimum: l.minimum,
                  level: l.level,
                }))}
                columns={[
                  { key: "council", header: "Empresa Destinatária" },
                  { key: "material", header: "Produto" },
                  { key: "available", header: "Disponível", kind: "number" },
                  { key: "physical", header: "Físico", kind: "number" },
                  { key: "reserved", header: "Reservado", kind: "number" },
                  { key: "minimum", header: "Mínimo", kind: "number" },
                  { key: "level", header: "Situação", kind: "status", dictionary: "stock" },
                ]}
                filterKeys={[
                  { key: "council", label: "Empresa" },
                  { key: "level", label: "Situação", dictionary: "stock" },
                ]}
                emptyTitle="Nenhum saldo registrado"
                emptyDescription="Lance a primeira entrada de material abaixo para alimentar o estoque."
              />
            </section>

            {/* Painéis Operacionais: Lançar Movimentação & Ajustar Estoque Mínimo */}
            {canMove ? (
              <div className="grid gap-6 lg:grid-cols-2">
                <section aria-labelledby="informar-quantidade" className="surface-card p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="grid size-9 place-items-center rounded-xl bg-secondary text-primary">
                      <PackagePlus className="size-4" aria-hidden />
                    </span>
                    <div>
                      <h2 id="informar-quantidade" className="font-heading text-base font-semibold tracking-tight text-primary">
                        Registrar Movimentação de Estoque
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Lança entradas, consumos ou ajustes permanentemente no ledger.
                      </p>
                    </div>
                  </div>

                  {materials.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Cadastre um material em{" "}
                      <Link href="/estoque/materiais" className="font-medium text-primary underline-offset-4 hover:text-highlight hover:underline">
                        Materiais
                      </Link>{" "}
                      antes de lançar quantidade.
                    </p>
                  ) : councils.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Cadastre uma empresa antes de lançar estoque.</p>
                  ) : (
                    <MovementForm councils={councils} materials={materials} defaultType="entry" allowAdjust={canAdjust} />
                  )}
                </section>

                {canAdjust && materials.length > 0 && councils.length > 0 ? (
                  <section aria-labelledby="estoque-minimo" className="surface-card p-6">
                    <div className="mb-4 flex items-center gap-2">
                      <span className="grid size-9 place-items-center rounded-xl bg-secondary text-primary">
                        <AlertTriangle className="size-4" aria-hidden />
                      </span>
                      <div>
                        <h2 id="estoque-minimo" className="font-heading text-base font-semibold tracking-tight text-primary">
                          Configurar Estoque Mínimo de Segurança
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          Define a linha de alerta para disparo automático de avisos de reposição.
                        </p>
                      </div>
                    </div>
                    <MinimumForm councils={councils} materials={materials} />
                  </section>
                ) : null}
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
        eyebrow="Operação & Armazenagem"
        title="Gestão de Estoque"
        description="Controle rigoroso de saldos disponíveis, estoque reservado e quantidades físicas por empresa, alimentado por ledger imutável."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/estoque/materiais" className={buttonVariants({ variant: "outline" })}>
              Catálogo de Produtos
            </Link>
            <Link href="/estoque/movimentacoes" className={buttonVariants({ variant: "outline" })}>
              <History className="mr-1.5 size-4" />
              Histórico do Ledger
            </Link>
          </div>
        }
      />
      <Suspense fallback={<LoadingState />}>
        <Content />
      </Suspense>
    </>
  );
}
