import { NextResponse } from "next/server";
import { runScheduledJob, type JobRunRepository } from "@/shared/jobs/job-runner";
import { log } from "@/shared/lib/logger";
import { isCronAuthorized } from "./cron-auth";
import { getServices } from "../runtime";
import { createSupabaseJobRunRepository } from "../supabase/job-runs";
import { isSupabaseConfigured } from "../supabase/config";
import type { Services } from "../container";

interface CronHandlerOptions {
  jobName: string;
  run: (services: Services) => Promise<unknown>;
}

/** Fábrica de Route Handlers de cron: autentica, garante janela única e responde com resumo sem dados sensíveis. */
export function createCronHandler({ jobName, run }: CronHandlerOptions) {
  return async function GET(request: Request): Promise<NextResponse> {
    if (!isCronAuthorized(request.headers.get("authorization"), process.env.CRON_SECRET)) {
      log("warn", "cron.nao_autorizado", { jobName });
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    const services = getServices();
    if (!services || !isSupabaseConfigured()) {
      return NextResponse.json({ error: "Fonte de dados não configurada." }, { status: 503 });
    }
    const runs: JobRunRepository = createSupabaseJobRunRepository();
    const outcome = await runScheduledJob(jobName, () => run(services), { runs, now: () => new Date() });
    return NextResponse.json({ job: jobName, ...outcome }, { status: outcome.status === "failed" ? 500 : 200 });
  };
}
