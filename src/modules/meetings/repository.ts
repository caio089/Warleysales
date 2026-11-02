import type { Meeting } from "./schemas";

export interface MeetingRepository {
  insert(meeting: Meeting): Promise<Meeting>;
  findById(id: string): Promise<Meeting | null>;
  listByCouncils(councilIds: readonly string[] | "all"): Promise<Meeting[]>;
  save(meeting: Meeting): Promise<Meeting>;
}
