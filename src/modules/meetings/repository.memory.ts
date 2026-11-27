import { MemoryTable } from "@/shared/lib/memory-table";
import type { MeetingRepository } from "./repository";
import type { Meeting, MeetingDetails } from "./schemas";

export class InMemoryMeetingRepository implements MeetingRepository {
  private table = new MemoryTable<Meeting>();
  async insert(m: Meeting) { return this.table.insert(m); }
  async findById(id: string) { return this.table.get(id); }
  async listByCouncils(ids: readonly string[] | "all") { return this.table.all((m) => ids === "all" || ids.includes(m.councilId)); }
  async recordEvidence(meetingId: string, actorId: string, targetId: string, kind: "attendance" | "completion") {
    const meeting = this.table.get(meetingId);
    if (!meeting) return false;
    if (kind === "attendance") {
      if (meeting.status !== "realizada" || meeting.attendance?.some((row) => row.participantId === targetId)) return false;
      this.table.insert({ ...meeting, attendance: [...(meeting.attendance ?? []), { participantId: targetId, recordedBy: actorId, at: new Date() }] });
      return true;
    }
    const item = meeting.actionItems.find((row) => row.id === targetId && !row.done);
    if (!item) return false;
    const completed = { ...item, done: true, completion: { actorId, at: new Date(), dueDate: item.dueDate } };
    this.table.insert({ ...meeting, actionItems: meeting.actionItems.map((row) => row.id === targetId ? completed : row) });
    return true;
  }
  async save(m: Meeting) { this.table.insert(m); return m; }
  async updateDetails(id: string, details: MeetingDetails) {
    const meeting = this.table.get(id);
    if (!meeting) return false;
    this.table.insert({ ...meeting, ...details });
    return true;
  }
}
