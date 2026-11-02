"use server";

import { revalidatePath } from "next/cache";
import { runAction } from "@/server/action-runner";
import type { ActionState } from "@/shared/ui/forms/action-state";

export async function createCouncilFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const result = await runAction(
    ({ services, actor }) => services.councils.create(actor, { name: formData.get("name"), acronym: formData.get("acronym"), institutionalInfo: formData.get("institutionalInfo") || null }),
    "Conselho criado com sucesso.",
  );
  if (result.status === "success") revalidatePath("/conselhos");
  return result.status === "success" ? { status: "success", message: result.message } : result;
}
