import { MemoryTable } from "@/shared/lib/memory-table";
import type { Result } from "@/shared/lib/result";
import type { CommitmentEvent } from "./domain/balance";
import type { AtaRepository } from "./repository";
import type { PriceRegistrationAta } from "./schemas";

export class InMemoryAtaRepository implements AtaRepository {
  private table = new MemoryTable<PriceRegistrationAta>();
  private events = new Map<string, CommitmentEvent[]>();

  async insert(a: PriceRegistrationAta) { return this.table.insert(a); }
  async findById(id: string) { return this.table.get(id); }
  async findByItemId(itemId: string) { return this.table.all((a) => a.items.some((i) => i.id === itemId))[0] ?? null; }
  async listByCouncils(ids: readonly string[] | "all") { return this.table.all((a) => ids === "all" || ids.includes(a.councilId)); }
  async save(a: PriceRegistrationAta) { this.table.insert(a); return a; }
  async listEvents(itemId: string) { return [...(this.events.get(itemId) ?? [])]; }
  async appendEventAtomically(itemId: string, decide: (events: readonly CommitmentEvent[]) => Result<CommitmentEvent>) {
    const current = this.events.get(itemId) ?? [];
    const decision = decide(current);
    if (decision.ok) this.events.set(itemId, [...current, decision.data]);
    return decision;
  }
}
