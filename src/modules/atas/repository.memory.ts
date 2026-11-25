import { MemoryTable } from "@/shared/lib/memory-table";
import { fail, ok, type Result } from "@/shared/lib/result";
import type { CommitmentEvent } from "./domain/balance";
import type { AtaRepository } from "./repository";
import type { PriceRegistrationAta } from "./schemas";

export class InMemoryAtaRepository implements AtaRepository {
  private table = new MemoryTable<PriceRegistrationAta>();
  private events = new Map<string, CommitmentEvent[]>();

  async insert(a: PriceRegistrationAta) {
    const duplicate = this.table.all(
      (row) =>
        row.councilId === a.councilId &&
        row.number.trim().toLocaleLowerCase("pt-BR") === a.number.trim().toLocaleLowerCase("pt-BR"),
    );
    if (duplicate.length > 0) {
      return fail("CONFLICT", "Já existe uma ata com este número neste órgão. Altere o número.", {
        number: ["Número já cadastrado."],
      });
    }
    return ok(this.table.insert(a));
  }
  async findById(id: string) { return this.table.get(id); }
  async findByItemId(itemId: string) { return this.table.all((a) => a.items.some((i) => i.id === itemId))[0] ?? null; }
  async listByCouncils(ids: readonly string[] | "all", process?: { id: string; councilId: string }) {
    return this.table.all((a) =>
      (ids === "all" || ids.includes(a.councilId))
      && (!process || a.processId === process.id || (!a.processId && a.councilId === process.councilId)),
    );
  }
  async save(a: PriceRegistrationAta) { this.table.insert(a); return a; }
  async listEvents(itemId: string) { return [...(this.events.get(itemId) ?? [])]; }
  async listEventsByItemIds(itemIds: readonly string[]) {
    const map = new Map<string, CommitmentEvent[]>();
    for (const itemId of itemIds) map.set(itemId, [...(this.events.get(itemId) ?? [])]);
    return map;
  }
  async appendEventAtomically(itemId: string, decide: (events: readonly CommitmentEvent[]) => Result<CommitmentEvent>) {
    const current = this.events.get(itemId) ?? [];
    const decision = decide(current);
    if (decision.ok) this.events.set(itemId, [...current, decision.data]);
    return decision;
  }
}
