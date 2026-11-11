"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { runAction } from "@/server/action-runner";
import type { ActionState } from "@/shared/ui/forms/action-state";

const optionalNumber = (v: FormDataEntryValue | null) => (String(v ?? "").trim() ? Number(String(v).replace(",", ".")) : undefined);
const optionalText = (v: FormDataEntryValue | null) => (String(v ?? "").trim() ? String(v) : undefined);

export async function createContractFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const result = await runAction(({ services, actor }) => services.contracts.create(actor, {
    councilId: formData.get("councilId"), number: formData.get("number"), object: formData.get("object"),
    processId: optionalText(formData.get("processId")) ?? null,
    startDate: formData.get("startDate"), endDate: formData.get("endDate"), value: optionalNumber(formData.get("value")) ?? 0,
  }), "Contrato cadastrado.");
  if (result.status !== "success" || !result.data) return result.status === "success" ? result : result;
  revalidatePath("/contratos");
  redirect(`/contratos/${result.data.id}`);
}

export async function addAmendmentFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const contractId = String(formData.get("contractId"));
  const result = await runAction(({ services, actor }) => services.contracts.addAmendment(actor, {
    contractId, reason: formData.get("reason"), endDate: optionalText(formData.get("endDate")), value: optionalNumber(formData.get("value")), signedAt: formData.get("signedAt"),
  }), "Aditivo registrado; o histórico anterior foi preservado.");
  if (result.status === "success") revalidatePath(`/contratos/${contractId}`);
  return result.status === "success" ? { status: "success", message: result.message } : result;
}

/** Liga o contrato ao processo já escolhido na ata, ou a outro processo do mesmo órgão. */
export async function linkContractProcessFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const contractId = String(formData.get("contractId"));
  const processId = optionalText(formData.get("processId")) ?? null;
  const result = await runAction(
    ({ services, actor }) => services.contracts.linkProcess(actor, { contractId, processId }),
    processId ? "Contrato vinculado ao processo." : "Vínculo com o processo removido.",
  );
  if (result.status === "success") {
    revalidatePath(`/contratos/${contractId}`);
    revalidatePath("/contratos");
    revalidatePath("/atas");
    revalidatePath("/processos");
    if (processId) revalidatePath(`/processos/${processId}`);
  }
  return result.status === "success" ? { status: "success", message: result.message } : result;
}
