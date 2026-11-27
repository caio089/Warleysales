"use server";

import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";
import { revalidatePath } from "next/cache";
import { can } from "@/shared/lib/authz/policy";
import { fail, ok, type Result } from "@/shared/lib/result";
import { idSchema } from "@/shared/lib/service-support";
import { runAction } from "@/server/action-runner";
import { getServiceClient } from "@/server/supabase/client";
import type { Services } from "@/server/container";
import type { Actor } from "@/shared/lib/authz/policy";
import { MEETING_AUDIO_EXTENSIONS, meetingOwnsAudioPath, validMeetingAudio } from "./media-validation";

const BUCKET = "meeting-audio";

async function managedMeeting(meetingId: string, actor: Actor, services: Services) {
  const found = await services.meetings.get(actor, meetingId);
  if (!found.ok) return found;
  if (!can(actor, "meeting.manage", found.data.councilId)) return fail("FORBIDDEN", "Sem permissão para gerenciar esta reunião.");
  return found;
}

export async function prepareMeetingAudioAction(meetingId: string, mime: string, size: number): Promise<Result<{ path: string; token: string }>> {
  if (!idSchema.safeParse(meetingId).success || !validMeetingAudio(mime, size)) {
    return fail("VALIDATION", "Áudio inválido ou acima de 25 MB.");
  }
  const state = await runAction(async ({ services, actor }) => {
    const meeting = await managedMeeting(meetingId, actor, services);
    if (!meeting.ok) return meeting;
    if (meeting.data.status === "cancelada" || meeting.data.audioPath) return fail("INVALID_STATE", "Esta reunião não aceita outra gravação.");
    const path = `${meeting.data.councilId}/${meetingId}/${crypto.randomUUID()}.${MEETING_AUDIO_EXTENSIONS[mime]}`;
    const { data, error } = await getServiceClient().storage.from(BUCKET).createSignedUploadUrl(path);
    if (error || !data) return fail("UNAVAILABLE", "Não foi possível preparar o envio do áudio.");
    return ok({ path: data.path, token: data.token });
  }, "Envio preparado.");
  return state.status === "success" && state.data ? ok(state.data) : fail("VALIDATION", state.status === "error" ? state.message : "Não foi possível preparar o envio.");
}

export async function confirmMeetingAudioAction(meetingId: string, path: string, transcript: string): Promise<Result<true>> {
  if (!idSchema.safeParse(meetingId).success || transcript.length > 20000) return fail("VALIDATION", "Transcrição inválida.");
  const state = await runAction(async ({ services, actor }) => {
    const meeting = await managedMeeting(meetingId, actor, services);
    if (!meeting.ok) return meeting;
    if (meeting.data.status === "cancelada" || meeting.data.audioPath) return fail("INVALID_STATE", "Esta reunião não aceita outra gravação.");
    if (!meetingOwnsAudioPath(path, meeting.data.councilId, meetingId)) return fail("FORBIDDEN", "Caminho de áudio inválido.");
    const bucket = getServiceClient().storage.from(BUCKET);
    const { data: info, error } = await bucket.info(path);
    const storedMime = info?.contentType?.split(";")[0] ?? "";
    if (error || !info || !validMeetingAudio(storedMime, info.size ?? 0)) {
      return fail("VALIDATION", "Arquivo de áudio ausente ou inválido.");
    }
    const db = getServiceClient();
    const { data, error: updateError } = await db.from("meetings").update({
      audio_path: path, transcript_text: transcript.trim() || null,
    }).eq("id", meetingId).neq("status", "cancelada").is("audio_path", null).select("id").maybeSingle<{ id: string }>();
    if (updateError || !data) return fail("CONFLICT", "Não foi possível registrar o áudio.");
    await services.audit.record({
      actorId: actor.userId, action: "meeting.audio", entity: "meeting", entityId: meetingId,
      councilId: meeting.data.councilId, result: "success", details: { hasTranscript: Boolean(transcript.trim()) },
    });
    return ok(true);
  }, "Áudio registrado.");
  if (state.status === "success") revalidatePath("/reunioes");
  return state.status === "success" ? ok(true) : fail("VALIDATION", state.status === "error" ? state.message : "Não foi possível registrar o áudio.");
}

export async function meetingAudioUrlAction(meetingId: string): Promise<Result<string>> {
  if (!idSchema.safeParse(meetingId).success) return fail("VALIDATION", "Reunião inválida.");
  const state = await runAction(async ({ services, actor }) => {
    const meeting = await services.meetings.get(actor, meetingId);
    if (!meeting.ok) return meeting;
    if (!meeting.data.audioPath) return fail("NOT_FOUND", "Esta reunião não possui áudio.");
    const { data, error } = await getServiceClient().storage.from(BUCKET).createSignedUrl(meeting.data.audioPath, 3600);
    return error || !data ? fail("UNAVAILABLE", "Não foi possível abrir o áudio.") : ok(data.signedUrl);
  }, "Áudio disponível.");
  return state.status === "success" && state.data ? ok(state.data) : fail("NOT_FOUND", state.status === "error" ? state.message : "Não foi possível abrir o áudio.");
}

export async function draftMeetingMinutesAction(meetingId: string): Promise<Result<string>> {
  if (!idSchema.safeParse(meetingId).success) return fail("VALIDATION", "Reunião inválida.");
  if (process.env.MEETING_EXTERNAL_AI !== "enabled" || !process.env.GROQ_API_KEY?.trim()) return fail("UNAVAILABLE", "IA não configurada.");
  const state = await runAction(async ({ services, actor }) => {
    const meeting = await managedMeeting(meetingId, actor, services);
    if (!meeting.ok) return meeting;
    if (meeting.data.status !== "realizada") return fail("INVALID_STATE", "Marque a reunião como realizada antes de preparar a ata.");
    const transcript = meeting.data.transcript?.trim() ?? "";
    if (transcript.length < 20 || transcript.length > 20000) return fail("VALIDATION", "A transcrição registrada precisa ter entre 20 e 20.000 caracteres.");
    const result = await generateText({
      model: groq("openai/gpt-oss-20b"), temperature: 0, abortSignal: AbortSignal.timeout(15_000),
      providerOptions: { groq: { reasoningFormat: "hidden", reasoningEffort: "low" } },
      system: "Redija uma PROPOSTA de ata de reunião em português do Brasil. Use apenas a transcrição fornecida. Não invente participantes, deliberações, datas ou decisões. Indique pontos inaudíveis como [revisar]. O texto será revisado por uma pessoa antes de salvar. Responda só com o texto da ata.",
      prompt: `Reunião: ${meeting.data.title}\nTranscrição:\n${transcript.trim()}`,
    });
    const draft = result.text.trim().slice(0, 20000);
    return draft.length >= 5 ? ok(draft) : fail("UNAVAILABLE", "A IA não retornou uma proposta válida.");
  }, "Proposta gerada para revisão.");
  return state.status === "success" && state.data ? ok(state.data) : fail("UNAVAILABLE", state.status === "error" ? state.message : "Não foi possível gerar a proposta.");
}
