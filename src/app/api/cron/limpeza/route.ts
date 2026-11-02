import { createCronHandler } from "@/server/cron/handler";

export const GET = createCronHandler({
  jobName: "limpeza-retencao",
  run: (services) => services.retention.runCleanup(),
});
