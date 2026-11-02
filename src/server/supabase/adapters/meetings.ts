import type { SupabaseClient } from "@supabase/supabase-js";
import type { MeetingStatus } from "@/modules/meetings/domain/meeting-status";
import type { MeetingRepository } from "@/modules/meetings/repository";
import type { Meeting } from "@/modules/meetings/schemas";
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
  created_by: string;
  meeting_action_items: { id: string; seq: number; description: string; responsible_id: string | null; due_date: string | null; done: boolean }[];
}

const SELECT = "*, meeting_action_items(*)";

const toMeeting = (row: MeetingRow): Meeting => ({
  id: row.id,
  councilId: row.council_id,
  title: row.title,
  scheduledAt: toDate(row.scheduled_at),
  status: row.status,
  minutes: row.minutes_text && row.minutes_registered_by && row.minutes_registered_at
    ? { text: row.minutes_text, registeredBy: row.minutes_registered_by, registeredAt: toDateOrNull(row.minutes_registered_at) as Date }
    : null,
  actionItems: [...row.meeting_action_items].sort((a, b) => a.seq - b.seq).map((i) => ({
    id: i.id, description: i.description, responsibleId: i.responsible_id, dueDate: i.due_date, done: i.done,
  })),
  createdBy: row.created_by,
});

const toPayload = (m: Meeting) => ({
  id: m.id, council_id: m.councilId, title: m.title, scheduled_at: toIso(m.scheduledAt), status: m.status,
  minutes_text: m.minutes?.text ?? null, minutes_registered_by: m.minutes?.registeredBy ?? null,
  minutes_registered_at: toIsoOrNull(m.minutes?.registeredAt ?? null), created_by: m.createdBy,
  action_items: m.actionItems.map((i) => ({ id: i.id, description: i.description, responsible_id: i.responsibleId, due_date: i.dueDate, done: i.done })),
});

export class SupabaseMeetingRepository implements MeetingRepository {
  constructor(private readonly db: SupabaseClient) {}

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

  async listByCouncils(councilIds: readonly string[] | "all") {
    if (councilIds !== "all" && councilIds.length === 0) return [];
    const rows = await selectAll<MeetingRow>("meetings.list", (from, to) => {
      const query = this.db.from("meetings").select(SELECT).order("scheduled_at", { ascending: false }).range(from, to);
      return councilIds === "all" ? query : query.in("council_id", [...councilIds]);
    });
    return rows.map(toMeeting);
  }
}
