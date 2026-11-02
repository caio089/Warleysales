/** Registros de retenção (P2): autorização formal e bloqueios por processo. */
export interface RetentionAuthorization {
  id: string;
  processId: string;
  authorizedBy: string;
  reference: string; // nº do ato/tabela de temporalidade
  createdAt: Date;
}

export interface RetentionHold {
  id: string;
  processId: string;
  reason: string;
  createdBy: string;
  releasedAt: Date | null;
}

/** Execução de limpeza por processo; `key` garante idempotência (um registro por conclusão). */
export interface CleanupRun {
  key: string;
  processId: string;
  outcome: "archived" | "disposed" | "skipped";
  at: Date;
}
