"use server";

import { revalidatePath } from "next/cache";
import { runAction } from "@/server/action-runner";
import type { ActionState } from "@/shared/ui/forms/action-state";

export async function createCouncilFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const result = await runAction(
    ({ services, actor }) =>
      services.councils.create(actor, {
        name: formData.get("name"),
        acronym: formData.get("acronym"),
        institutionalInfo: formData.get("institutionalInfo") || null,
        whatsappE164: formData.get("whatsapp") || null,
      }),
    "Conselho criado com sucesso.",
  );
  if (result.status === "success") revalidatePath("/conselhos");
  return result.status === "success" ? { status: "success", message: result.message } : result;
}

export async function updateCouncilFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const councilId = String(formData.get("councilId") ?? "");
  const result = await runAction(
    ({ services, actor }) =>
      services.councils.update(actor, {
        councilId,
        name: formData.get("name"),
        acronym: formData.get("acronym"),
        institutionalInfo: formData.get("institutionalInfo") || null,
        whatsappE164: formData.get("whatsapp") || null,
      }),
    "Conselho atualizado com sucesso.",
  );
  if (result.status === "success") {
    revalidatePath("/conselhos");
    revalidatePath(`/conselhos/${councilId}`);
  }
  return result.status === "success" ? { status: "success", message: result.message } : result;
}

export async function assignMembershipFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const result = await runAction(
    ({ services, actor }) => services.memberships.assign(actor, {
      userId: formData.get("userId"),
      councilId: formData.get("councilId"),
      role: formData.get("role"),
    }),
    "Vínculo registrado.",
  );
  if (result.status === "success") revalidatePath("/administracao/usuarios");
  return result.status === "success" ? { status: "success", message: result.message } : result;
}

export async function removeMembershipFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const [userId, councilId] = String(formData.get("membershipKey") ?? "").split(":");
  const result = await runAction(
    ({ services, actor }) => services.memberships.remove(actor, { userId, councilId }),
    "Vínculo removido.",
  );
  if (result.status === "success") revalidatePath("/administracao/usuarios");
  return result.status === "success" ? { status: "success", message: result.message } : result;
}
