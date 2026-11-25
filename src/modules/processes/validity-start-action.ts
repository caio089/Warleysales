"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { runAction } from "@/server/action-runner";
import { getServiceClient } from "@/server/supabase/client";
import { can } from "@/shared/lib/authz/policy";
import { isValidDateOnly } from "@/shared/lib/time";
import { fail, ok } from "@/shared/lib/result";
import type { ActionState } from "@/shared/ui/forms/action-state";

/** Grava a vigência informada no TR para reutilizar na ata e no contrato. */
export async function saveProcessValidityStartDate(_previous: ActionState, form: FormData): Promise<ActionState> {
  const processId = z.uuid().safeParse(form.get("processId"));
  const startDate = String(form.get("startDate") ?? "").trim();
  if (!processId.success || !isValidDateOnly(startDate)) {
    return { status: "error", message: "Informe a data de início da vigência (DD/MM/AAAA)." };
  }

  const result = await runAction(async ({ actor, services }) => {
    const process = await services.processes.get(actor, processId.data);
    if (!process.ok) return process;
    if (!can(actor, "process.create", process.data.process.councilId)) {
      return fail("FORBIDDEN", "Sem permissão para alterar a vigência deste processo.");
    }
    const { error } = await getServiceClient().rpc("set_process_validity_start_date", {
      p_process: processId.data,
      p_actor: actor.userId,
      p_start: startDate,
    });
    if (error) {
      if (error.code === "PGRST202") {
        return fail("VALIDATION", "A atualização do banco para gravar a vigência ainda precisa ser aplicada.");
      }
      if (error.code === "P0001") return fail("VALIDATION", error.message);
      return fail("VALIDATION", "Não foi possível salvar a vigência do TR.");
    }
    return ok(true);
  }, "Vigência do TR salva. Ata e contrato usarão esta data.");

  if (result.status === "success") {
    revalidatePath(`/processos/${processId.data}`);
    for (const path of ["/processos", "/dashboard", "/meu-conselho", "/calendario", "/atas", "/contratos"]) {
      revalidatePath(path);
    }
  }
  return result;
}
