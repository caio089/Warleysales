import type { AuditRepository } from "./repository";
import type { AuditEntry, AuditFilter, NewAuditEntry } from "./schemas";

const parseDateRange = (startDate?: string | Date, endDate?: string | Date) => {
  const start = startDate
    ? typeof startDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(startDate)
      ? new Date(`${startDate}T00:00:00.000Z`)
      : new Date(startDate)
    : null;
  const end = endDate
    ? typeof endDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(endDate)
      ? new Date(`${endDate}T23:59:59.999Z`)
      : new Date(endDate)
    : null;
  return { start, end };
};

/** Implementação em memória (somente testes). Append-only. */
export class InMemoryAuditRepository implements AuditRepository {
  private entries: AuditEntry[] = [];
  constructor(private readonly clock: () => Date = () => new Date()) {}

  async append(entry: NewAuditEntry): Promise<AuditEntry> {
    const saved: AuditEntry = { ...entry, id: String(this.entries.length + 1), createdAt: this.clock() };
    this.entries.push(saved);
    return saved;
  }

  async list(filter: AuditFilter = {}): Promise<AuditEntry[]> {
    const { start, end } = parseDateRange(filter.startDate, filter.endDate);

    return this.entries.filter((e) => {
      if (filter.councilId && e.councilId !== filter.councilId) {
        return false;
      }
      if (filter.councilIds !== undefined && filter.councilIds !== "all") {
        if (!e.councilId || !filter.councilIds.includes(e.councilId)) {
          return false;
        }
      }
      if (filter.entity && e.entity !== filter.entity) {
        return false;
      }
      if (filter.entityId && e.entityId !== filter.entityId) {
        return false;
      }
      if (filter.actorId && e.actorId !== filter.actorId) {
        return false;
      }
      if (filter.action && e.action !== filter.action) {
        return false;
      }
      if (filter.result && e.result !== filter.result) {
        return false;
      }
      if (start && e.createdAt < start) {
        return false;
      }
      if (end && e.createdAt > end) {
        return false;
      }
      return true;
    });
  }

  /** Auxiliar de teste. */
  all(): readonly AuditEntry[] {
    return this.entries;
  }
}
