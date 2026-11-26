"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { runAction } from "@/server/action-runner";
import type { ActionState } from "@/shared/ui/forms/action-state";
import { fail } from "@/shared/lib/result";

export async function createProcessFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const result = await runAction(
    async ({ services, actor }) => {
      const councilId = String(formData.get("councilId") || "");
      const responsibleId = String(formData.get("responsibleId") || "") || null;
      if (responsibleId && !(await services.memberships.processAssignees(actor, councilId)).some((person) => person.id === responsibleId))
        return fail("VALIDATION", "O responsável precisa ser usuário ativo do órgão do processo.");
      return services.processes.create(actor, { councilId, number: formData.get("number"), title: formData.get("title"), responsibleId, processType: formData.get("processType") || null });
    },
    "Processo criado com sucesso.",
  );
  if (result.status !== "success" || !result.data) return result.status === "success" ? result : result;
  revalidatePath("/processos");
  redirect(`/solicitacoes/processos/${result.data.id}`);
}

export async function classifyProcessFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const processId = String(formData.get("processId"));
  const result = await runAction(async ({ services, actor }) => {
    const responsibleId = String(formData.get("responsibleId") || "") || null;
    if (responsibleId) {
      const process = await services.processes.get(actor, processId);
      if (!process.ok) return process;
      if (!(await services.memberships.processAssignees(actor, process.data.process.councilId)).some((person) => person.id === responsibleId))
        return fail("VALIDATION", "O responsável precisa ser usuário ativo do órgão do processo.");
    }
    return services.processes.classify(actor, { processId, responsibleId, processType: formData.get("processType") || null });
  }, "Dados do processo atualizados.");
  if (result.status === "success") revalidatePath(`/solicitacoes/processos/${processId}`);
  return result.status === "success" ? { status: "success", message: result.message } : result;
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
