"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { runAction } from "@/server/action-runner";
import { getServiceClient } from "@/server/supabase/client";
import { can } from "@/shared/lib/authz/policy";
import { parseCurrencyInput } from "@/shared/lib/money-input";
import { fail, ok } from "@/shared/lib/result";
import type { ActionState } from "@/shared/ui/forms/action-state";
import { sumPriceResearchLines } from "./price-research";

const lineSchema = z.object({
  materialId: z.string(),
  name: z.string().trim().min(1),
  quantity: z.number().positive(),
  lineTotal: z.number().min(0),
});

/** Salva valor de referência por item da PP e grava o total estimado. */
export async function saveProcessPriceResearch(_previous: ActionState, form: FormData): Promise<ActionState> {
  const processId = z.uuid().safeParse(form.get("processId"));
  const itemCount = Number(form.get("itemCount") ?? 0);
  if (!processId.success || !Number.isFinite(itemCount) || itemCount < 1) {
    return { status: "error", message: "Informe os itens da pesquisa de preços." };
  }

  const lines = [];
  for (let index = 0; index < itemCount; index += 1) {
    const rawTotal = parseCurrencyInput(String(form.get(`lines.${index}.lineTotal`) ?? ""));
    if (rawTotal == null || rawTotal === "" || !/^\d{1,13}(?:\.\d{1,2})?$/.test(rawTotal)) {
      return {
        status: "error",
        message: "Informe o valor de referência de cada item.",
        fieldErrors: { [`lines.${index}.lineTotal`]: ["Informe um valor válido."] },
      };
    }
    const quantity = Number(String(form.get(`lines.${index}.quantity`) ?? "").replace(",", "."));
    lines.push({
      materialId: String(form.get(`lines.${index}.materialId`) ?? ""),
      name: String(form.get(`lines.${index}.name`) ?? "").trim(),
      quantity,
      lineTotal: Number(rawTotal),
    });
  }

  const parsed = z.array(lineSchema).min(1).safeParse(lines);
  if (!parsed.success) {
    return { status: "error", message: "Confira quantidade e valor de cada item." };
  }

  const total = sumPriceResearchLines(parsed.data);
  const result = await runAction(async ({ actor, services }) => {
    const process = await services.processes.get(actor, processId.data);
    if (!process.ok) return process;
    if (!can(actor, "process.create", process.data.process.councilId)) {
      return fail("FORBIDDEN", "Sem permissão para alterar a pesquisa de preços deste processo.");
    }
    const { error } = await getServiceClient().rpc("set_process_price_research", {
      p_process: processId.data,
      p_actor: actor.userId,
      p_lines: parsed.data,
    });
    if (error) {
      if (error.code === "PGRST202") {
        return fail("VALIDATION", "A atualização do banco para a pesquisa de preços ainda precisa ser aplicada.");
      }
      if (error.code === "P0001") return fail("VALIDATION", error.message);
      return fail("VALIDATION", "Não foi possível salvar a pesquisa de preços.");
    }
    return ok(true);
  }, `Pesquisa de preços salva. Total: R$ ${total.toFixed(2).replace(".", ",")}.`);

  if (result.status === "success") {
    revalidatePath(`/solicitacoes/processos/${processId.data}`);
    revalidatePath("/solicitacoes");
    for (const path of ["/processos", "/dashboard", "/meu-conselho", "/calendario", "/relatorios"]) {
      revalidatePath(path);
    }
  }
  return result;
}
