"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { runAction } from "@/server/action-runner";
import { getServiceClient } from "@/server/supabase/client";
import { can } from "@/shared/lib/authz/policy";
import { fail, ok } from "@/shared/lib/result";
import type { ActionState } from "@/shared/ui/forms/action-state";
import { isProcessContractingMode } from "./contracting-mode";

/** Grava se o processo é registro de preços (ata + contrato) ou só contrato. */
export async function saveProcessContractingMode(_previous: ActionState, form: FormData): Promise<ActionState> {
  const processId = z.uuid().safeParse(form.get("processId"));
  const mode = String(form.get("contractingMode") ?? "").trim();
  if (!processId.success || !isProcessContractingMode(mode)) {
    return {
      status: "error",
      message: "Informe se é registro de preços ou somente contrato.",
      fieldErrors: { contractingMode: ["Escolha uma das opções."] },
    };
  }

  const result = await runAction(async ({ actor, services }) => {
    const process = await services.processes.get(actor, processId.data);
    if (!process.ok) return process;
    if (!can(actor, "process.create", process.data.process.councilId)) {
      return fail("FORBIDDEN", "Sem permissão para alterar o modo de contratação deste processo.");
    }
    const { error } = await getServiceClient().rpc("set_process_contracting_mode", {
      p_process: processId.data,
      p_actor: actor.userId,
      p_mode: mode,
    });
    if (error) {
      if (error.code === "PGRST202") {
        return fail("VALIDATION", "A atualização do banco para gravar o modo de contratação ainda precisa ser aplicada.");
      }
      if (error.code === "P0001") return fail("VALIDATION", error.message);
      return fail("VALIDATION", "Não foi possível salvar o modo de contratação.");
    }
    return ok(true);
  }, mode === "registro_precos"
    ? "Processo marcado como registro de preços (ata + contrato)."
    : "Processo marcado como somente contrato.");

  if (result.status === "success") {
    revalidatePath(`/solicitacoes/processos/${processId.data}`);
    for (const path of ["/processos", "/dashboard", "/meu-conselho", "/atas", "/contratos"]) {
      revalidatePath(path);
    }
  }
  return result;
}
