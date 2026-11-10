"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import {
  AlertCircle,
  PackagePlus,
  Plus,
  Trash2,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createMaterialOrderAction } from "@/modules/orders/actions";
import type { MaterialOrder } from "@/modules/orders/schemas";
import { toast } from "@/shared/ui/toast-store";

export interface AvailableStockItem {
  materialId: string;
  materialName: string;
  available: number;
  unit?: string;
}

export interface MaterialOrderDialogProps {
  councilId: string;
  availableStock: AvailableStockItem[];
  trigger?: ReactNode;
  onOrderCreated?: (order: MaterialOrder) => void;
}

export interface MaterialOrderFormProps {
  councilId: string;
  availableStock: AvailableStockItem[];
  onCancel?: () => void;
  onOrderCreated?: (order: MaterialOrder) => void;
}

interface OrderItemRow {
  rowId: string;
  materialId: string;
  quantity: number | "";
}

export function MaterialOrderForm({
  councilId,
  availableStock,
  onCancel,
  onOrderCreated,
}: MaterialOrderFormProps) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtra apenas itens com saldo liberado positivo
  const validStock = availableStock.filter((s) => s.available > 0);

  const initialRows: OrderItemRow[] = validStock.length > 0
    ? [{ rowId: "row-1", materialId: validStock[0]!.materialId, quantity: 1 }]
    : [];

  const [rows, setRows] = useState<OrderItemRow[]>(initialRows);

  function resetForm() {
    setNotes("");
    setRows(
      validStock.length > 0
        ? [{ rowId: "row-1", materialId: validStock[0]!.materialId, quantity: 1 }]
        : [],
    );
  }

  function addRow() {
    const selectedIds = new Set(rows.map((r) => r.materialId));
    const nextAvailable = validStock.find((s) => !selectedIds.has(s.materialId)) ?? validStock[0];
    if (!nextAvailable) return;

    setRows((prev) => [
      ...prev,
      {
        rowId: `row-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        materialId: nextAvailable.materialId,
        quantity: 1,
      },
    ]);
  }

  function removeRow(rowId: string) {
    setRows((prev) => prev.filter((r) => r.rowId !== rowId));
  }

  function updateRowMaterial(rowId: string, materialId: string) {
    setRows((prev) =>
      prev.map((r) => {
        if (r.rowId !== rowId) return r;
        const stock = validStock.find((s) => s.materialId === materialId);
        const maxAvail = stock ? stock.available : 1;
        const currentQty = typeof r.quantity === "number" ? r.quantity : 1;
        return {
          ...r,
          materialId,
          quantity: Math.min(Math.max(1, currentQty), maxAvail),
        };
      }),
    );
  }

  function updateRowQuantity(rowId: string, val: string) {
    const parsed = val === "" ? "" : parseInt(val, 10);
    setRows((prev) =>
      prev.map((r) => {
        if (r.rowId !== rowId) return r;
        return {
          ...r,
          quantity: isNaN(parsed as number) && parsed !== "" ? "" : parsed,
        };
      }),
    );
  }

  // Validação client-side
  const stockMap = new Map<string, AvailableStockItem>(validStock.map((s) => [s.materialId, s]));

  let hasValidationError = false;
  let validationMessage = "";

  if (rows.length === 0) {
    hasValidationError = true;
    validationMessage = "Adicione ao menos um item ao pedido.";
  } else {
    for (const r of rows) {
      if (!r.materialId) {
        hasValidationError = true;
        validationMessage = "Selecione o material de cada item.";
        break;
      }
      const stock = stockMap.get(r.materialId);
      if (!stock) {
        hasValidationError = true;
        validationMessage = "Material selecionado inválido ou sem saldo liberado.";
        break;
      }
      if (typeof r.quantity !== "number" || r.quantity <= 0) {
        hasValidationError = true;
        validationMessage = `Informe uma quantidade válida para ${stock.materialName}.`;
        break;
      }
      if (r.quantity > stock.available) {
        hasValidationError = true;
        validationMessage = `A quantidade de ${stock.materialName} (${r.quantity}) excede o saldo liberado (${stock.available}).`;
        break;
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (hasValidationError || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const itemsPayload = rows.map((r) => ({
        materialId: r.materialId,
        quantity: Number(r.quantity),
      }));

      const res = await createMaterialOrderAction({
        councilId,
        notes: notes.trim() ? notes.trim() : undefined,
        items: itemsPayload,
      });

      if (res.status === "error") {
        toast.error(res.message);
      } else if (res.status === "success") {
        toast.success(res.message || "Pedido de material registrado com sucesso!");
        if (res.data) {
          onOrderCreated?.(res.data);
        }
        resetForm();
        onCancel?.();
        router.refresh();
      }
    } catch {
      toast.error("Ocorreu um erro ao registrar o pedido. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (validStock.length === 0) {
    return (
      <div className="py-8 text-center space-y-3">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-warning/15 text-warning">
          <AlertCircle className="size-6" />
        </div>
        <h3 className="text-sm font-semibold text-primary">Nenhum saldo liberado disponível</h3>
        <p className="max-w-md mx-auto text-xs text-muted-foreground">
          Não há materiais com saldo físico liberado no catálogo deste órgão para solicitação neste momento. Aguarde a homologação das contratações ou novos recebimentos.
        </p>
        <div className="pt-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Entendido
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-y-auto mt-4 space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Itens do Pedido ({rows.length})
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addRow}
            className="h-7 gap-1 text-xs"
            disabled={rows.length >= validStock.length}
          >
            <Plus className="size-3" />
            Adicionar Item
          </Button>
        </div>

        <div className="space-y-2">
          {rows.map((row, index) => {
            const currentStock = stockMap.get(row.materialId);
            const isOverLimit =
              typeof row.quantity === "number" &&
              currentStock &&
              row.quantity > currentStock.available;

            return (
              <div
                key={row.rowId}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2.5 rounded-xl border border-border/80 bg-secondary/30"
              >
                <div className="flex-1 w-full sm:w-auto">
                  <label htmlFor={`material-${row.rowId}`} className="sr-only">
                    Material item {index + 1}
                  </label>
                  <select
                    id={`material-${row.rowId}`}
                    value={row.materialId}
                    onChange={(e) => updateRowMaterial(row.rowId, e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {validStock.map((s) => (
                      <option key={s.materialId} value={s.materialId}>
                        {s.materialName} (Saldo: {s.available} {s.unit || "un"})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-full sm:w-36 flex items-center gap-2">
                  <label htmlFor={`qty-${row.rowId}`} className="sr-only">
                    Quantidade
                  </label>
                  <Input
                    id={`qty-${row.rowId}`}
                    type="number"
                    min="1"
                    max={currentStock?.available ?? 99999}
                    value={row.quantity}
                    onChange={(e) => updateRowQuantity(row.rowId, e.target.value)}
                    placeholder="Qtd"
                    className={`h-9 text-xs tabular-nums ${isOverLimit ? "border-destructive text-destructive" : ""}`}
                  />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    / {currentStock?.available ?? 0}
                  </span>
                </div>

                {rows.length > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeRow(row.rowId)}
                    className="text-muted-foreground hover:text-destructive shrink-0"
                    title="Remover este item"
                  >
                    <Trash2 className="size-4" />
                    <span className="sr-only">Remover</span>
                  </Button>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* Observações */}
      <div className="space-y-1.5">
        <label htmlFor="order-notes" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Observações ou Finalidade (Opcional)
        </label>
        <textarea
          id="order-notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ex: Atendimento às ações de fiscalização externa de rotina..."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      {/* Feedback de Validação */}
      {hasValidationError && validationMessage ? (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 text-destructive text-xs">
          <AlertCircle className="size-4 shrink-0" />
          <span>{validationMessage}</span>
        </div>
      ) : null}

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/70 mt-auto">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={hasValidationError || isSubmitting}
          className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <PackagePlus className="size-4" />
          {isSubmitting ? "Enviando Pedido…" : "Enviar Pedido para Warley"}
        </Button>
      </div>
    </form>
  );
}

export function MaterialOrderDialog({
  councilId,
  availableStock,
  trigger,
  onOrderCreated,
}: MaterialOrderDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger render={<span className="inline-flex" />}>
        {trigger ?? (
          <Button className="gap-2 bg-primary font-medium text-primary-foreground shadow-xs hover:bg-primary/90">
            <PackagePlus className="size-4" aria-hidden />
            <span>Novo Pedido de Material</span>
          </Button>
        )}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-primary/25 backdrop-blur-[2px] transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 flex max-h-[90vh] w-[min(44rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-border/80 bg-popover p-6 text-popover-foreground shadow-[0_24px_60px_-24px_oklch(0.23_0.05_250_/_0.45)] outline-none">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-border/70 pb-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-highlight/15 text-highlight">
                <PackagePlus className="size-5" aria-hidden />
              </span>
              <div>
                <Dialog.Title className="font-heading text-lg font-semibold tracking-tight text-primary">
                  Novo Pedido de Material
                </Dialog.Title>
                <Dialog.Description className="text-xs text-muted-foreground">
                  Solicite materiais liberados no estoque. A reserva será criada imediatamente e o despacho depende da homologação de Warley.
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

          <MaterialOrderForm
            councilId={councilId}
            availableStock={availableStock}
            onCancel={() => setOpen(false)}
            onOrderCreated={(order) => {
              onOrderCreated?.(order);
              setOpen(false);
            }}
          />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
