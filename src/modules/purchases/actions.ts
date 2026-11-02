"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { runAction } from "@/server/action-runner";
import type { ActionState } from "@/shared/ui/forms/action-state";

/** Itens vêm como campos repetidos materialId/quantity (formulário dinâmico). */
function readItems(formData: FormData) {
  const materials = formData.getAll("materialId").map(String);
  const quantities = formData.getAll("quantity").map((q) => Number(String(q).replace(",", ".")));
  const atas = formData.getAll("ataItemId").map((v) => (String(v) ? String(v) : null));
  return materials.map((materialId, i) => ({ materialId, quantity: quantities[i], ataItemId: atas[i] ?? null })).filter((i) => i.materialId);
}

export async function createRequestFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const result = await runAction(
    ({ services, actor }) => services.purchases.create(actor, { councilId: formData.get("councilId"), title: formData.get("title"), items: readItems(formData) }),
    "Solicitação criada como rascunho.",
  );
  if (result.status !== "success" || !result.data) return result.status === "success" ? result : result;
  revalidatePath("/solicitacoes");
  redirect(`/solicitacoes/${result.data.id}`);
}

type Step = "submit" | "startReview" | "requestCorrection" | "resubmitAfterCorrection" | "approve" | "reject" | "cancel" | "reopen";

/** Transição genérica da solicitação: o serviço valida a máquina de estados e a permissão. */
export async function requestStepFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const step = String(formData.get("step")) as Step;
  const requestId = String(formData.get("requestId"));
  const note = formData.get("note") ? String(formData.get("note")) : undefined;
  const result = await runAction(({ services, actor }) => {
    const s = services.purchases;
    switch (step) {
      case "submit": return s.submit(actor, { requestId });
      case "startReview": return s.startReview(actor, { requestId });
      case "requestCorrection": return s.requestCorrection(actor, { requestId, note });
      case "resubmitAfterCorrection": return s.resubmitAfterCorrection(actor, { requestId });
      case "approve": return s.approve(actor, { requestId, note });
      case "reject": return s.reject(actor, { requestId, note });
      case "cancel": return s.cancel(actor, { requestId, note });
      case "reopen": return s.reopen(actor, { requestId, justification: note ?? "" });
      default: return Promise.resolve({ ok: false as const, code: "VALIDATION" as const, message: "Ação desconhecida." });
    }
  }, "Solicitação atualizada.");
  if (result.status === "success") {
    revalidatePath(`/solicitacoes/${requestId}`);
    revalidatePath("/atas");
  }
  return result.status === "success" ? { status: "success", message: result.message } : result;
}

export async function receiveFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const requestId = String(formData.get("requestId"));
  const itemIds = formData.getAll("itemId").map(String);
  const quantities = formData.getAll("received").map((q) => Number(String(q).replace(",", ".")));
  const lines = itemIds.map((itemId, i) => ({ itemId, received: quantities[i] })).filter((l) => l.received > 0);
  const result = await runAction(({ services, actor }) => services.purchases.receive(actor, { requestId, receiptKey: String(formData.get("receiptKey")), lines }), "Recebimento registrado.");
  if (result.status === "success") {
    revalidatePath(`/solicitacoes/${requestId}`);
    revalidatePath("/estoque");
  }
  return result.status === "success" ? { status: "success", message: result.message } : result;
}
