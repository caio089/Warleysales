"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { runAction } from "@/server/action-runner";
import type { ActionState } from "@/shared/ui/forms/action-state";

const toNumber = (v: FormDataEntryValue | null) => Number(String(v ?? "").replace(",", "."));

export async function createAtaFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const result = await runAction(({ services, actor }) => services.atas.create(actor, {
    councilId: formData.get("councilId"), number: formData.get("number"), startDate: formData.get("startDate"),
    items: [{ description: formData.get("description"), registeredQuantity: toNumber(formData.get("registeredQuantity")), unitPrice: toNumber(formData.get("unitPrice")) }],
  }), "Ata criada como rascunho.");
  if (result.status !== "success" || !result.data) return result.status === "success" ? result : result;
  revalidatePath("/atas");
  redirect(`/atas/${result.data.id}`);
}

export async function ataStepFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const ataId = String(formData.get("ataId"));
  const step = String(formData.get("step"));
  const result = await runAction(({ services, actor }) => (step === "extend" ? services.atas.extend(actor, { ataId }) : services.atas.activate(actor, { ataId })), step === "extend" ? "Ata prorrogada por 1 ano." : "Ata ativada.");
  if (result.status === "success") revalidatePath(`/atas/${ataId}`);
  return result.status === "success" ? { status: "success", message: result.message } : result;
}
