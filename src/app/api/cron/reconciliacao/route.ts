import { createCronHandler } from "@/server/cron/handler";

export const GET = createCronHandler({
  jobName: "reconciliacao-estoque",
  run: (services) => services.inventory.reconcile(),
});
