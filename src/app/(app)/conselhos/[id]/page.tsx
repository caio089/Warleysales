import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  Building2,
  CalendarDays,
  ExternalLink,
  MessageCircle,
  Package,
  PackageX,
  Plus,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { formatWhatsapp, whatsappHref } from "@/modules/identity/domain/whatsapp";
import { loadLookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { can } from "@/shared/lib/authz/policy";
import { ok } from "@/shared/lib/result";
import { KpiCard } from "@/shared/ui/kpi-card";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader, SectionLabel } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { StatusBadge } from "@/shared/ui/status-badge";
import { presentationOf, REQUEST_STATUS, STOCK_LEVEL } from "@/shared/ui/status-presentation";
import { SimpleTable } from "@/shared/ui/simple-table";
import { EditCouncilForm } from "../new-council-form";

export const metadata: Metadata = { title: "Visão 360° da Empresa" };

async function CouncilContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await loadScreen(async (ctx) => {
    const { services, actor } = ctx;
    const [councilRes, requestsRes, stockRes, meetingsRes, lookupsRes] = await Promise.all([
      services.councils.get(actor, id),
      services.purchases.list(actor),
      services.inventory.listLevels(actor, id),
      services.meetings.list(actor),
      loadLookups(ctx),
    ]);

    if (!councilRes.ok) return councilRes;
    if (!lookupsRes.ok) return lookupsRes;

    const council = councilRes.data;
    const requests = requestsRes.ok ? requestsRes.data.filter((r) => r.councilId === id) : [];
    const stock = stockRes.ok ? stockRes.data : [];
    const meetings = meetingsRes.ok ? meetingsRes.data.filter((m) => m.councilId === id) : [];

    const pendingRequests = requests.filter((r) =>
      ["enviada", "em_analise", "aguardando_correcao", "aprovada", "em_atendimento", "parcialmente_atendida"].includes(r.status),
    );

    let pendingDeliveryUnits = 0;
    requests.forEach((r) => {
      if (["aprovada", "em_atendimento", "parcialmente_atendida"].includes(r.status)) {
        r.items.forEach((item) => {
          pendingDeliveryUnits += Math.max(0, Number(item.quantity) - Number(item.receivedTotal || 0));
        });
      }
    });

    const criticalStock = stock.filter((s) => s.level !== "normal");

    return ok({
      council,
      requests,
      pendingRequestsCount: pendingRequests.length,
      pendingDeliveryUnits,
      stock,
      criticalStockCount: criticalStock.length,
      meetings,
      lookups: lookupsRes.data,
      canManage: can(actor, "council.manage"),
      canCreateRequest: can(actor, "request.create", id),
    });
  });

  return (
    <Screen result={result}>
      {({
        council,
        requests,
        pendingRequestsCount,
        pendingDeliveryUnits,
        stock,
        criticalStockCount,
        meetings,
        lookups,
        canManage,
        canCreateRequest,
      }) => (
        <div className="space-y-8">
          <PageHeader
            eyebrow="Visão 360° da Empresa"
            title={`${council.acronym} — ${council.name}`}
            description={council.institutionalInfo || "Empresa conveniada na plataforma de gestão de Warley."}
            actions={
              <div className="flex flex-wrap items-center gap-2">
                {council.whatsappE164 ? (
                  <a
                    href={whatsappHref(council.whatsappE164)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({ variant: "outline" })}
                  >
                    <MessageCircle className="mr-1.5 size-4 text-success-foreground" />
                    WhatsApp
                  </a>
                ) : null}
                <Link
                  href={`/meu-conselho?councilId=${council.id}`}
                  className={buttonVariants({ variant: "outline" })}
                >
                  <ExternalLink className="mr-1.5 size-4" />
                  Visualizar Painel do Cliente
                </Link>
                {canCreateRequest ? (
                  <Link href={`/solicitacoes/nova?councilId=${council.id}`} className={buttonVariants()}>
                    <Plus className="mr-1.5 size-4" />
                    Nova Solicitação
                  </Link>
                ) : null}
              </div>
            }
          />

          {/* KPIs da Empresa */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              href={`/solicitacoes?councilId=${council.id}`}
              icon={<ShoppingCart className="size-4" aria-hidden />}
              label="Solicitações Abertas"
              value={pendingRequestsCount}
              accent={pendingRequestsCount > 0}
              hint="Em análise ou atendimento"
            />
            <KpiCard
              icon={<Truck className="size-4" aria-hidden />}
              label="Entregas Pendentes"
              value={`${pendingDeliveryUnits} un`}
              accent={pendingDeliveryUnits > 0}
              hint="Unidades aguardando entrega"
            />
            <KpiCard
              href={`/estoque?councilId=${council.id}`}
              icon={<Package className="size-4" aria-hidden />}
              label="Itens Vinculados"
              value={stock.length}
              hint="No catálogo da empresa"
            />
            <KpiCard
              icon={<PackageX className="size-4" aria-hidden />}
              label="Estoque Crítico"
              value={criticalStockCount}
              accent={criticalStockCount > 0}
              hint={criticalStockCount > 0 ? "Requer reposição" : "Níveis regulares"}
            />
          </div>

          {/* Seção 1: Solicitações Recentes da Empresa */}
          <section aria-label="Solicitações da Empresa" className="space-y-3">
            <div className="flex items-center justify-between">
              <SectionLabel>Solicitações da Empresa</SectionLabel>
              {canCreateRequest ? (
                <Link href={`/solicitacoes/nova?councilId=${council.id}`} className="text-xs font-semibold text-primary hover:underline">
                  + Nova Solicitação
                </Link>
              ) : null}
            </div>
            <SimpleTable
              caption="Solicitações da empresa"
              rows={requests.map((r) => ({
                id: r.id,
                title: r.title,
                status: r.status,
                items: r.items.length,
                createdAt: r.createdAt.toISOString(),
                href: `/solicitacoes/${r.id}`,
              }))}
              columns={[
                { key: "title", header: "Solicitação", kind: "link", hrefKey: "href" },
                { key: "status", header: "Status", kind: "status", dictionary: "request" },
                { key: "items", header: "Qtd. Itens", kind: "number" },
                { key: "createdAt", header: "Criada em", kind: "datetime" },
              ]}
              emptyTitle="Nenhuma solicitação para esta empresa"
              emptyDescription="Crie uma nova solicitação para iniciar o pedido de materiais."
            />
          </section>

          {/* Seção 2: Estoque Atual Destinado à Empresa */}
          <section aria-label="Estoque da Empresa" className="space-y-3">
            <SectionLabel>Estoque Destinado à Empresa</SectionLabel>
            <SimpleTable
              caption="Estoque da empresa"
              rows={stock.map((s) => ({
                id: `${s.councilId}:${s.materialId}`,
                material: lookups.materialLabel[s.materialId] ?? "—",
                physical: s.physical,
                reserved: s.reserved,
                available: s.available,
                minimum: s.minimum,
                level: s.level,
              }))}
              columns={[
                { key: "material", header: "Material" },
                { key: "available", header: "Disponível", kind: "number" },
                { key: "physical", header: "Físico", kind: "number" },
                { key: "reserved", header: "Reservado", kind: "number" },
                { key: "minimum", header: "Mínimo", kind: "number" },
                { key: "level", header: "Situação", kind: "status", dictionary: "stock" },
              ]}
              emptyTitle="Nenhum saldo vinculado a esta empresa"
              emptyDescription="Lance uma movimentação de estoque para registrar materiais disponíveis nesta empresa."
            />
          </section>

          {/* Seção 3: Reuniões Agendadas */}
          {meetings.length > 0 ? (
            <section aria-label="Reuniões da Empresa" className="space-y-3">
              <SectionLabel>Reuniões com a Empresa</SectionLabel>
              <SimpleTable
                caption="Reuniões da empresa"
                rows={meetings.map((m) => ({
                  id: m.id,
                  title: m.title,
                  scheduledAt: m.scheduledAt.toISOString(),
                  status: m.status,
                  minutes: m.minutes?.text ? m.minutes.text.slice(0, 80) : "—",
                }))}
                columns={[
                  { key: "title", header: "Pauta / Assunto" },
                  { key: "scheduledAt", header: "Data e Hora", kind: "datetime" },
                  { key: "status", header: "Status", kind: "status", dictionary: "meeting" },
                  { key: "minutes", header: "Ata da Reunião" },
                ]}
              />
            </section>
          ) : null}

          {/* Seção 4: Edição Cadastral */}
          {canManage ? (
            <section aria-labelledby="editar-conselho" className="surface-card max-w-lg p-6">
              <h2 id="editar-conselho" className="mb-4 font-heading text-lg font-medium tracking-tight text-primary">
                Editar Dados da Empresa
              </h2>
              <EditCouncilForm council={council} />
            </section>
          ) : null}
        </div>
      )}
    </Screen>
  );
}

export default function CouncilPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<LoadingState />}>
      <CouncilContent params={params} />
    </Suspense>
  );
}
