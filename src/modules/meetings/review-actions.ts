"use server";

import { revalidatePath } from "next/cache";
import { createHash } from "node:crypto";
import { z } from "zod";
import { runAction } from "@/server/action-runner";
import { getServiceClient } from "@/server/supabase/client";
import { can } from "@/shared/lib/authz/policy";
import { fail, ok } from "@/shared/lib/result";
import type { ActionState } from "@/shared/ui/forms/action-state";

export async function meetingReviewAction(_state: ActionState, form: FormData): Promise<ActionState> {
  const result = await runAction(async ({ services, actor }) => {
    const id = z.uuid().safeParse(form.get("meetingId"));
    if (!id.success) return fail("VALIDATION", "Reunião inválida.");
    const meeting = await services.meetings.get(actor, id.data);
    if (!meeting.ok) return meeting;
    const m = meeting.data;
    if (!can(actor, "meeting.manage", m.councilId)) return fail("FORBIDDEN", "Sem permissão para editar esta reunião.");
    if (m.status === "cancelada") return fail("INVALID_STATE", "Reunião cancelada.");
    const op = form.get("operation");
    const db = getServiceClient();
    if (op === "transcript" || op === "draft") {
      if (process.env.MEETING_EXTERNAL_AI !== "enabled" || !process.env.GROQ_API_KEY) {
        return fail("UNAVAILABLE", "Processamento externo de reuniões ainda não autorizado ou configurado.");
      }
      if (form.get("consent") !== "on") return fail("VALIDATION", "Confirme o envio ao provedor externo.");
      if (op === "transcript" ? !m.audioPath || !!m.transcript : m.status !== "realizada" || !m.transcript || !!m.minutes) {
        return fail("INVALID_STATE", "A reunião ainda não atende aos requisitos ou já possui um resultado.");
      }
      const query = db.from("meetings").update({ ai_stage: op, ai_state: "queued", ai_attempts: 0, ai_claim: null, ai_lease_until: null })
        .eq("id", m.id).or("ai_state.is.null,ai_state.in.(failed,done)");
      const { data, error } = await (op === "transcript" ? query.is("transcript_text", null) : query.is("minutes_text", null).is("minutes_draft", null)).select("id").maybeSingle();
      if (error || !data) return fail("CONFLICT", "Já existe uma solicitação ou resultado para esta reunião.");
    } else if (op === "review" || op === "approve") {
      if (m.status !== "realizada") return fail("INVALID_STATE", "Conclua a reunião antes de revisar a ata.");
      const input = z.string().trim().min(5).max(20000).safeParse(form.get("text"));
      if (!input.success) return fail("VALIDATION", "Informe um texto entre 5 e 20.000 caracteres.");
      const now = new Date().toISOString();
      const patch = op === "review" ? { minutes_draft: input.data, minutes_reviewed_at: now, minutes_reviewed_by: actor.userId } : {
        minutes_text: input.data, minutes_registered_by: actor.userId, minutes_registered_at: now,
        minutes_approved_by: actor.userId, minutes_approved_at: now,
      };
      const update = db.from("meetings").update(patch).eq("id", m.id).eq("status", "realizada")
        .is("minutes_text", null).or("ai_state.is.null,ai_state.in.(failed,done)");
      const { data, error } = await (op === "approve"
        ? update.eq("minutes_draft", input.data).not("minutes_reviewed_at", "is", null)
        : update).select("id").maybeSingle();
      if (error || !data) return fail("CONFLICT", "A ata já existe ou o processamento está em andamento.");
    } else if (op === "task") {
      const input = z.object({ description: z.string().trim().min(3).max(500), responsible: z.uuid(), due: z.iso.date() }).safeParse({
        description: form.get("description"), responsible: form.get("responsibleId"), due: form.get("dueDate"),
      });
      if (!input.success) return fail("VALIDATION", "Confirme descrição, responsável e prazo.");
      const { data: approved } = await db.from("meetings").select("minutes_approved_at").eq("id", m.id).maybeSingle();
      if (!approved?.minutes_approved_at) return fail("INVALID_STATE", "Aprove a ata antes de registrar a tarefa.");
      const people = await services.memberships.meetingParticipants(actor, m.councilId);
      if (!people.some((p) => p.active && p.id === input.data.responsible)) return fail("VALIDATION", "Escolha um responsável ativo do órgão.");
      const key = createHash("sha256").update(JSON.stringify(input.data)).digest("hex");
      const { error } = await db.from("meeting_action_items").insert({ minutes_task_key: key, meeting_id: m.id,
        description: input.data.description, responsible_id: input.data.responsible, due_date: input.data.due, done: false });
      if (error) {
        if (error.code !== "23505") return fail("INTERNAL", "Não foi possível registrar a tarefa.");
        const { data: existing } = await db.from("meeting_action_items").select("id").eq("meeting_id", m.id).eq("minutes_task_key", key).maybeSingle();
        return existing ? ok(true) : fail("CONFLICT", "A chave da tarefa já está em uso.");
      }
    } else return fail("VALIDATION", "Operação inválida.");
    await services.audit.record({ actorId: actor.userId, action: `meeting.minutes.${op}`, entity: "meeting",
      entityId: m.id, councilId: m.councilId, result: "success", details: {} });
    return ok(true);
  }, form.get("operation") === "approve" ? "Ata aprovada." : "Solicitação registrada.");
  if (result.status === "success") {
    revalidatePath("/reunioes");
    revalidatePath("/calendario");
  }
  return result;
}
