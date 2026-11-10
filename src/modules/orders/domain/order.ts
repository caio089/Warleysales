import { roundQuantity } from "@/shared/lib/decimal";
import { fail, ok, type Result } from "@/shared/lib/result";
import { checkTransition, type TransitionMap } from "@/shared/lib/state-machine";
import { availableOf, type StockBalance } from "@/modules/inventory/domain/stock";
import type {
  MaterialOrder,
  MaterialOrderItem,
  MaterialOrderStatus,
} from "../schemas";

export type { MaterialOrder, MaterialOrderItem, MaterialOrderStatus };

export const MATERIAL_ORDER_TRANSITIONS: TransitionMap<MaterialOrderStatus> = {
  pendente: ["aprovado", "rejeitado", "cancelado"],
  aprovado: [],
  rejeitado: [],
  cancelado: [],
};

export const changeMaterialOrderStatus = (from: MaterialOrderStatus, to: MaterialOrderStatus) =>
  checkTransition(MATERIAL_ORDER_TRANSITIONS, from, to, "pedido");

export interface CreateOrderItemDomainInput {
  id?: string;
  materialId: string;
  quantity: number;
  availableStock?: number | StockBalance;
}

export interface CreateMaterialOrderDomainInput {
  id?: string;
  number?: string;
  councilId: string;
  requestedBy: string;
  notes?: string | null;
  items: CreateOrderItemDomainInput[];
  now?: Date;
}

export type StockBalanceMap =
  | Record<string, StockBalance | number | undefined>
  | Map<string, StockBalance | number | undefined>;

/**
 * Criação pura de pedido de material com validação de quantidades positivas,
 * presença de itens e checagem de saldo liberado/disponível (R11/R12).
 */
export function createMaterialOrder(
  input: CreateMaterialOrderDomainInput,
  balances?: StockBalanceMap,
): Result<MaterialOrder> {
  if (!input.councilId || !input.councilId.trim()) {
    return fail("VALIDATION", "Conselho é obrigatório.");
  }
  if (!input.requestedBy || !input.requestedBy.trim()) {
    return fail("VALIDATION", "Solicitante é obrigatório.");
  }
  if (!input.items || input.items.length === 0) {
    return fail("VALIDATION", "O pedido deve conter ao menos um item.");
  }

  const orderId = input.id ?? crypto.randomUUID();
  const orderNumber = input.number ?? `PED-${Date.now()}`;
  const now = input.now ?? new Date();

  const mappedItems: MaterialOrderItem[] = [];

  for (const item of input.items) {
    if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
      return fail("VALIDATION", "A quantidade do item deve ser maior que zero.");
    }

    const roundedQty = roundQuantity(item.quantity);

    // Validação de saldo disponível
    let available: number | undefined;
    if (item.availableStock !== undefined) {
      available = typeof item.availableStock === "number"
        ? item.availableStock
        : availableOf(item.availableStock);
    } else if (balances) {
      const b = balances instanceof Map ? balances.get(item.materialId) : balances[item.materialId];
      if (b !== undefined) {
        available = typeof b === "number" ? b : availableOf(b);
      }
    }

    if (available !== undefined && roundedQty > available) {
      return fail(
        "INSUFFICIENT_BALANCE",
        `Saldo disponível insuficiente para o material. Solicitado: ${roundedQty}, disponível: ${available}.`,
      );
    }

    mappedItems.push({
      id: item.id ?? crypto.randomUUID(),
      orderId,
      materialId: item.materialId,
      quantity: roundedQty,
    });
  }

  return ok({
    id: orderId,
    number: orderNumber,
    councilId: input.councilId.trim(),
    status: "pendente",
    requestedBy: input.requestedBy.trim(),
    notes: input.notes?.trim() || null,
    reviewedBy: null,
    reviewedAt: null,
    rejectionReason: null,
    items: mappedItems,
    createdAt: now,
    updatedAt: now,
  });
}

/**
 * Homologação/aprovação do pedido (exclusivo de Warley/CentralAdmin).
 * Valida transição a partir de pendente e registra revisor e data.
 */
export function approveMaterialOrder(
  order: MaterialOrder,
  reviewerId: string,
  reviewedAt?: Date,
): Result<MaterialOrder> {
  const transition = changeMaterialOrderStatus(order.status, "aprovado");
  if (!transition.ok) return transition;

  if (!reviewerId || !reviewerId.trim()) {
    return fail("VALIDATION", "Identificador do revisor é obrigatório.");
  }

  const at = reviewedAt ?? new Date();

  return ok({
    ...order,
    status: "aprovado",
    reviewedBy: reviewerId.trim(),
    reviewedAt: at,
    rejectionReason: null,
    updatedAt: at,
  });
}

/**
 * Rejeição do pedido por Warley.
 * Valida transição e exige motivo formal da recusa.
 */
export function rejectMaterialOrder(
  order: MaterialOrder,
  reviewerId: string,
  reason: string,
  reviewedAt?: Date,
): Result<MaterialOrder> {
  const transition = changeMaterialOrderStatus(order.status, "rejeitado");
  if (!transition.ok) return transition;

  if (!reviewerId || !reviewerId.trim()) {
    return fail("VALIDATION", "Identificador do revisor é obrigatório.");
  }
  if (!reason || !reason.trim()) {
    return fail("VALIDATION", "Motivo da recusa é obrigatório.");
  }

  const at = reviewedAt ?? new Date();

  return ok({
    ...order,
    status: "rejeitado",
    reviewedBy: reviewerId.trim(),
    rejectionReason: reason.trim(),
    reviewedAt: at,
    updatedAt: at,
  });
}

/**
 * Cancelamento do pedido pelo conselho solicitante (apenas enquanto pendente).
 */
export function cancelMaterialOrder(
  order: MaterialOrder,
  canceledAtOrOptions?: Date | { canceledAt?: Date },
): Result<MaterialOrder> {
  const transition = changeMaterialOrderStatus(order.status, "cancelado");
  if (!transition.ok) return transition;

  const at =
    canceledAtOrOptions instanceof Date
      ? canceledAtOrOptions
      : canceledAtOrOptions?.canceledAt ?? new Date();

  return ok({
    ...order,
    status: "cancelado",
    updatedAt: at,
  });
}

// Aliases curtos
export const createOrder = createMaterialOrder;
export const approveOrder = approveMaterialOrder;
export const rejectOrder = rejectMaterialOrder;
export const cancelOrder = cancelMaterialOrder;
export const changeOrderStatus = changeMaterialOrderStatus;
