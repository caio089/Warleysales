"use server";

import { revalidatePath } from "next/cache";
import { runAction } from "@/server/action-runner";
import type { ActionState } from "@/shared/ui/forms/action-state";

const done = (r: ActionState): ActionState => (r.status === "success" ? { status: "success", message: r.message } : r);

export async function authorizeDisposalFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const result = await runAction(({ services, actor }) => services.retention.authorizeDisposal(actor, { processId: formData.get("processId"), reference: formData.get("reference") }), "Autorização de retenção registrada.");
  if (result.status === "success") revalidatePath("/administracao/retencao");
  return done(result);
}

export async function placeHoldFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const result = await runAction(({ services, actor }) => services.retention.placeHold(actor, { processId: formData.get("processId"), reason: formData.get("reason") }), "Bloqueio de retenção registrado.");
  if (result.status === "success") revalidatePath("/administracao/retencao");
  return done(result);
}
