"use server";

import { revalidatePath } from "next/cache";
import { runAction } from "@/server/action-runner";
import { getServiceClient } from "@/server/supabase/client";
import { can } from "@/shared/lib/authz/policy";
import { fail, ok } from "@/shared/lib/result";
import { DOCUMENT_TYPE_CODES } from "./domain/document-types";
import type { DocumentTypeCode } from "./domain/document-types";
import type { ActionState } from "@/shared/ui/forms/action-state";

export async function documentExceptionAction(_previous: ActionState, form: FormData): Promise<ActionState> {
  const processId = String(form.get("processId") ?? "");
  const typeCode = String(form.get("typeCode") ?? "");
  const justification = String(form.get("justification") ?? "").trim();
  const result = await runAction(async ({ actor, services }) => {
    if (!DOCUMENT_TYPE_CODES.includes(typeCode as DocumentTypeCode) || justification.length < 10 || justification.length > 1000) {
      return fail("VALIDATION", "Selecione a etapa e informe uma justificativa de 10 a 1000 caracteres.");
    }
    const process = await services.processes.get(actor, processId);
    if (!process.ok) return process;
    if (!can(actor, "document.attach", process.data.process.councilId)) return fail("FORBIDDEN", "Sem permissão para alterar esta etapa.");
    const { error } = await getServiceClient().rpc("set_document_exception", {
      p_process: processId, p_type: typeCode, p_actor: actor.userId, p_reason: justification,
      p_remove: form.get("remove") === "true",
    });
    if (error) return fail("VALIDATION", error.message);
    return ok(true);
  }, "Etapa documental atualizada.");
  if (result.status === "success") {
    revalidatePath(`/processos/${processId}`);
    revalidatePath("/processos");
    revalidatePath("/dashboard");
  }
  return result;
}
