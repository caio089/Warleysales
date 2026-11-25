"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ClipboardCheck } from "lucide-react";
import { requestStepFormAction } from "@/modules/purchases/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatCurrency } from "@/shared/lib/format";
import { formatDateTimeFortaleza } from "@/shared/lib/time";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { TextAreaField } from "@/shared/ui/forms/fields";
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
  /** Mantém a seção visível mesmo sem pendências (ex.: página de Processos do Warley). */
  showWhenEmpty?: boolean;
  /** Aberta por padrão. Em Processos fica fechada até o Warley abrir. */
  defaultOpen?: boolean;
}

const PAGE_SIZE = 20;

/** Fila recolhível: resumo ao clicar, 20 por vez, aprovar ou não na hora. */
export function ApprovalQueue({
  items,
  showWhenEmpty = false,
  defaultOpen = false,
}: ApprovalQueueProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [decliningId, setDecliningId] = useState<string | null>(null);

  const visibleItems = useMemo(() => items.slice(0, visibleCount), [items, visibleCount]);
  const hasMore = visibleCount < items.length;
  const selected = selectedId ? items.find((item) => item.id === selectedId) ?? null : null;

  useEffect(() => {
    if (!defaultOpen) return;
    setOpen(true);
    const node = document.getElementById("aprovacoes");
    node?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [defaultOpen]);

  if (items.length === 0 && !showWhenEmpty) return null;

  return (
    <section
      id="aprovacoes"
      aria-label="Fila de aprovações de solicitações"
      className="surface-card scroll-mt-24 overflow-hidden rounded-2xl border-2 border-primary/25 bg-gradient-to-br from-primary/5 via-card to-card shadow-sm"
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls="aprovacoes-painel"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left sm:px-6"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
            <ClipboardCheck className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-heading text-lg font-semibold tracking-tight text-primary">Aprovações</h2>
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                {items.length} pendente{items.length === 1 ? "" : "s"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {open
                ? "Clique em uma solicitação para ver o resumo e decidir."
                : "Toque para abrir a fila. Mostra 20 por vez."}
            </p>
          </div>
        </div>
        <ChevronDown
          className={cn("size-5 shrink-0 text-primary transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open ? (
        <div id="aprovacoes-painel" className="border-t border-border/70 px-5 pb-5 pt-4 sm:px-6">
          {items.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border/80 bg-card/60 px-4 py-3 text-sm text-muted-foreground">
              Nenhuma solicitação aguardando aprovação no momento.
            </p>
          ) : (
            <div className="space-y-3">
              <ul className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/70 bg-card/70">
                {visibleItems.map((item) => {
                  const status = presentationOf(REQUEST_STATUS, item.status);
                  const isSelected = selectedId === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedId(isSelected ? null : item.id);
                          setDecliningId(null);
                        }}
                        className={cn(
                          "flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors sm:flex-row sm:items-center sm:justify-between",
                          isSelected ? "bg-primary/8" : "hover:bg-muted/40",
                        )}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.councilName} · {item.itemsCount} item{item.itemsCount === 1 ? "" : "s"} ·{" "}
                            {item.estimatedValue == null ? "valor a definir" : formatCurrency(item.estimatedValue)}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <StatusBadge label={status.label} tone={status.tone} />
                          <span className="text-[0.7rem] text-muted-foreground">
                            {formatDateTimeFortaleza(item.createdAt)}
                          </span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>

              {hasMore ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                >
                  Ver mais {Math.min(PAGE_SIZE, items.length - visibleCount)}
                </Button>
              ) : null}

              {selected ? (
                <div className="space-y-4 rounded-2xl border border-primary/20 bg-card p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Resumo</p>
                      <h3 className="font-heading text-base font-semibold text-primary">{selected.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selected.councilName} · {selected.itemsCount} item{selected.itemsCount === 1 ? "" : "s"} ·{" "}
                        {selected.estimatedValue == null ? "valor a definir" : formatCurrency(selected.estimatedValue)}
                      </p>
                    </div>
                    {selected.processId ? (
                      <Link
                        href={`/processos/${selected.processId}?aba=aprovacoes`}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                      >
                        Abrir no processo
                      </Link>
                    ) : (
                      <Link
                        href={`/solicitacoes/${selected.id}`}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                      >
                        Abrir solicitação
                      </Link>
                    )}
                  </div>

                  {decliningId === selected.id ? (
                    <div className="space-y-3 rounded-xl border border-border/80 bg-secondary/40 p-4">
                      <p className="text-sm text-muted-foreground">Informe o motivo da recusa.</p>
                      <ActionForm
                        action={requestStepFormAction}
                        submitLabel="Recusar"
                        pendingLabel="Recusando…"
                        submitVariant="destructive"
                        hiddenFields={{ requestId: selected.id, step: "reject" }}
                        onSuccess={() => {
                          setSelectedId(null);
                          setDecliningId(null);
                        }}
                      >
                        {(errors) => <TextAreaField name="note" label="Motivo" required errors={errors.note} />}
                      </ActionForm>
                      <button
                        type="button"
                        className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                        onClick={() => setDecliningId(null)}
                      >
                        Voltar
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-3">
                      <ActionForm
                        action={requestStepFormAction}
                        submitLabel="Aprovar"
                        pendingLabel="Aprovando…"
                        submitClassName="h-11 px-6"
                        hiddenFields={{ requestId: selected.id, step: "approve" }}
                        onSuccess={() => setSelectedId(null)}
                      >
                        {() => null}
                      </ActionForm>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11"
                        onClick={() => setDecliningId(selected.id)}
                      >
                        Não
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Ao aprovar, o processo libera documentação e o fluxo de estoque para seguir.
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
