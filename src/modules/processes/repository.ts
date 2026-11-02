import type { Result } from "@/shared/lib/result";
import type { AdministrativeProcess } from "./schemas";

/** Port de persistência de processos. A unicidade (conselho, número, ano) é garantida pelo banco. */
export interface ProcessRepository {
  /** CONFLICT quando (conselho, número, ano) já existe. */
  insert(process: AdministrativeProcess): Promise<Result<AdministrativeProcess>>;
  findById(id: string): Promise<AdministrativeProcess | null>;
  listByCouncils(councilIds: readonly string[] | "all"): Promise<AdministrativeProcess[]>;
  update(id: string, changes: Partial<AdministrativeProcess>): Promise<AdministrativeProcess | null>;
}
