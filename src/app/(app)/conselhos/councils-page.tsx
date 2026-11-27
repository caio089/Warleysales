import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Building2, ExternalLink, MessageCircle, PackageX, Plus, ShoppingCart } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { formatWhatsapp, whatsappHref } from "@/modules/identity/domain/whatsapp";
import { loadScreen } from "@/server/screen";
import { KpiCard } from "@/shared/ui/kpi-card";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader, SectionLabel } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { ModuleInsight, ModuleInsightFallback } from "@/shared/ui/module-insight";
import { StatusBadge } from "@/shared/ui/status-badge";

// Route implementation lives outside page.tsx so its testable content export is valid in Next.js 16.

export const metadata: Metadata = { title: "Órgãos e Empresas" };

export async function CouncilsContent() {
  const result = await loadScreen(async ({ services, actor }) => {
    const [councilsRes, requestsRes, stockRes] = await Promise.all([
      services.councils.list(actor),
      services.purchases.list(actor),
      services.inventory.listLevels(actor),
    ]);

    if (!councilsRes.ok) return councilsRes;
    if (!requestsRes.ok) return requestsRes;
    if (!stockRes.ok) return stockRes;

    const councils = councilsRes.data;
    const requests = requestsRes.data;
    const stock = stockRes.data;

    const enriched = councils.map((c) => {
      const companyRequests = requests.filter((r) => r.councilId === c.id);
      const pendingReqs = companyRequests.filter((r) =>
        ["enviada", "em_analise", "aguardando_correcao", "aprovada", "em_atendimento", "parcialmente_atendida"].includes(r.status),
      );
      const companyStock = stock.filter((s) => s.councilId === c.id);
      const criticalStock = companyStock.filter((s) => s.level !== "normal");

      return {
        ...c,
        openRequestsCount: pendingReqs.length,
        criticalStockCount: criticalStock.length,
        totalStockItems: companyStock.length,
      };
    });

    return {
      ok: true as const,
      data: {
        councils: enriched,
        totalActive: councils.filter((c) => c.active).length,
        totalWithPending: enriched.filter((c) => c.openRequestsCount > 0).length,
        totalWithCriticalStock: enriched.filter((c) => c.criticalStockCount > 0).length,
        totalPrivateCompanies: councils.filter((c) => c.organizationType === "private_company").length,
      },
    };
  });

  return (
    <Screen result={result}>
      {({ councils, totalActive, totalWithPending, totalWithCriticalStock, totalPrivateCompanies }) => (
        <div className="space-y-8">
          <Suspense fallback={<ModuleInsightFallback />}>
            <ModuleInsight moduleName="Órgãos e empresas" sourceHref="/conselhos" facts={[
              { label: "Cadastrados", value: councils.length },
              { label: "Ativos", value: totalActive },
              { label: "Com demandas abertas", value: totalWithPending },
              { label: "Empresas privadas", value: totalPrivateCompanies },
            ]} />
          </Suspense>
          {/* Métricas dos Órgãos */}
          <section aria-label="Métricas dos Órgãos" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              icon={<Building2 className="size-4" aria-hidden />}
              label="Organizações Cadastradas"
              value={councils.length}
              hint={`${totalActive} ativos no sistema`}
            />
            <KpiCard
              icon={<ShoppingCart className="size-4" aria-hidden />}
              label="Com Demandas Abertas"
              value={totalWithPending}
              accent={totalWithPending > 0}
              hint="Aguardando atendimento"
            />
            <KpiCard
              icon={<PackageX className="size-4" aria-hidden />}
              label="Com Estoque Crítico"
              value={totalWithCriticalStock}
              accent={totalWithCriticalStock > 0}
              hint={totalWithCriticalStock > 0 ? "Reposição prioritária" : "Todos abastecidos"}
            />
            <KpiCard
              icon={<Building2 className="size-4" aria-hidden />}
              label="Empresas Privadas"
              value={totalPrivateCompanies}
              hint="Atendidas pela assessoria"
            />
          </section>

          {/* Listagem de Órgãos em Cards Ricos */}
          <section aria-label="Lista de Órgãos" className="space-y-4">
            <SectionLabel>Órgãos e Empresas Cadastrados</SectionLabel>
            {councils.length === 0 ? (
              <div className="surface-card flex flex-col items-center justify-center p-12 text-center">
                <Building2 className="size-12 text-muted-foreground/50" />
                <h3 className="mt-4 font-heading text-lg font-medium text-primary">Nenhuma organização cadastrada</h3>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Cadastre o primeiro órgão ou empresa para iniciar o acompanhamento.
                </p>
                <Link href="/conselhos/novo" className={buttonVariants({ className: "mt-4" })}>
                  Cadastrar Organização
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {councils.map((c) => (
                  <div
                    key={c.id}
                    className="surface-card card-hover flex min-w-0 flex-col justify-between overflow-hidden p-5 transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 flex-1 items-start gap-3">
                          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-xs">
                            {c.acronym.slice(0, 4)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <h3 className="line-clamp-2 break-words font-heading text-base font-semibold leading-snug text-primary" title={c.name}>
                              {c.name}
                            </h3>
                            <p className="text-xs text-muted-foreground">Sigla: {c.acronym}</p>
                            <p className="text-xs font-medium text-primary/75">{c.organizationType === "private_company" ? "Empresa privada" : "Órgão público"}</p>
                          </div>
                        </div>
                        <span className="shrink-0"><StatusBadge
                          label={c.active ? "Ativo" : "Inativo"}
                          tone={c.active ? "success" : "neutral"}
                        /></span>
                      </div>

                      {c.institutionalInfo ? (
                        <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {c.institutionalInfo}
                        </p>
                      ) : null}

                      {/* Indicadores Operacionais do Órgão */}
                      <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-border/60 bg-secondary/40 p-2.5 text-xs">
                        <div>
                          <span className="text-[0.68rem] text-muted-foreground uppercase">Solicitações</span>
                          <p className="font-semibold text-primary">
                            {c.openRequestsCount > 0 ? (
                              <span className="text-highlight">{c.openRequestsCount} aberta(s)</span>
                            ) : (
                              <span className="text-muted-foreground">Sem pendências</span>
                            )}
                          </p>
                        </div>
                        <div>
                          <span className="text-[0.68rem] text-muted-foreground uppercase">Estoque</span>
                          <p className="font-semibold text-primary">
                            {c.criticalStockCount > 0 ? (
                              <span className="text-destructive font-bold">{c.criticalStockCount} crítico(s)</span>
                            ) : (
                              <span className="text-success-foreground font-medium">Regular ({c.totalStockItems} itens)</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* WhatsApp Direto */}
                      {c.whatsappE164 ? (
                        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                          <MessageCircle className="size-3.5 text-success-foreground" />
                          <span>{formatWhatsapp(c.whatsappE164)}</span>
                          <a
                            href={whatsappHref(c.whatsappE164)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-primary hover:text-highlight hover:underline"
                          >
                            (Conversar)
                          </a>
                        </div>
                      ) : null}
                    </div>

                    {/* Ações Rápidas */}
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
                      <Link
                        href={`/conselhos/${c.id}`}
                        className="text-xs font-semibold text-primary hover:text-highlight hover:underline"
                      >
                        Visão 360°
                      </Link>
                      <Link
                        href={`/dashboard?councilId=${c.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary"
                        title="Ver como a organização enxerga o painel"
                      >
                        <span>Painel da organização</span>
                        <ExternalLink className="size-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </Screen>
  );
}

export default function CouncilsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Operação & Relacionamento"
        backHref="/administracao"
        backLabel="Voltar para Administração"
        title="Órgãos e Empresas"
        description="Gestão centralizada de órgãos públicos e empresas privadas atendidas pela assessoria."
        actions={
          <Link href="/conselhos/novo" className={buttonVariants()}>
            <Plus className="mr-1.5 size-4" />
            Cadastrar Organização
          </Link>
        }
      />
      <Suspense fallback={<LoadingState />}>
        <CouncilsContent />
      </Suspense>
    </>
  );
}
