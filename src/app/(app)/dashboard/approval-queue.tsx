"use client";

import Link from "next/link";
import { ArrowRight, ClipboardCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { formatCurrency } from "@/shared/lib/format";
import { formatDateTimeFortaleza } from "@/shared/lib/time";
import { StatusBadge } from "@/shared/ui/status-badge";
import { REQUEST_STATUS, presentationOf } from "@/shared/ui/status-presentation";
import { cn } from "@/lib/utils";

export interface PendingApprovalItem {
  id: string;
  title: string;
  councilName: string;
  status: string;
  processId: string | null;
  estimatedValue: number | null;
  itemsCount: number;
  createdAt: string;
}

interface ApprovalQueueProps {
  items: PendingApprovalItem[];
}

/** Visão geral de solicitações aguardando decisão (Warley / Maria Luiza). */
export function ApprovalQueue({ items }: ApprovalQueueProps) {
  if (items.length === 0) return null;

  return (
    <section
      aria-label="Fila de aprovações de solicitações"
      className="surface-card relative overflow-hidden rounded-2xl border-2 border-primary/25 bg-gradient-to-br from-primary/5 via-card to-card p-5 sm:p-6 shadow-sm"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary">
            <ClipboardCheck className="size-5" aria-hidden />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-heading text-lg font-semibold tracking-tight text-primary">
                Aprovações de solicitações
              </h2>
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                {items.length} pendente{items.length > 1 ? "s" : ""}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Pedidos dos órgãos prontos para análise e aprovação antes de seguir o processo.
            </p>
          </div>
        </div>
        <Link href="/solicitacoes" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1")}>
          Ver todas <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <caption className="sr-only">Solicitações aguardando aprovação</caption>
          <thead>
            <tr className="border-b border-border/80 text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">
              <th scope="col" className="pb-3 pr-4">Órgão</th>
              <th scope="col" className="pb-3 pr-4">Solicitação</th>
              <th scope="col" className="pb-3 pr-4">Status</th>
              <th scope="col" className="pb-3 pr-4">Itens</th>
              <th scope="col" className="pb-3 pr-4">Valor estimado</th>
              <th scope="col" className="pb-3 pr-4">Quando</th>
              <th scope="col" className="pb-3">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {items.map((item) => {
              const status = presentationOf(REQUEST_STATUS, item.status);
              const href = item.processId
                ? `/processos/${item.processId}?aba=aprovacoes`
                : `/solicitacoes/${item.id}`;
              return (
                <tr key={item.id} className="align-top">
                  <td className="py-3 pr-4 font-medium text-foreground">{item.councilName}</td>
                  <td className="py-3 pr-4">
                    <p className="max-w-xs font-medium text-foreground">{item.title}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge label={status.label} tone={status.tone} />
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">{item.itemsCount}</td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {item.estimatedValue == null ? "—" : formatCurrency(item.estimatedValue)}
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">{formatDateTimeFortaleza(item.createdAt)}</td>
                  <td className="py-3">
                    <Link href={href} className={cn(buttonVariants({ size: "sm" }), "gap-1")}>
                      Analisar <ArrowRight className="size-3.5" aria-hidden />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
