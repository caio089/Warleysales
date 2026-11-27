"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { can } from "@/shared/lib/authz/policy";
import { ok } from "@/shared/lib/result";
import { runAction } from "@/server/action-runner";
import { parseQuantityInput } from "@/shared/lib/quantity-input";
import type { ActionState } from "@/shared/ui/forms/action-state";

/** Itens digitados no formulário: nome, quantidade e unidade. Linha em branco é ignorada. */
function readItems(formData: FormData) {
  const names = formData.getAll("itemName").map((value) => String(value).trim());
  const quantities = formData.getAll("quantity").map(parseQuantityInput);
  const units = formData.getAll("unit").map((value) => String(value).trim());
  return names.map((description, i) => ({ description, quantity: quantities[i], unit: units[i] || "un" })).filter((item) => item.description.length > 0 || item.quantity > 0);
}

export async function createRequestFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const createProcess = formData.get("createProcess") === "on" || formData.get("createProcess") === "true";
  const result = await runAction(
    async ({ services, actor }) => {
      const created = await services.purchases.create(actor, {
        councilId: formData.get("councilId"),
        title: formData.get("title"),
        createProcess,
        items: readItems(formData),
      });
      if (!created.ok) return created;
      // Órgão salva → já entra na fila exclusiva do Warley (enviada para aprovação).
      const submitted = await services.purchases.submit(actor, { requestId: created.data.id });
      const request = submitted.ok ? submitted.data : created.data;
      return ok({ request, canOpenProcess: can(actor, "council.read", request.councilId) });
    },
    "Solicitação enviada para aprovação.",
  );
  if (result.status !== "success" || !result.data) return result.status === "success" ? result : result;
  revalidatePath("/solicitacoes");
  revalidatePath("/processos");
  revalidatePath("/dashboard");
  const { request, canOpenProcess } = result.data;
  const processId = request.processId;
  if (processId && canOpenProcess) {
    redirect(`/processos/${processId}?aba=aprovacoes`);
  }
  redirect(`/solicitacoes/${request.id}`);
}

type Step = "submit" | "startReview" | "requestCorrection" | "resubmitAfterCorrection" | "approve" | "reject" | "cancel" | "reopen";

/** Transição genérica da solicitação: o serviço valida a máquina de estados e a permissão. */
export async function requestStepFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const step = String(formData.get("step")) as Step;
  const requestId = String(formData.get("requestId"));
  const rawNote = formData.get("note");
  const note = rawNote == null ? undefined : String(rawNote);
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
  }, () =>
    step === "approve"
      ? "Aprovado. Documentação e estoque liberados para o andamento."
      : "Solicitação atualizada.",
  );
  if (result.status === "success") {
    revalidatePath(`/solicitacoes/${requestId}`);
    revalidatePath("/solicitacoes");
    revalidatePath("/processos");
    revalidatePath("/dashboard");
    revalidatePath("/atas");
    revalidatePath("/estoque");
    const processId = result.data?.processId;
    if (processId) revalidatePath(`/processos/${processId}`);
    // Fila rápida (Início/Processos): fica na página. Só redireciona quando a tela pedir.
    const redirectTo = String(formData.get("redirectTo") ?? "");
    if (step === "approve" && redirectTo.startsWith("/")) {
      redirect(redirectTo);
    }
  }
  return result.status === "success" ? { status: "success", message: result.message } : result;
}

export async function receiveFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const requestId = String(formData.get("requestId"));
  const itemIds = formData.getAll("itemId").map(String);
  const quantities = formData.getAll("received").map((q) => Number(String(q).replace(",", ".")));
  const lines = itemIds.map((itemId, i) => ({ itemId, received: quantities[i] })).filter((l) => l.received > 0);
  const closeIncomplete = formData.get("closeIncomplete") === "true" || formData.get("closeIncomplete") === "on";
  const rawJustification = formData.get("incompleteJustification");
  const incompleteJustification = rawJustification && String(rawJustification).trim() !== ""
    ? String(rawJustification).trim()
    : undefined;
  const result = await runAction(
    ({ services, actor }) =>
      services.purchases.receive(actor, {
        requestId,
        contractId: String(formData.get("contractId") || "") || undefined,
        receiptKey: String(formData.get("receiptKey")),
        lines,
        closeIncomplete,
        incompleteJustification,
      }),
    "Recebimento registrado.",
  );
  if (result.status === "success") {
    revalidatePath(`/solicitacoes/${requestId}`);
    revalidatePath("/estoque");
    revalidatePath("/estoque/movimentacoes");
  }
  return result.status === "success" ? { status: "success", message: result.message } : result;
}
