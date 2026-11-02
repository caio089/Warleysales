import { log } from "@/shared/lib/logger";
import { toFortalezaDate } from "@/shared/lib/time";

/** Registro de execuções agendadas: a chave única (job + janela) é o lock/idempotência. */
export interface JobRunRepository {
  /** Tenta reservar a janela. Retorna `false` se outra execução já a reservou (atômico: INSERT ... ON CONFLICT DO NOTHING). */
  tryStart(jobName: string, windowKey: string, startedAt: Date): Promise<boolean>;
  finish(jobName: string, windowKey: string, outcome: { status: "success" | "failed"; summary?: unknown; finishedAt: Date }): Promise<void>;
}

export type JobOutcome =
  | { status: "executed"; summary: unknown }
  | { status: "skipped"; reason: "already_ran" }
  | { status: "failed"; message: string };

/**
 * Executa o job no máximo uma vez por janela diária (fuso de Fortaleza).
 * Reexecuções (retries do agendador, chamadas duplicadas) são ignoradas com segurança.
 */
export async function runScheduledJob(
  jobName: string,
  job: () => Promise<unknown>,
  deps: { runs: JobRunRepository; now: () => Date },
): Promise<JobOutcome> {
  const startedAt = deps.now();
  const windowKey = toFortalezaDate(startedAt);
  if (!(await deps.runs.tryStart(jobName, windowKey, startedAt))) {
    log("info", "job.ignorado", { jobName, windowKey, reason: "already_ran" });
    return { status: "skipped", reason: "already_ran" };
  }
  try {
    const summary = await job();
    await deps.runs.finish(jobName, windowKey, { status: "success", summary, finishedAt: deps.now() });
    log("info", "job.concluido", { jobName, windowKey, summary });
    return { status: "executed", summary };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido.";
    log("error", "job.falhou", { jobName, windowKey, message });
    // A janela fica marcada como falha; reprocessamento é manual (decisão consciente: evita laços de repetição).
    await deps.runs.finish(jobName, windowKey, { status: "failed", summary: { message }, finishedAt: deps.now() }).catch(() => undefined);
    return { status: "failed", message };
  }
}

/** Implementação em memória, somente para testes. */
export class MemoryJobRunRepository implements JobRunRepository {
  readonly runs = new Map<string, { status: "running" | "success" | "failed"; summary?: unknown }>();
  async tryStart(jobName: string, windowKey: string): Promise<boolean> {
    const key = `${jobName}:${windowKey}`;
    if (this.runs.has(key)) return false;
    this.runs.set(key, { status: "running" });
    return true;
  }
  async finish(jobName: string, windowKey: string, outcome: { status: "success" | "failed"; summary?: unknown }): Promise<void> {
    this.runs.set(`${jobName}:${windowKey}`, { status: outcome.status, summary: outcome.summary });
  }
}
