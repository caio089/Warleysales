import type { JobRunRepository } from "@/shared/jobs/job-runner";

/** PLACEHOLDER: o adapter real (tabela `scheduled_job_runs`) é implementado na onda final. */
export function createSupabaseJobRunRepository(): JobRunRepository {
  throw new Error("Adapter Supabase de execuções agendadas ainda não implementado.");
}
