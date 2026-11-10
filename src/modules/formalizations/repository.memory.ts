import type { FormalizationFilter, FormalizationRepository } from "./repository";
import type { ProcessFormalization } from "./domain/formalization";

export class InMemoryFormalizationRepository implements FormalizationRepository {
  private items = new Map<string, ProcessFormalization>();

  async insert(formalization: ProcessFormalization): Promise<ProcessFormalization> {
    this.items.set(formalization.id, { ...formalization });
    return { ...formalization };
  }

  async findByProcessId(processId: string): Promise<ProcessFormalization | null> {
    for (const item of this.items.values()) {
      if (item.processId === processId) {
        return { ...item };
      }
    }
    return null;
  }

  async findById(id: string): Promise<ProcessFormalization | null> {
    const item = this.items.get(id);
    return item ? { ...item } : null;
  }

  async update(
    id: string,
    patch: Partial<Pick<ProcessFormalization, "status" | "homologatedBy" | "homologatedAt" | "homologationNote">>,
  ): Promise<ProcessFormalization> {
    const existing = this.items.get(id);
    if (!existing) {
      throw new Error(`Formalization with id ${id} not found`);
    }
    const updated: ProcessFormalization = {
      ...existing,
      ...patch,
    };
    this.items.set(id, updated);
    return { ...updated };
  }

  async listByCouncils(
    councilIds: readonly string[] | "all",
    filter?: FormalizationFilter,
  ): Promise<ProcessFormalization[]> {
    const all = Array.from(this.items.values());
    return all.filter((item) => {
      if (councilIds !== "all" && !councilIds.includes(item.councilId)) {
        return false;
      }
      if (filter?.status && item.status !== filter.status) {
        return false;
      }
      return true;
    });
  }
}
