"use client";

import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import type { PurchaseRequestStatus } from "@/modules/purchases/domain/request-status";
import { formatCurrency } from "@/shared/lib/format";
import { formatDateTimeFortaleza } from "@/shared/lib/time";
import { RequestActions } from "@/app/(app)/solicitacoes/[id]/request-actions";
import { ActivityTimeline } from "@/shared/ui/activity-timeline";
import { StatusBadge } from "@/shared/ui/status-badge";
import { REQUEST_STATUS, presentationOf } from "@/shared/ui/status-presentation";
import { SimpleTable } from "@/shared/ui/simple-table";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ApprovalsTabRequest {
  id: string;
  title: string;
  status: PurchaseRequestStatus;
  councilLabel: string;
  estimatedValue: number | null;
  createdAt?: string;
  events?: { to: string; at: string; note?: string | null }[];
  items: { id: string; label: string; quantity: number; receivedTotal: number }[];
  canDecide: boolean;
  canCreate: boolean;
  canReceive: boolean;
}

interface ApprovalsTabProps {
  request: ApprovalsTabRequest | null;
}

/** Aba fechada por padrão na barra; ao abrir, resumo, decisão e histórico com data/hora. */
export function ApprovalsTab({ request }: ApprovalsTabProps) {

  if (!request) {
    return (
      <section aria-label="Aprovações" className="surface-card space-y-3 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-muted text-muted-foreground">
            <ClipboardCheck className="size-5" aria-hidden />
          </span>
          <div>
            <h2 className="font-heading text-lg font-semibold text-primary">Aprovações</h2>
            <p className="text-sm text-muted-foreground">
              Este processo ainda não tem solicitação vinculada para decidir.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const status = presentationOf(REQUEST_STATUS, request.status);
  const pendingDecision = ["enviada", "em_analise"].includes(request.status);
  const pendingItems = request.items
    .filter((item) => item.quantity - item.receivedTotal > 0)
    .map((item) => ({
      id: item.id,
      label: item.label,
      pending: item.quantity - item.receivedTotal,
    }));

  const REQUEST_EVENT_TITLE: Record<string, string> = {
    rascunho: "Solicitação criada (rascunho)",
    enviada: "Solicitação enviada para aprovação",
    em_analise: "Solicitação em análise",
    aguardando_correcao: "Correção solicitada",
    aprovada: "Solicitação aprovada",
    rejeitada: "Solicitação rejeitada",
    cancelada: "Solicitação cancelada",
    em_atendimento: "Recebimento iniciado",
    parcialmente_atendida: "Recebimento parcial",
    atendida: "Solicitação atendida",
  };
  const history = (request.events ?? []).map((event, index) => ({
    id: `req-${index}`,
    title: REQUEST_EVENT_TITLE[event.to] ?? presentationOf(REQUEST_STATUS, event.to).label,
    description: event.note?.trim() || undefined,
    occurredAt: event.at,
  }));

  return (
    <section aria-label="Aprovações" className="space-y-6">
      <div className="surface-card space-y-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-heading text-lg font-semibold text-primary">Resumo da solicitação</h2>
              <StatusBadge label={status.label} tone={status.tone} />
            </div>
            <p className="text-sm text-muted-foreground">
              {request.councilLabel} · {pendingDecision ? "decida se a compra segue" : "histórico da decisão"}
              {request.createdAt ? ` · criada em ${formatDateTimeFortaleza(request.createdAt)}` : null}
            </p>
          </div>
          <Link href={`/solicitacoes/${request.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            Detalhes completos
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border/70 bg-muted/20 px-3.5 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Objeto</p>
            <p className="mt-0.5 text-sm font-medium text-foreground">{request.title}</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-muted/20 px-3.5 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Valor estimado</p>
            <p className="mt-0.5 text-sm font-medium text-foreground">
              {request.estimatedValue == null ? "A definir" : formatCurrency(request.estimatedValue)}
            </p>
          </div>
        </div>

        <SimpleTable
          caption="Itens da solicitação"
          rows={request.items.map((item) => ({
            id: item.id,
            material: item.label,
            quantity: item.quantity,
          }))}
          columns={[
            { key: "material", header: "Item" },
            { key: "quantity", header: "Qtd", kind: "number" },
          ]}
        />
      </div>

      <div className="surface-card p-5 sm:p-6">
        <RequestActions
          requestId={request.id}
          status={request.status}
          canDecide={request.canDecide}
          canCreate={request.canCreate}
          canReceive={request.canReceive}
          pendingItems={pendingItems}
          summaryOnly
        />
      </div>

      <div className="surface-card space-y-3 p-5 sm:p-6">
        <h3 className="font-heading text-base font-semibold text-primary">Histórico da solicitação</h3>
        <p className="text-xs text-muted-foreground">Cada mudança de status com data e horário.</p>
        <ActivityTimeline
          entries={history}
          emptyLabel="Nenhum evento da solicitação ainda."
        />
      </div>
    </section>
  );
}
