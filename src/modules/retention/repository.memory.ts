import type { RetentionRepository } from "./repository";
import type { CleanupRun, RetentionAuthorization, RetentionHold } from "./schemas";

export class InMemoryRetentionRepository implements RetentionRepository {
  private authorizations: RetentionAuthorization[] = [];
  private holds: RetentionHold[] = [];
  private runs = new Map<string, CleanupRun>();

  async addAuthorization(a: RetentionAuthorization) { this.authorizations.push(a); return a; }
  async hasAuthorization(processId: string) { return this.authorizations.some((a) => a.processId === processId); }
  async addHold(h: RetentionHold) { this.holds.push(h); return h; }
  async releaseHold(holdId: string, at: Date) {
    const hold = this.holds.find((h) => h.id === holdId && h.releasedAt === null);
    if (!hold) return false;
    hold.releasedAt = at;
    return true;
  }
  async listActiveHolds() { return this.holds.filter((h) => h.releasedAt === null); }
  async countActiveHolds(processId: string) { return this.holds.filter((h) => h.processId === processId && h.releasedAt === null).length; }
  async hasRun(key: string) { return this.runs.has(key); }
  async recordRun(run: CleanupRun) { this.runs.set(run.key, run); }
}
