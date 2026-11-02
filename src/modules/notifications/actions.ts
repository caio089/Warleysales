"use server";

import { revalidatePath } from "next/cache";
import { runAction } from "@/server/action-runner";
import type { ActionState } from "@/shared/ui/forms/action-state";

export async function markNotificationReadFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const result = await runAction(({ services, actor }) => services.notifications.markRead(actor, { notificationId: formData.get("notificationId") }), "Notificação marcada como lida.");
  if (result.status === "success") revalidatePath("/alertas");
  return result.status === "success" ? { status: "success", message: result.message } : result;
}
