"use server";

import { revalidatePath } from "next/cache";
import { runAction } from "@/server/action-runner";
import type { ActionState } from "@/shared/ui/forms/action-state";
import type { MaterialOrder } from "./schemas";

function revalidateOrderPaths() {
  revalidatePath("/meu-conselho");
  revalidatePath("/dashboard");
  revalidatePath("/estoque");
}

function extractCreatePayload(
  inputOrPrevious: unknown,
  maybeFormData?: FormData,
): { councilId: string; notes?: string | null; items: Array<{ materialId: string; quantity: number }> } {
  const fd =
    maybeFormData instanceof FormData
      ? maybeFormData
      : inputOrPrevious instanceof FormData
        ? inputOrPrevious
        : null;

  if (fd) {
    const councilId = String(fd.get("councilId") ?? "");
    const notesRaw = fd.get("notes");
    const notes = notesRaw && String(notesRaw).trim() !== "" ? String(notesRaw).trim() : undefined;

    let items: Array<{ materialId: string; quantity: number }> = [];
    const itemsJson = fd.get("items");

    if (typeof itemsJson === "string" && itemsJson.trim().startsWith("[")) {
      try {
        items = JSON.parse(itemsJson);
      } catch {
        items = [];
      }
    } else {
      const materialIds = fd.getAll("materialId").map(String);
      const quantities = fd.getAll("quantity").map((q) => Number(String(q).replace(",", ".")));
      items = materialIds.map((materialId, idx) => ({
        materialId,
        quantity: quantities[idx] ?? 0,
      })).filter((i) => Boolean(i.materialId));
    }

    return { councilId, notes, items };
  }

  if (inputOrPrevious && typeof inputOrPrevious === "object") {
    const raw = inputOrPrevious as {
      councilId?: unknown;
      notes?: unknown;
      items?: unknown;
    };
    return {
      councilId: String(raw.councilId ?? ""),
      notes: raw.notes ? String(raw.notes) : undefined,
      items: Array.isArray(raw.items)
        ? raw.items.map((it: { materialId?: unknown; quantity?: unknown }) => ({
            materialId: String(it.materialId ?? ""),
            quantity: Number(it.quantity ?? 0),
          }))
        : [],
    };
  }

  return { councilId: "", items: [] };
}

function extractOrderId(arg1: unknown, arg2?: unknown): string {
  if (typeof arg1 === "string" && arg1.trim() !== "") return arg1.trim();
  const fd = arg2 instanceof FormData ? arg2 : arg1 instanceof FormData ? arg1 : null;
  if (fd) return String(fd.get("orderId") ?? "").trim();
  if (arg1 && typeof arg1 === "object" && "orderId" in arg1) {
    return String((arg1 as { orderId: unknown }).orderId ?? "").trim();
  }
  return "";
}

function extractRejectPayload(arg1: unknown, arg2?: unknown): { orderId: string; reason: string } {
  if (typeof arg1 === "string") {
    return {
      orderId: arg1.trim(),
      reason: typeof arg2 === "string" ? arg2.trim() : "",
    };
  }
  const fd = arg2 instanceof FormData ? arg2 : arg1 instanceof FormData ? arg1 : null;
  if (fd) {
    return {
      orderId: String(fd.get("orderId") ?? "").trim(),
      reason: String(fd.get("reason") ?? "").trim(),
    };
  }
  if (arg1 && typeof arg1 === "object") {
    const obj = arg1 as { orderId?: unknown; reason?: unknown };
    return {
      orderId: String(obj.orderId ?? "").trim(),
      reason: String(obj.reason ?? "").trim(),
    };
  }
  return { orderId: "", reason: "" };
}

export async function createMaterialOrderAction(
  inputOrPrevious: unknown,
  maybeFormData?: FormData,
): Promise<ActionState & { data?: MaterialOrder }> {
  const payload = extractCreatePayload(inputOrPrevious, maybeFormData);

  const result = await runAction(
    ({ services, actor }) => services.orders.create(actor, payload),
    "Pedido de material criado com sucesso e enviado para Warley.",
  );

  if (result.status === "success") {
    revalidateOrderPaths();
  }

  return result;
}

export async function approveMaterialOrderAction(
  orderIdOrPrevious: unknown,
  maybeFormData?: FormData,
): Promise<ActionState & { data?: MaterialOrder }> {
  const orderId = extractOrderId(orderIdOrPrevious, maybeFormData);

  const result = await runAction(
    ({ services, actor }) => services.orders.approve(actor, orderId),
    "Pedido aprovado e estoque despachado com sucesso.",
  );

  if (result.status === "success") {
    revalidateOrderPaths();
  }

  return result;
}

export async function rejectMaterialOrderAction(
  orderIdOrPrevious: unknown,
  reasonOrMaybeFormData?: unknown,
): Promise<ActionState & { data?: MaterialOrder }> {
  const { orderId, reason } = extractRejectPayload(orderIdOrPrevious, reasonOrMaybeFormData);

  const result = await runAction(
    ({ services, actor }) => services.orders.reject(actor, orderId, reason),
    "Pedido recusado com sucesso.",
  );

  if (result.status === "success") {
    revalidateOrderPaths();
  }

  return result;
}

export async function cancelMaterialOrderAction(
  orderIdOrPrevious: unknown,
  maybeFormData?: FormData,
): Promise<ActionState & { data?: MaterialOrder }> {
  const orderId = extractOrderId(orderIdOrPrevious, maybeFormData);

  const result = await runAction(
    ({ services, actor }) => services.orders.cancel(actor, orderId),
    "Pedido cancelado com sucesso.",
  );

  if (result.status === "success") {
    revalidateOrderPaths();
  }

  return result;
}
