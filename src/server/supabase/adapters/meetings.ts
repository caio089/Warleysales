import type { SupabaseClient } from "@supabase/supabase-js";
import type { MeetingStatus } from "@/modules/meetings/domain/meeting-status";
import type { MeetingRepository } from "@/modules/meetings/repository";
import type { Meeting, MeetingDetails } from "@/modules/meetings/schemas";
import { callRpc, selectAll, toDate, toDateOrNull, toIso, toIsoOrNull, unwrap } from "../db";

interface MeetingRow {
  id: string;
  council_id: string;
  title: string;
  scheduled_at: string;
  status: MeetingStatus;
  minutes_text: string | null;
  minutes_registered_by: string | null;
  minutes_registered_at: string | null;
  audio_path: string | null;
  transcript_text: string | null;
  created_by: string;
  responsible_id: string | null;
  agenda: string | null;
  decisions: string | null;
  participant_ids: string[];
  attachment_ids: string[];
  meeting_attendance: { participant_id: string; recorded_by: string; recorded_at: string }[];
  meeting_action_items: { id: string; seq: number; description: string; responsible_id: string | null; due_date: string | null; done: boolean; meeting_task_completions: { completed_by: string; completed_at: string; due_date: string | null } | null }[];
}

const SELECT = "*, meeting_attendance(*), meeting_action_items(*, meeting_task_completions(*))";

const toMeeting = (row: MeetingRow): Meeting => ({
  id: row.id,
  councilId: row.council_id,
  title: row.title,
  scheduledAt: toDate(row.scheduled_at),
  status: row.status,
  minutes: row.minutes_text && row.minutes_registered_by && row.minutes_registered_at
    ? { text: row.minutes_text, registeredBy: row.minutes_registered_by, registeredAt: toDateOrNull(row.minutes_registered_at) as Date }
    : null,
  audioPath: row.audio_path,
  transcript: row.transcript_text,
  actionItems: [...row.meeting_action_items].sort((a, b) => a.seq - b.seq).map((i) => ({
    completion: i.meeting_task_completions ? { actorId: i.meeting_task_completions.completed_by, at: toDate(i.meeting_task_completions.completed_at), dueDate: i.meeting_task_completions.due_date } : undefined,
    id: i.id, description: i.description, responsibleId: i.responsible_id, dueDate: i.due_date, done: i.done,
  })),
  createdBy: row.created_by,
  responsibleId: row.responsible_id,
  agenda: row.agenda,
  decisions: row.decisions,
  participantIds: row.participant_ids ?? [],
  attachmentIds: row.attachment_ids ?? [],
  attendance: row.meeting_attendance.map((a) => ({ participantId: a.participant_id, recordedBy: a.recorded_by, at: toDate(a.recorded_at) })),
});

const toPayload = (m: Meeting) => ({
  id: m.id, council_id: m.councilId, title: m.title, scheduled_at: toIso(m.scheduledAt), status: m.status,
  minutes_text: m.minutes?.text ?? null, minutes_registered_by: m.minutes?.registeredBy ?? null,
  minutes_registered_at: toIsoOrNull(m.minutes?.registeredAt ?? null), created_by: m.createdBy,
  action_items: m.actionItems.map((i) => ({ id: i.id, description: i.description, responsible_id: i.responsibleId, due_date: i.dueDate, done: i.done })),
});

export class SupabaseMeetingRepository implements MeetingRepository {
  constructor(private readonly db: SupabaseClient) {}

  async recordEvidence(meetingId: string, actorId: string, targetId: string, kind: "attendance" | "completion") {
    return callRpc<boolean>(this.db, "record_meeting_evidence", {
      p_meeting: meetingId, p_actor: actorId, p_target: targetId, p_kind: kind,
    });
  }

  async insert(meeting: Meeting) {
    await callRpc(this.db, "save_meeting", { p: toPayload(meeting) });
    return meeting;
  }

  async save(meeting: Meeting) {
    await callRpc(this.db, "save_meeting", { p: toPayload(meeting) });
    return meeting;
  }

  async findById(id: string) {
    const row = unwrap("meetings.find", await this.db.from("meetings").select(SELECT).eq("id", id).maybeSingle<MeetingRow>());
    return row ? toMeeting(row) : null;
  }

  async updateDetails(id: string, details: MeetingDetails) {
    const { data, error } = await this.db.from("meetings").update({
      title: details.title, responsible_id: details.responsibleId,
      agenda: details.agenda || null, decisions: details.decisions || null,
      participant_ids: details.participantIds, attachment_ids: details.attachmentIds,
    }).eq("id", id).select("id").maybeSingle();
    if (error?.code === "23514") return false;
    if (error) throw error;
    return Boolean(data);
  }

  async listByCouncils(councilIds: readonly string[] | "all") {
    if (councilIds !== "all" && councilIds.length === 0) return [];
    const rows = await selectAll<MeetingRow>("meetings.list", (from, to) => {
      const query = this.db.from("meetings").select(SELECT).order("scheduled_at", { ascending: false }).range(from, to);
      return councilIds === "all" ? query : query.in("council_id", [...councilIds]);
    });
    return rows.map(toMeeting);
  }
}
