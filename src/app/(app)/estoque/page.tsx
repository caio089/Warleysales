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
import { ModuleInsight, ModuleInsightFallback } from "@/shared/ui/module-insight";
import { SimpleTable } from "@/shared/ui/simple-table";
import { buildHoldRows } from "./hold-rows";
import { contractReceiptBalance } from "@/modules/contracts/domain/receipt-balance";
import { buildStockEntrySources } from "./entry-sources";
import { MovementForm } from "./movimentacoes/movement-form";
import { MinimumForm } from "./minimum-form";

export const metadata: Metadata = { title: "Gestão de Estoque" };

async function Content() {
  const result = await loadScreen(async (ctx) => {
    const [levels, lookups, requests, processes, atas, contracts, receiptLines, pendingFormalizations, homologatedFormalizations] = await Promise.all([
      ctx.services.inventory.listLevels(ctx.actor),
      loadLookups(ctx),
      ctx.services.purchases.list(ctx.actor),
      ctx.services.processes.list(ctx.actor),
      ctx.services.atas.list(ctx.actor),
      ctx.services.contracts.list(ctx.actor),
      ctx.services.contracts.listReceiptLines(ctx.actor),
      ctx.services.formalizations.listPending(ctx.actor),
      ctx.services.formalizations.listHomologated(ctx.actor),
    ]);
    if (!levels.ok) return levels;
    if (!lookups.ok) return lookups;
    if (!requests.ok) return requests;
    if (!processes.ok) return processes;
    if (!atas.ok) return atas;
    if (!contracts.ok) return contracts;
    if (!receiptLines.ok) return receiptLines;
    const summary = calculateStockSummary(levels.data);
    const formalizations = [
      ...(pendingFormalizations.ok ? pendingFormalizations.data : []),
      ...(homologatedFormalizations.ok ? homologatedFormalizations.data : []),
    ];
    const processById = new Map(processes.data.map((view) => [view.process.id, view]));
    const ataByItem = new Map(atas.data.flatMap((view) => view.ata.items.map((item) => [item.id, { view, item }] as const)));
    const stockByMaterial = new Map(levels.data.map((level) => [`${level.councilId}:${level.materialId}`, level.available]));
    const balancesByMaterial = new Map<string, { ataTotal: number; ataBalance: number; contractTotal: number; contractBalance: number }>();
    for (const view of atas.data) {
      if (view.ata.status === "cancelada" || !view.ata.processId) continue;
      for (const item of view.items) {
        if (!item.materialId) continue;
        const key = `${view.ata.councilId}:${view.ata.processId}:${item.materialId}`;
        const current = balancesByMaterial.get(key) ?? { ataTotal: 0, ataBalance: 0, contractTotal: 0, contractBalance: 0 };
        current.ataTotal += item.balance.registered;
        current.ataBalance += item.balance.balance;
        balancesByMaterial.set(key, current);
      }
    }
    for (const view of contracts.data) {
      const contract = view.contract;
      if (!contract.processId || !contract.ataId) continue;
      const ata = atas.data.find((item) => item.ata.id === contract.ataId);
      if (!ata || ata.ata.status === "cancelada") continue;
      const balance = contractReceiptBalance(contract.id, contract.ataItems, receiptLines.data);
      for (const row of balance.rows) {
        const materialId = ataByItem.get(row.ataItemId)?.item.materialId;
        if (!materialId) continue;
        const key = `${contract.councilId}:${contract.processId}:${materialId}`;
        const current = balancesByMaterial.get(key) ?? { ataTotal: 0, ataBalance: 0, contractTotal: 0, contractBalance: 0 };
        current.contractTotal += row.contracted;
        current.contractBalance += row.remaining;
        balancesByMaterial.set(key, current);
      }
    }
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
    const entrySources = buildStockEntrySources({
      requests: requests.data,
      processes: processes.data,
      atas: atas.data,
      materialLabel: lookups.data.materialLabel,
      contracts: contracts.data.map((view) => ({
        id: view.contract.id,
        number: view.contract.number,
        processId: view.contract.processId ?? null,
        ataId: view.contract.ataId ?? null,
        ataItems: (view.contract.ataItems ?? []).map((item) => ({
          ataItemId: item.ataItemId,
          quantity: item.quantity,
        })),
      })),
    });
    const receivableMaterials = new Set(entrySources.flatMap((source) =>
      source.items.map((item) => `${source.councilId}:${source.processId}:${item.materialId}`),
    ));
    const holds = buildHoldRows(
      requests.data
        .filter((request) => request.processId)
        .map((request) => {
          const processId = request.processId!;
          const view = processById.get(processId);
          const formalization = formalizationByProcess.get(processId);
          const allItemsReceivable = request.items.length > 0 && request.items.every((item) =>
            receivableMaterials.has(`${request.councilId}:${processId}:${item.materialId}`),
          );
          const status = formalization?.status === "homologado"
            ? "disponivel"
            : formalization?.status === "aguardando_homologacao"
              ? "aguardando_homologacao"
              : view?.progress.isComplete
                ? "apto"
                : "bloqueado";
          return {
            id: request.id,
            title: request.title,
            councilId: request.councilId,
            processId,
            status: allItemsReceivable && (status === "apto" || status === "bloqueado") ? "contratado" : status,
            items: request.items.map((item) => ({
              ...item,
              ...balancesByMaterial.get(`${request.councilId}:${processId}:${item.materialId}`),
              stockBalance: stockByMaterial.get(`${request.councilId}:${item.materialId}`) ?? 0,
              status: item.quantity > 0 && item.receivedTotal >= item.quantity
                ? "recebido"
                : (status === "apto" || status === "bloqueado") &&
                  receivableMaterials.has(`${request.councilId}:${processId}:${item.materialId}`)
                  ? "contratado"
                  : status,
            })),
          };
        }),
      { council: lookups.data.councilLabel, material: lookups.data.materialName },
    );
    return ok({
      levels: levels.data,
      lookups: lookups.data,
      summary,
      holds,
      processByMaterial,
      entrySources,
      canMove: canInAnyCouncil(ctx.actor, "stock.move"),
      canAdjust: canInAnyCouncil(ctx.actor, "stock.adjust"),
    });
  });

  return (
    <Screen result={result}>
      {({ levels, lookups, summary, holds, processByMaterial, entrySources, canMove, canAdjust }) => {
        const councils = lookups.councils.map((c) => ({ value: c.id, label: c.label }));
        const materials = lookups.materials.map((m) => ({ value: m.id, label: m.label }));

        return (
          <div className="space-y-8">
            <Suspense fallback={<ModuleInsightFallback />}>
              <ModuleInsight moduleName="Estoque" sourceHref="/estoque" facts={[
                { label: "Bloqueado", value: summary.totalBlocked },
                { label: "Pronto para uso", value: summary.totalReady },
                { label: "Reservado", value: summary.totalReserved },
                { label: "Itens críticos", value: levels.filter((l) => l.level === "critico").length },
              ]} />
            </Suspense>
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
                hint="Alocado para transferências ou saídas"
              />
              <KpiCard
                icon={<Percent className="size-4" aria-hidden />}
                label="% Saldo Liberado"
                value={formatPercent(summary.percentReady)}
                hint="Percentual do estoque total liberado"
              />
            </section>

            {canMove ? (
              <section id="movimentar" aria-labelledby="informar-quantidade" className="surface-card max-w-4xl scroll-mt-24 p-6">
                <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div className="flex items-center gap-2">
                    <span className="grid size-9 place-items-center rounded-xl bg-secondary text-primary">
                      <PackagePlus className="size-4" aria-hidden />
                    </span>
                    <div>
                      <h2 id="informar-quantidade" className="font-heading text-base font-semibold tracking-tight text-primary">
                        Movimentar estoque
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Entrada no estoque, saída como entrega ao órgão, ou um ajuste de saldo.
                      </p>
                    </div>
                  </div>
                  <Link href="/estoque/movimentacoes" className="text-xs font-medium text-primary underline-offset-4 hover:underline">
                    Ver histórico
                  </Link>
                </div>

                {materials.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Cadastre um material em{" "}
                    <Link href="/estoque/materiais" className="font-medium text-primary underline-offset-4 hover:underline">
                      Materiais
                    </Link>{" "}
                    antes de lançar quantidade.
                  </p>
                ) : councils.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Cadastre uma empresa antes de lançar estoque.</p>
                ) : (
                  <MovementForm
                    councils={councils}
                    materials={materials}
                    entrySources={entrySources}
                    defaultType="entry"
                    allowAdjust={canAdjust}
                  />
                )}
              </section>
            ) : null}

            <section aria-label="Solicitações no estoque" className="space-y-3">
              {holds.some((row) => row.balanceNotice.includes("esgotad")) ? (
                <div role="alert" className="flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
                  <AlertTriangle className="size-4 shrink-0" aria-hidden />
                  Há itens com saldo da ata ou do contrato esgotado. Confira as linhas abaixo antes de registrar novas entradas.
                </div>
              ) : null}
              <div>
                <SectionLabel>Solicitações no estoque</SectionLabel>
                <p className="text-xs text-muted-foreground">
                  Cada produto da demanda aparece em uma linha. O contrato libera a entrada do item; o saldo físico fica disponível após o recebimento. Clique para abrir o processo.
                </p>
              </div>
              <SimpleTable
                caption="Solicitações bloqueadas e liberadas"
                rows={holds}
                columns={[
                  { key: "name", header: "Produto", kind: "link", hrefKey: "href" },
                  { key: "quantityLabel", header: "Quantidade" },
                  { key: "ataTotal", header: "Total da ata", kind: "number" },
                  { key: "ataBalance", header: "Saldo da ata", kind: "number" },
                  { key: "contractTotal", header: "Total contratado", kind: "number" },
                  { key: "contractBalance", header: "Saldo do contrato", kind: "number" },
                  { key: "stockBalance", header: "Saldo físico atual", kind: "number" },
                  { key: "balanceNotice", header: "Disponibilidade" },
                  { key: "demand", header: "Demanda" },
                  { key: "council", header: "Órgão" },
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
                  <SectionLabel>Saldos de Estoque por Órgão</SectionLabel>
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
                  move: canMove ? "Movimentar" : "",
                  moveHref: canMove ? `/estoque?council=${l.councilId}&material=${l.materialId}#movimentar` : "",
                };
                })}
                columns={[
                  { key: "material", header: "Produto", kind: "link", hrefKey: "processHref" },
                  { key: "council", header: "Órgão" },
                  { key: "blocked", header: "Bloqueado", kind: "number" },
                  { key: "ready", header: "Pronto para Uso", kind: "number" },
                  { key: "reserved", header: "Reservado", kind: "number" },
                  { key: "total", header: "Total", kind: "number" },
                  { key: "minimum", header: "Mínimo", kind: "number" },
                  { key: "level", header: "Nível", kind: "status", dictionary: "stock" },
                  ...(canMove ? [{ key: "move", header: "Ação", kind: "link" as const, hrefKey: "moveHref" }] : []),
                ]}
                filterKeys={[
                  { key: "council", label: "Órgão" },
                  { key: "level", label: "Nível", dictionary: "stock" },
                ]}
                emptyTitle="Nenhum saldo registrado"
                emptyDescription="Use Movimentar estoque acima para lançar a primeira entrada."
              />
            </section>

            {canAdjust && materials.length > 0 && councils.length > 0 ? (
              <section aria-labelledby="estoque-minimo" className="surface-card p-6">
                <div className="mb-4 flex items-center gap-2">
                  <span className="grid size-9 place-items-center rounded-xl bg-secondary text-primary">
                    <AlertTriangle className="size-4" aria-hidden />
                  </span>
                  <div>
                    <h2 id="estoque-minimo" className="font-heading text-base font-semibold tracking-tight text-primary">
                      Estoque mínimo
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Linha de alerta para avisar quando o saldo pronto para uso ficar baixo.
                    </p>
                  </div>
                </div>
                <MinimumForm councils={councils} materials={materials} />
              </section>
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
        description="Entrada coloca o produto no estoque; saída entrega ao órgão; ajuste corrige o saldo."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link href="#movimentar" className={buttonVariants()}>
              <PackagePlus className="mr-1.5 size-4" aria-hidden />
              Movimentar estoque
            </Link>
            <Link href="/estoque/materiais" className={buttonVariants({ variant: "outline" })}>
              Catálogo de Produtos
            </Link>
            <Link href="/estoque/movimentacoes" className={buttonVariants({ variant: "outline" })}>
              <History className="mr-1.5 size-4" aria-hidden />
              Histórico
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
