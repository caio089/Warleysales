"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { runAction } from "@/server/action-runner";
import type { ActionState } from "@/shared/ui/forms/action-state";

const toNumber = (v: FormDataEntryValue | null) => Number(String(v ?? "").replace(",", "."));

export async function requestTransferFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const result = await runAction(({ services, actor }) => services.transfers.request(actor, {
    originCouncilId: formData.get("originCouncilId"), destinationCouncilId: formData.get("destinationCouncilId"),
    items: [{ materialId: formData.get("materialId"), quantity: toNumber(formData.get("quantity")) }],
  }), "Transferência solicitada.");
  if (result.status !== "success" || !result.data) return result.status === "success" ? result : result;
  revalidatePath("/transferencias");
  redirect(`/transferencias/${result.data.id}`);
}

export async function advanceTransferFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const transferId = String(formData.get("transferId"));
  const materialIds = formData.getAll("receivedMaterialId").map(String);
  const quantities = formData.getAll("receivedQuantity").map(toNumber);
  const received = materialIds.length ? materialIds.map((materialId, i) => ({ materialId, quantity: quantities[i] })) : undefined;
  const result = await runAction(({ services, actor }) => services.transfers.advance(actor, { transferId, to: formData.get("to"), received }), "Transferência atualizada.");
  if (result.status === "success") { revalidatePath(`/transferencias/${transferId}`); revalidatePath("/estoque"); }
  return result.status === "success" ? { status: "success", message: result.message } : result;
}
