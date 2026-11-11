import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AlertTriangle, CheckCircle2, History, Lock, Package, PackagePlus, Percent } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { calculateStockSummary } from "@/modules/inventory/service";
import { loadLookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { canInAnyCouncil } from "@/shared/lib/authz/policy";
import { formatNumber, formatPercent } from "@/shared/lib/format";
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
    const [levels, lookups, requests, processes, pendingFormalizations, homologatedFormalizations] = await Promise.all([
      ctx.services.inventory.listLevels(ctx.actor),
      loadLookups(ctx),
      ctx.services.purchases.list(ctx.actor),
      ctx.services.processes.list(ctx.actor),
      ctx.services.formalizations.listPending(ctx.actor),
      ctx.services.formalizations.listHomologated(ctx.actor),
    ]);
    if (!levels.ok) return levels;
    if (!lookups.ok) return lookups;
    if (!requests.ok) return requests;
    if (!processes.ok) return processes;
    const summary = calculateStockSummary(levels.data);
    const formalizations = [
      ...(pendingFormalizations.ok ? pendingFormalizations.data : []),
      ...(homologatedFormalizations.ok ? homologatedFormalizations.data : []),
    ];
    const processById = new Map(processes.data.map((view) => [view.process.id, view]));
    const formalizationByProcess = new Map(formalizations.map((item) => [item.processId, item]));
    const processByMaterial = new Map<string, string>();
    for (const request of requests.data) {
      if (!request.processId) continue;
      const formalization = formalizationByProcess.get(request.processId);
      for (const item of request.items) {
        const key = `${request.councilId}:${item.materialId}`;
        const current = processByMaterial.get(key);
        const currentDone = current ? formalizationByProcess.get(current)?.status === "homologado" : false;
        if (!current || (currentDone && formalization?.status !== "homologado")) {
          processByMaterial.set(key, request.processId);
        }
      }
    }
    const holds = requests.data
      .filter((request) => request.processId)
      .map((request) => {
        const processId = request.processId!;
        const view = processById.get(processId);
        const formalization = formalizationByProcess.get(processId);
        const status = formalization?.status === "homologado"
          ? "disponivel"
          : formalization?.status === "aguardando_homologacao"
            ? "aguardando_homologacao"
            : view?.progress.isComplete
              ? "apto"
              : "bloqueado";
        const itemName = request.items.length === 1
          ? lookups.data.materialName[request.items[0]!.materialId] ?? request.title
          : request.title;
        return {
          id: request.id,
          name: itemName,
          council: lookups.data.councilLabel[request.councilId] ?? "—",
          quantity: request.items.reduce((total, item) => total + item.quantity, 0),
          status,
          href: `/processos/${processId}`,
        };
      });
    return ok({
      levels: levels.data,
      lookups: lookups.data,
      summary,
      holds,
      processByMaterial,
      canMove: canInAnyCouncil(ctx.actor, "stock.move"),
      canAdjust: canInAnyCouncil(ctx.actor, "stock.adjust"),
    });
  });

  return (
    <Screen result={result}>
      {({ levels, lookups, summary, holds, processByMaterial, canMove, canAdjust }) => {
        const councils = lookups.councils.map((c) => ({ value: c.id, label: c.label }));
        const materials = lookups.materials.map((m) => ({ value: m.id, label: m.label }));

        return (
          <div className="space-y-8">
            {/* KPIs de Estoque */}
            <section aria-label="Métricas de Estoque" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard
                icon={<Lock className="size-4" aria-hidden />}
                label="Bloqueado em Formalização"
                value={`${formatNumber(summary.totalBlocked)} un`}
                hint="Aguardando homologação de compra"
              />
              <KpiCard
                icon={<CheckCircle2 className="size-4" aria-hidden />}
                label="Pronto para Uso (Liberado)"
                value={`${formatNumber(summary.totalReady)} un`}
                hint="Saldo físico disponível para uso imediato"
              />
              <KpiCard
                icon={<Package className="size-4" aria-hidden />}
                label="Reservado / Em Trânsito"
                value={`${formatNumber(summary.totalReserved)} un`}
                hint="Alocado para transferências ou entregas"
              />
              <KpiCard
                icon={<Percent className="size-4" aria-hidden />}
                label="% Saldo Liberado"
                value={formatPercent(summary.percentReady)}
                hint="Percentual do estoque total liberado"
              />
            </section>

            <section aria-label="Solicitações no estoque" className="space-y-3">
              <div>
                <SectionLabel>Solicitações no estoque</SectionLabel>
                <p className="text-xs text-muted-foreground">
                  Clique no produto para abrir a página do processo: documentos, valor inicial, atas, contratos e a liberação do estoque.
                </p>
              </div>
              <SimpleTable
                caption="Solicitações bloqueadas e liberadas"
                rows={holds}
                columns={[
                  { key: "name", header: "Produto", kind: "link", hrefKey: "href" },
                  { key: "council", header: "Órgão" },
                  { key: "quantity", header: "Quantidade", kind: "number" },
                  { key: "status", header: "Status", kind: "status", dictionary: "hold" },
                ]}
                filterKeys={[{ key: "status", label: "Status", dictionary: "hold" }, { key: "council", label: "Órgão" }]}
                emptyTitle="Nenhuma solicitação no estoque"
                emptyDescription="Ao criar uma solicitação com processo, ela aparece aqui bloqueada até a liberação."
              />
            </section>

            {/* Tabela de Saldos em Largura Total */}
            <section aria-label="Tabela de Saldos" className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <SectionLabel>Saldos de Estoque por Órgão/Conselho</SectionLabel>
                  <p className="text-xs text-muted-foreground">
                    Segmentação entre estoque bloqueado em formalização, pronto para uso e reservado conforme o mínimo de segurança.
                  </p>
                </div>
              </div>

              <SimpleTable
                caption="Saldos de estoque"
                rows={levels.map((l) => {
                  const processId = processByMaterial.get(`${l.councilId}:${l.materialId}`);
                  return {
                  id: `${l.councilId}:${l.materialId}`,
                  material: lookups.materialName[l.materialId] ?? lookups.materialLabel[l.materialId] ?? "—",
                  processHref: processId ? `/processos/${processId}` : "",
                  council: lookups.councilLabel[l.councilId] ?? "—",
                  blocked: l.blocked,
                  ready: l.available,
                  reserved: l.reserved,
                  total: l.physical + l.blocked,
                  minimum: l.minimum,
                  level: l.level,
                };
                })}
                columns={[
                  { key: "material", header: "Produto", kind: "link", hrefKey: "processHref" },
                  { key: "council", header: "Órgão/Conselho" },
                  { key: "blocked", header: "Bloqueado", kind: "number" },
                  { key: "ready", header: "Pronto para Uso", kind: "number" },
                  { key: "reserved", header: "Reservado", kind: "number" },
                  { key: "total", header: "Total", kind: "number" },
                  { key: "minimum", header: "Mínimo", kind: "number" },
                  { key: "level", header: "Nível", kind: "status", dictionary: "stock" },
                ]}
                filterKeys={[
                  { key: "council", label: "Órgão/Conselho" },
                  { key: "level", label: "Nível", dictionary: "stock" },
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
        description="Controle de estoque bloqueado em formalização, saldo pronto para uso e reservas por órgão conveniado, alimentado por ledger imutável."
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
