"use server";

import { revalidatePath } from "next/cache";
import { runAction } from "@/server/action-runner";
import type { Result } from "@/shared/lib/result";
import { fail, ok } from "@/shared/lib/result";
import type { ActionState } from "@/shared/ui/forms/action-state";

/** Upload (2 fases dentro do serviço). Os bytes são lidos no servidor; o cliente nunca define o conselho. */
export async function uploadDocumentAction(processId: string, typeCode: string, formData: FormData): Promise<Result<{ attachmentId: string }>> {
  const file = formData.get("file");
  if (!(file instanceof File)) return fail("VALIDATION", "Selecione um arquivo.");
  const bytes = new Uint8Array(await file.arrayBuffer());

  const state = await runAction(({ services, actor }) => services.documents.upload(actor, { processId, typeCode, fileName: file.name }, bytes), "Documento enviado.");
  if (state.status !== "success" || !state.data) return fail("VALIDATION", state.status === "error" ? state.message : "Falha no envio.");
  revalidatePath(`/processos/${processId}`);
  return ok({ attachmentId: state.data.id });
}

export async function unlinkDocumentFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const result = await runAction(({ services, actor }) => services.documents.unlink(actor, { attachmentId: formData.get("attachmentId") }), "Documento desvinculado.");
  if (result.status === "success") revalidatePath(`/processos/${formData.get("processId")}`);
  return result.status === "success" ? { status: "success", message: result.message } : result;
}

/** Exclusão manual definitiva: o serviço só autoriza o usuário is_special_deleter (R13). */
export async function manualDeleteFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const result = await runAction(({ services, actor }) => services.documents.manualDelete(actor, { attachmentId: formData.get("attachmentId") }), "Documento excluído definitivamente.");
  if (result.status === "success") revalidatePath(`/processos/${formData.get("processId")}`);
  return result.status === "success" ? { status: "success", message: result.message } : result;
}

export async function downloadUrlAction(attachmentId: string): Promise<Result<string>> {
  const state = await runAction(({ services, actor }) => services.documents.getDownloadUrl(actor, { attachmentId }), "ok");
  return state.status === "success" && state.data ? ok(state.data) : fail("NOT_FOUND", "Não foi possível gerar o link de download.");
}
