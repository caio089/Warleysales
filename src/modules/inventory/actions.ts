"use server";

import { revalidatePath } from "next/cache";
import { runAction } from "@/server/action-runner";
import type { ActionState } from "@/shared/ui/forms/action-state";

const toNumber = (v: FormDataEntryValue | null) => Number(String(v ?? "").replace(",", "."));
const done = (r: ActionState): ActionState => (r.status === "success" ? { status: "success", message: r.message } : r);

export async function createMaterialFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const result = await runAction(({ services, actor }) => services.inventory.createMaterial(actor, { code: formData.get("code"), name: formData.get("name"), unit: formData.get("unit") }), "Material cadastrado.");
  if (result.status === "success") revalidatePath("/estoque/materiais");
  return done(result);
}

export async function registerMovementFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const result = await runAction(({ services, actor }) => services.inventory.registerMovement(actor, {
    councilId: formData.get("councilId"), materialId: formData.get("materialId"), type: formData.get("type"),
    quantity: toNumber(formData.get("quantity")), idempotencyKey: formData.get("idempotencyKey"), reason: formData.get("reason"),
  }), "Movimentação registrada.");
  if (result.status === "success") { revalidatePath("/estoque"); revalidatePath("/estoque/movimentacoes"); }
  return done(result);
}
