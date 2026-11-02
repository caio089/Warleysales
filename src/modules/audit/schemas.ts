export type AuditResult = "success" | "denied" | "error";

/** Registro de auditoria (append-only; sem update/delete). */
export interface AuditEntry {
  id: string;
  actorId: string | null; // null = identidade técnica (jobs usam actor próprio)
  action: string;
  entity: string;
  entityId: string | null;
  councilId: string | null;
  result: AuditResult;
  details: Record<string, unknown>;
  createdAt: Date;
}

export type NewAuditEntry = Omit<AuditEntry, "id" | "createdAt">;
