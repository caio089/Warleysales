import type { AuditRepository } from "./repository";
import type { AuditEntry, NewAuditEntry } from "./schemas";

/** Implementação em memória (somente testes). Append-only. */
export class InMemoryAuditRepository implements AuditRepository {
  private entries: AuditEntry[] = [];
  constructor(private readonly clock: () => Date = () => new Date()) {}

  async append(entry: NewAuditEntry): Promise<AuditEntry> {
    const saved: AuditEntry = { ...entry, id: String(this.entries.length + 1), createdAt: this.clock() };
    this.entries.push(saved);
    return saved;
  }

  async list(filter: { councilIds: readonly string[] | "all"; entity?: string; entityId?: string }): Promise<AuditEntry[]> {
    return this.entries.filter(
      (e) =>
        (filter.councilIds === "all" || (e.councilId !== null && filter.councilIds.includes(e.councilId))) &&
        (!filter.entity || e.entity === filter.entity) &&
        (!filter.entityId || e.entityId === filter.entityId),
    );
  }

  /** Auxiliar de teste. */
  all(): readonly AuditEntry[] {
    return this.entries;
  }
}
