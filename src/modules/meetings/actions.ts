"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { runAction } from "@/server/action-runner";
import { fail } from "@/shared/lib/result";
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
  if (result.status === "success") {
    revalidatePath("/reunioes");
    revalidatePath("/meu-conselho");
    revalidatePath("/calendario");
    if (formData.get("openDetails") === "1" && result.data) redirect(`/reunioes?reuniao=${result.data.id}`);
  }
  return result.status === "success" ? { status: "success", message: result.message } : result;
}

export async function meetingStepFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const meetingId = String(formData.get("meetingId"));
  const result = await runAction(({ services, actor }) => services.meetings.changeStatus(actor, {
    meetingId, to: formData.get("to"), newScheduledAt: formData.get("newScheduledAt") ? fortalezaLocalToIso(formData.get("newScheduledAt")) : undefined,
  }), "Reunião atualizada.");
  if (result.status === "success") {
    revalidatePath("/reunioes");
    revalidatePath("/calendario");
  }
  return result.status === "success" ? { status: "success", message: result.message } : result;
}

export async function saveMinutesFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const result = await runAction(({ services, actor }) => services.meetings.saveMinutes(actor, { meetingId: formData.get("meetingId"), text: formData.get("text") }), "Ata da reunião registrada.");
  if (result.status === "success") revalidatePath("/reunioes");
  return result.status === "success" ? { status: "success", message: result.message } : result;
}

export async function addActionItemFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const result = await runAction(async ({ services, actor }) => {
    const meetingId = String(formData.get("meetingId") ?? "");
    const responsibleId = String(formData.get("responsibleId") ?? "") || null;
    if (responsibleId) {
      const meeting = await services.meetings.get(actor, meetingId);
      if (!meeting.ok) return meeting;
      const people = await services.memberships.meetingParticipants(actor, meeting.data.councilId);
      if (!people.some((person) => person.active && person.id === responsibleId)) {
        return fail("VALIDATION", "Selecione um responsável ativo do órgão.", { responsibleId: ["Responsável indisponível."] });
      }
    }
    return services.meetings.addActionItem(actor, {
      meetingId, description: formData.get("description"), dueDate: formData.get("dueDate") || null, responsibleId,
    });
  }, "Atividade da reunião registrada.");
  if (result.status === "success") {
    revalidatePath("/reunioes");
    revalidatePath("/calendario");
  }
  return result.status === "success" ? { status: "success", message: result.message } : result;
}

export async function meetingEvidenceFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const result = await runAction(({ services, actor }) => services.meetings.recordEvidence(actor, {
    meetingId: formData.get("meetingId"),
    targetId: formData.get("targetId"),
    kind: formData.get("kind"),
  }), "Registro confirmado.");
  if (result.status === "success") {
    revalidatePath("/reunioes");
    revalidatePath("/relatorios");
    revalidatePath("/calendario");
  }
  return result.status === "success" ? { status: "success", message: result.message } : result;
}

export async function updateMeetingDetailsFormAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const result = await runAction(({ services, actor }) => services.meetings.updateDetails(actor, {
    meetingId: formData.get("meetingId"), title: formData.get("title"),
    responsibleId: formData.get("responsibleId") || null, agenda: formData.get("agenda"), decisions: formData.get("decisions"),
    participantIds: formData.getAll("participantIds"), attachmentIds: formData.getAll("attachmentIds"),
  }), "Dados da reunião atualizados.");
  if (result.status === "success") {
    revalidatePath("/reunioes");
    revalidatePath("/calendario");
  }
  return result;
}
