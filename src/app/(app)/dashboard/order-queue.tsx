"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import {
  AlertCircle,
  CheckCircle2,
  PackageCheck,
  XCircle,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  approveMaterialOrderAction,
  rejectMaterialOrderAction,
} from "@/modules/orders/actions";
import { formatDateTimeFortaleza } from "@/shared/lib/time";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { toast } from "@/shared/ui/toast-store";

export interface PendingOrderItem {
  id: string;
  number: string;
  councilId: string;
  councilName: string;
  requestedBy: string;
  notes?: string | null;
  createdAt: Date | string;
  items: Array<{
    materialId: string;
    materialName: string;
    quantity: number;
    unit?: string;
  }>;
}

export interface OrderQueueProps {
  items: PendingOrderItem[];
}

export function OrderQueue({ items }: OrderQueueProps) {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectingOrder, setRejectingOrder] = useState<PendingOrderItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  if (items.length === 0) {
    return null;
  }

  async function handleApprove(order: PendingOrderItem) {
    setProcessingId(order.id);
    try {
      const res = await approveMaterialOrderAction(order.id);
      if (res.status === "error") {
        toast.error(res.message);
      } else if (res.status === "success") {
        toast.success(res.message || `Pedido ${order.number} aprovado e despachado.`);
        router.refresh();
      }
    } catch {
      toast.error("Erro ao aprovar o pedido de material.");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleConfirmReject() {
    if (!rejectingOrder) return;
    if (rejectionReason.trim().length < 5) {
      toast.error("O motivo da recusa deve ter ao menos 5 caracteres.");
      return;
    }

    setIsRejecting(true);
    try {
      const res = await rejectMaterialOrderAction(rejectingOrder.id, rejectionReason.trim());
      if (res.status === "error") {
        toast.error(res.message);
      } else if (res.status === "success") {
        toast.success(res.message || `Pedido ${rejectingOrder.number} recusado.`);
        setRejectingOrder(null);
        setRejectionReason("");
        router.refresh();
      }
    } catch {
      toast.error("Erro ao recusar o pedido de material.");
    } finally {
      setIsRejecting(false);
    }
  }

  return (
    <>
      <section
        aria-label="Fila de Expedição de Pedidos de Materiais"
        className="surface-card relative overflow-hidden rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-card to-card p-5 sm:p-6 shadow-sm"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary">
              <PackageCheck className="size-5" aria-hidden />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-lg font-semibold tracking-tight text-primary">
                  Fila de Expedição — Homologação de Pedidos de Materiais
                </h2>
                <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
                  {items.length} pendente{items.length > 1 ? "s" : ""}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Pedidos de materiais realizados pelos órgãos aguardando homologação e despacho de estoque físico de Warley.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <caption className="sr-only">Pedidos de materiais aguardando veredito de Warley</caption>
            <thead>
              <tr className="border-b border-border/80 text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">
                <th scope="col" className="pb-3 pr-4">Órgão / Empresa</th>
                <th scope="col" className="pb-3 pr-4">Nº Pedido</th>
                <th scope="col" className="pb-3 pr-4">Data</th>
                <th scope="col" className="pb-3 pr-4">Itens Solicitados</th>
                <th scope="col" className="pb-3 pr-4">Observações</th>
                <th scope="col" className="pb-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {items.map((item) => {
                const isProcessing = processingId === item.id;
                const itemsSummary = item.items
                  .map((i) => `${i.quantity}x ${i.materialName}`)
                  .join(", ");

                return (
                  <tr key={item.id} className="transition-colors hover:bg-secondary/30">
                    <td className="py-3.5 pr-4 font-semibold text-primary">
                      <span className="inline-block rounded-md bg-secondary px-2 py-1 text-xs">
                        {item.councilName}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 font-medium text-primary">
                      <span className="font-semibold">{item.number}</span>
                    </td>
                    <td className="py-3.5 pr-4 text-muted-foreground whitespace-nowrap">
                      {formatDateTimeFortaleza(item.createdAt)}
                    </td>
                    <td className="py-3.5 pr-4 text-primary font-medium max-w-[260px] truncate" title={itemsSummary}>
                      {itemsSummary}
                    </td>
                    <td className="py-3.5 pr-4 text-muted-foreground max-w-[200px] truncate" title={item.notes ?? ""}>
                      {item.notes || "—"}
                    </td>
                    <td className="py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-2">
                        <ConfirmDialog
                          trigger={
                            <Button
                              size="sm"
                              disabled={isProcessing}
                              className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                            >
                              <CheckCircle2 className="size-3.5" />
                              <span>{isProcessing ? "Aprovando…" : "Aprovar & Despachar"}</span>
                            </Button>
                          }
                          title={`Aprovar e Despachar Pedido ${item.number}`}
                          description={`Confirma a aprovação do pedido ${item.number} para ${item.councilName}? O estoque reservado (${itemsSummary}) será baixado fisicamente no ledger contábil.`}
                          confirmLabel="Aprovar & Despachar"
                          onConfirm={() => handleApprove(item)}
                        />

                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isProcessing}
                          onClick={() => {
                            setRejectingOrder(item);
                            setRejectionReason("");
                          }}
                          className="h-8 gap-1 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <XCircle className="size-3.5" />
                          <span>Recusar</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal de Justificativa de Recusa */}
      <Dialog.Root open={Boolean(rejectingOrder)} onOpenChange={(open) => !open && setRejectingOrder(null)}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-primary/25 backdrop-blur-[2px] transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
          <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 flex max-h-[85vh] w-[min(32rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-border/80 bg-popover p-6 text-popover-foreground shadow-[0_24px_60px_-24px_oklch(0.23_0.05_250_/_0.45)] outline-none">
            <div className="flex items-start justify-between gap-4 border-b border-border/70 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-destructive/15 text-destructive">
                  <XCircle className="size-5" aria-hidden />
                </span>
                <div>
                  <Dialog.Title className="font-heading text-base font-semibold tracking-tight text-primary">
                    Recusar Pedido {rejectingOrder?.number}
                  </Dialog.Title>
                  <Dialog.Description className="text-xs text-muted-foreground">
                    {rejectingOrder?.councilName} — A reserva de estoque será estornada para disponível.
                  </Dialog.Description>
                </div>
              </div>
              <Dialog.Close
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="rounded-lg text-muted-foreground hover:text-foreground"
                  />
                }
              >
                <XIcon className="size-4" />
                <span className="sr-only">Fechar</span>
              </Dialog.Close>
            </div>

            <div className="mt-4 space-y-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="rejection-reason"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Motivo da Recusa (Obrigatório, mín. 5 caracteres)
                </label>
                <textarea
                  id="rejection-reason"
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Ex: Cota mensal do departamento atingida. Favor reagendar para o próximo mês."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              {rejectionReason.trim().length > 0 && rejectionReason.trim().length < 5 ? (
                <div className="flex items-center gap-1.5 text-xs text-destructive">
                  <AlertCircle className="size-3.5" />
                  <span>Informe ao menos 5 caracteres.</span>
                </div>
              ) : null}
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-border/70 pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRejectingOrder(null)}
                disabled={isRejecting}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleConfirmReject}
                disabled={isRejecting || rejectionReason.trim().length < 5}
              >
                {isRejecting ? "Recusando…" : "Confirmar Recusa"}
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
