import type { CleanupRun, RetentionAuthorization, RetentionHold } from "./schemas";

export interface RetentionRepository {
  addAuthorization(authorization: RetentionAuthorization): Promise<RetentionAuthorization>;
  hasAuthorization(processId: string): Promise<boolean>;
  addHold(hold: RetentionHold): Promise<RetentionHold>;
  releaseHold(holdId: string, at: Date): Promise<boolean>;
  listActiveHolds(): Promise<RetentionHold[]>;
  countActiveHolds(processId: string): Promise<number>;
  hasRun(key: string): Promise<boolean>;
  /** Registra a conclusão de uma execução (chave única = idempotência). */
  recordRun(run: CleanupRun): Promise<void>;
}
