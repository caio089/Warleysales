import type { AuditEntry, NewAuditEntry } from "./schemas";

/** Port de auditoria: somente acrescenta e consulta. Não há update/delete por design. */
export interface AuditRepository {
  append(entry: NewAuditEntry): Promise<AuditEntry>;
  list(filter: { councilIds: readonly string[] | "all"; entity?: string; entityId?: string }): Promise<AuditEntry[]>;
}
