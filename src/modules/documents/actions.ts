"use server";

import { revalidatePath } from "next/cache";
import { runAction } from "@/server/action-runner";
import type { AdministrativeProcess } from "@/modules/processes/schemas";
import type { Attachment, PreparedUpload } from "@/modules/documents/schemas";
import type { Result } from "@/shared/lib/result";
import { fail, ok } from "@/shared/lib/result";
import type { ActionState } from "@/shared/ui/forms/action-state";

/** Fase 1 do upload direto: registra o anexo pendente e devolve o token assinado (o conselho vem do servidor, R14). */
export async function prepareDocumentUploadAction(
  processId: string,
  typeCode: string,
  file: { fileName: string; size: number; sha256: string },
): Promise<Result<PreparedUpload>> {
  const state = await runAction(({ services, actor }) => services.documents.prepareUpload(actor, { processId, typeCode, ...file }), "Envio iniciado.");
  if (state.status !== "success" || !state.data) return fail("VALIDATION", state.status === "error" ? state.message : "Falha ao iniciar o envio.");
  return ok(state.data);
}

/** Fase final: o servidor valida o objeto gravado (tamanho, magic bytes e SHA-256) e confirma o anexo. */
export async function confirmDocumentUploadAction(processId: string, attachmentId: string): Promise<Result<{ attachmentId: string }>> {
  const state = await runAction(({ services, actor }) => services.documents.confirmUpload(actor, { attachmentId }), "Documento enviado.");
  if (state.status !== "success" || !state.data) return fail("VALIDATION", state.status === "error" ? state.message : "Falha ao confirmar o envio.");
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

/** Carrega os dados do processo e seus documentos confirmados para anexagem rápida (R1, R14). */
export async function loadProcessDocumentsAction(processId: string): Promise<Result<{
  process: AdministrativeProcess;
  documents: Attachment[];
  validTypes: string[];
}>> {
  const state = await runAction(async ({ services, actor }) => {
    const processResult = await services.processes.get(actor, processId);
    if (!processResult.ok) return processResult;
    const documentsResult = await services.documents.listByProcess(actor, processId);
    if (!documentsResult.ok) return documentsResult;
    return ok({
      process: processResult.data.process,
      documents: documentsResult.data,
      validTypes: [...processResult.data.progress.validTypes],
    });
  }, "ok");

  if (state.status !== "success" || !state.data) {
    return fail("VALIDATION", state.status === "error" ? state.message : "Falha ao carregar documentos do processo.");
  }
  return ok(state.data);
}
