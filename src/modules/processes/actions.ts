"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { runAction } from "@/server/action-runner";
import type { ActionState } from "@/shared/ui/forms/action-state";

export async function createProcessFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const result = await runAction(
    ({ services, actor }) => services.processes.create(actor, { councilId: formData.get("councilId"), number: formData.get("number"), title: formData.get("title") }),
    "Processo criado com sucesso.",
  );
  if (result.status !== "success" || !result.data) return result.status === "success" ? result : result;
  revalidatePath("/processos");
  redirect(`/processos/${result.data.id}`);
}

export async function changeProcessStatusFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const result = await runAction(
    ({ services, actor }) => services.processes.changeStatus(actor, { processId: formData.get("processId"), status: formData.get("status") }),
    "Situação do processo atualizada.",
  );
  if (result.status === "success") {
    revalidatePath("/processos");
    revalidatePath(`/processos/${formData.get("processId")}`);
    revalidatePath("/administracao/retencao");
  }
  return result.status === "success" ? { status: "success", message: result.message } : result;
}

/** Relatório de encerramento: pré-requisito da limpeza documental (R6). */
export async function registerClosingReportFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const processId = String(formData.get("processId"));
  const rawJustification = formData.get("closingJustification");
  const closingJustification = rawJustification && String(rawJustification).trim() !== ""
    ? String(rawJustification).trim()
    : undefined;
  const result = await runAction(
    ({ services, actor }) => services.processes.registerClosingReport(actor, { processId, closingJustification }),
    "Relatório de encerramento registrado.",
  );
  if (result.status === "success") {
    revalidatePath("/processos");
    revalidatePath(`/processos/${processId}`);
    revalidatePath("/administracao/retencao");
  }
  return result.status === "success" ? { status: "success", message: result.message } : result;
}

export const registerClosingFormAction = registerClosingReportFormAction;
