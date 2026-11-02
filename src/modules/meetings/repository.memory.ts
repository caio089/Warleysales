import { MemoryTable } from "@/shared/lib/memory-table";
import type { MeetingRepository } from "./repository";
import type { Meeting } from "./schemas";

export class InMemoryMeetingRepository implements MeetingRepository {
  private table = new MemoryTable<Meeting>();
  async insert(m: Meeting) { return this.table.insert(m); }
  async findById(id: string) { return this.table.get(id); }
  async listByCouncils(ids: readonly string[] | "all") { return this.table.all((m) => ids === "all" || ids.includes(m.councilId)); }
  async save(m: Meeting) { this.table.insert(m); return m; }
}
