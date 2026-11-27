"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { runAction } from "@/server/action-runner";
import { getServiceClient } from "@/server/supabase/client";
import { can } from "@/shared/lib/authz/policy";
import { parseCurrencyInput } from "@/shared/lib/money-input";
import { fail, ok } from "@/shared/lib/result";
import type { ActionState } from "@/shared/ui/forms/action-state";

export async function saveProcessEstimatedValue(_previous: ActionState, form: FormData): Promise<ActionState> {
  const processId = z.uuid().safeParse(form.get("processId"));
  const value = parseCurrencyInput(String(form.get("estimatedValue") ?? ""));
  if (!processId.success || value == null || value === "" || !/^\d{1,13}(?:\.\d{1,2})?$/.test(value)) {
    return { status: "error", message: "Informe um valor estimado válido, com até duas casas decimais." };
  }

  const result = await runAction(async ({ actor, services }) => {
    const process = await services.processes.get(actor, processId.data);
    if (!process.ok) return process;
    if (!can(actor, "process.create", process.data.process.councilId)) {
      return fail("FORBIDDEN", "Sem permissão para alterar o valor estimado deste processo.");
    }
    const { error } = await getServiceClient().rpc("set_process_estimated_value", {
      p_process: processId.data,
      p_actor: actor.userId,
      p_value: Number(value),
    });
    if (error) {
      if (error.code === "PGRST202") return fail("VALIDATION", "A atualização do banco para gravar o valor estimado ainda precisa ser aplicada.");
      if (error.code === "P0001") return fail("VALIDATION", error.message);
      return fail("VALIDATION", "Não foi possível salvar o valor estimado.");
    }
    return ok(true);
  }, "Valor estimado salvo.");

  if (result.status === "success") {
    revalidatePath(`/solicitacoes/processos/${processId.data}`);
    revalidatePath("/solicitacoes");
    for (const path of ["/processos", "/dashboard", "/meu-conselho", "/calendario", "/relatorios"]) revalidatePath(path);
  }
  return result;
}
