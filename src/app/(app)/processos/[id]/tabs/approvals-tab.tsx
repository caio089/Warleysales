"use client";

import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import type { PurchaseRequestStatus } from "@/modules/purchases/domain/request-status";
import { formatCurrency } from "@/shared/lib/format";
import { RequestActions } from "@/app/(app)/solicitacoes/[id]/request-actions";
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
  items: { id: string; label: string; quantity: number; receivedTotal: number }[];
  canDecide: boolean;
  canCreate: boolean;
  canReceive: boolean;
}

interface ApprovalsTabProps {
  request: ApprovalsTabRequest | null;
}

/** Aba de aprovação da solicitação vinculada ao processo (visão Warley / Maria Luiza). */
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
  const pendingItems = request.items
    .filter((item) => item.quantity - item.receivedTotal > 0)
    .map((item) => ({
      id: item.id,
      label: item.label,
      pending: item.quantity - item.receivedTotal,
    }));

  return (
    <section aria-label="Aprovações" className="space-y-6">
      <div className="surface-card space-y-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-heading text-lg font-semibold text-primary">Solicitação para aprovação</h2>
              <StatusBadge label={status.label} tone={status.tone} />
            </div>
            <p className="text-sm text-muted-foreground">
              {request.councilLabel} · confira os itens e decida se a compra segue.
            </p>
          </div>
          <Link href={`/solicitacoes/${request.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            Abrir solicitação completa
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
            received: item.receivedTotal,
            pending: item.quantity - item.receivedTotal,
          }))}
          columns={[
            { key: "material", header: "Item" },
            { key: "quantity", header: "Solicitado", kind: "number" },
            { key: "received", header: "Recebido", kind: "number" },
            { key: "pending", header: "Pendente", kind: "number" },
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
        />
      </div>
    </section>
  );
}
