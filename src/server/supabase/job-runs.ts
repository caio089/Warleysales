import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { JobRunRepository } from "@/shared/jobs/job-runner";
import { getServiceClient } from "./client";
import { isUniqueViolation, toIso, unwrap } from "./db";

/** Lock por janela: a chave primária (job, janela) faz o INSERT atuar como mutex entre execuções concorrentes. */
export class SupabaseJobRunRepository implements JobRunRepository {
  constructor(private readonly db: SupabaseClient) {}

  async tryStart(jobName: string, windowKey: string, startedAt: Date) {
    const { error } = await this.db.from("scheduled_job_runs").insert({ job_name: jobName, window_key: windowKey, status: "running", started_at: toIso(startedAt) });
    if (isUniqueViolation(error)) return false;
    unwrap("jobs.tryStart", { data: null, error });
    return true;
  }

  async finish(jobName: string, windowKey: string, outcome: { status: "success" | "failed"; summary?: unknown; finishedAt: Date }) {
    unwrap("jobs.finish", await this.db.from("scheduled_job_runs")
      .update({ status: outcome.status, summary: outcome.summary ?? null, finished_at: toIso(outcome.finishedAt) })
      .eq("job_name", jobName).eq("window_key", windowKey));
  }
}

export const createSupabaseJobRunRepository = (): JobRunRepository => new SupabaseJobRunRepository(getServiceClient());
