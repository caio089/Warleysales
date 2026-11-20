"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { runAction } from "@/server/action-runner";
import { getServiceClient } from "@/server/supabase/client";
import { can } from "@/shared/lib/authz/policy";
import { fail, ok } from "@/shared/lib/result";
import type { ActionState } from "@/shared/ui/forms/action-state";

const schema = z.object({
  requestId: z.uuid(), revision: z.string().regex(/^[a-f0-9]{32}$/),
  councilId: z.uuid(), title: z.string().trim().min(3).max(200),
  priority: z.enum(["Alta", "Média", "Baixa"]),
  estimatedValue: z.number().nonnegative().nullable(),
  justification: z.string().trim().min(10).max(1000),
  items: z.array(z.object({
    materialId: z.union([z.uuid(), z.literal("")]).optional(),
    description: z.string().trim().min(2).max(160), unit: z.string().trim().min(1).max(20),
    quantity: z.number().positive(),
  })).min(1).max(100),
});

export async function correctRequestAction(_previous: ActionState, form: FormData): Promise<ActionState> {
  const names = form.getAll("description");
  const units = form.getAll("unit");
  const quantities = form.getAll("quantity");
  const materialIds = form.getAll("materialId");
  const value = String(form.get("estimatedValue") ?? "").trim();
  const parsed = schema.safeParse({
    requestId: form.get("requestId"), revision: form.get("revision"),
    councilId: form.get("councilId"), title: form.get("title"), priority: form.get("priority"),
    estimatedValue: value ? Number(value.replace(",", ".")) : null, justification: form.get("justification"),
    items: names.map((description, index) => ({
      materialId: materialIds[index] ?? "", description, unit: units[index], quantity: Number(String(quantities[index]).replace(",", ".")),
    })),
  });
  if (!parsed.success) return { status: "error", message: "Confira os campos. A justificativa deve ter de 10 a 1000 caracteres e cada item precisa de nome, unidade e quantidade positiva." };
  const data = parsed.data;
  const result = await runAction(async ({ actor, services }) => {
    const request = await services.purchases.get(actor, data.requestId);
    if (!request.ok) return request;
    if (!can(actor, "request.create", request.data.councilId) || !can(actor, "request.create", data.councilId)) {
      return fail("FORBIDDEN", "Sem permissão para corrigir a solicitação nestes órgãos.");
    }
    const { error } = await getServiceClient().rpc("correct_purchase_request", {
      p_request: data.requestId, p_actor: actor.userId, p_expected: data.revision, p_data: data,
    });
    if (error) return fail("VALIDATION", error.message);
    return ok({ processId: request.data.processId });
  }, "Correção salva e registrada no histórico.");
  if (result.status === "success") {
    for (const path of ["/solicitacoes", `/solicitacoes/${data.requestId}`, "/processos", "/estoque", "/dashboard", "/meu-conselho", "/calendario", "/relatorios"]) revalidatePath(path);
    if (result.data?.processId) revalidatePath(`/processos/${result.data.processId}`);
  }
  return result;
}
