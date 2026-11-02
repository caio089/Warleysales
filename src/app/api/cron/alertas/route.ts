import { createCronHandler } from "@/server/cron/handler";

export const GET = createCronHandler({
  jobName: "alertas-vencimento",
  run: (services) => services.notifications.generateExpiryAlerts(),
});
