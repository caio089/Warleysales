"use server";

import { revalidatePath } from "next/cache";
import { runAction } from "@/server/action-runner";
import type { ActionState } from "@/shared/ui/forms/action-state";

/** O campo datetime-local vem sem fuso: interpretamos como horário de Fortaleza (UTC-3, sem DST). */
function fortalezaLocalToIso(value: FormDataEntryValue | null): string {
  const raw = String(value ?? "");
  return raw ? `${raw}:00-03:00` : "";
}

export async function scheduleMeetingFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const result = await runAction(({ services, actor }) => services.meetings.schedule(actor, {
    councilId: formData.get("councilId"), title: formData.get("title"), scheduledAt: fortalezaLocalToIso(formData.get("scheduledAt")),
  }), "Reunião agendada.");
  if (result.status === "success") revalidatePath("/reunioes");
  return result.status === "success" ? { status: "success", message: result.message } : result;
}

export async function meetingStepFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const meetingId = String(formData.get("meetingId"));
  const result = await runAction(({ services, actor }) => services.meetings.changeStatus(actor, {
    meetingId, to: formData.get("to"), newScheduledAt: formData.get("newScheduledAt") ? fortalezaLocalToIso(formData.get("newScheduledAt")) : undefined,
  }), "Reunião atualizada.");
  if (result.status === "success") revalidatePath("/reunioes");
  return result.status === "success" ? { status: "success", message: result.message } : result;
}

export async function saveMinutesFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const result = await runAction(({ services, actor }) => services.meetings.saveMinutes(actor, { meetingId: formData.get("meetingId"), text: formData.get("text") }), "Ata da reunião registrada.");
  if (result.status === "success") revalidatePath("/reunioes");
  return result.status === "success" ? { status: "success", message: result.message } : result;
}

export async function addActionItemFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const result = await runAction(({ services, actor }) => services.meetings.addActionItem(actor, {
    meetingId: formData.get("meetingId"), description: formData.get("description"), dueDate: formData.get("dueDate") || null,
  }), "Pendência da reunião registrada.");
  if (result.status === "success") revalidatePath("/reunioes");
  return result.status === "success" ? { status: "success", message: result.message } : result;
}
