import type { AuditEntry, AuditFilter, NewAuditEntry } from "./schemas";

export type { AuditFilter };

/** Port de auditoria: somente acrescenta e consulta. Não há update/delete por design. */
export interface AuditRepository {
  append(entry: NewAuditEntry): Promise<AuditEntry>;
  list(filter: AuditFilter): Promise<AuditEntry[]>;
}
