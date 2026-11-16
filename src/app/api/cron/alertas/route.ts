import { createCronHandler } from "@/server/cron/handler";
import { createResendSender } from "@/server/email/resend";
import { getServiceClient } from "@/server/supabase/client";

export const GET = createCronHandler({
  jobName: "alertas-vencimento",
  run: async (services) => {
    const alerts = await services.notifications.generateExpiryAlerts();
    const apiKey = process.env.RESEND_API_KEY?.trim();
    const from = process.env.RESEND_FROM?.trim();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    if (!apiKey || !from || !siteUrl) return { ...alerts, email: { status: "not_configured" } };

    const db = getServiceClient();
    const email = await services.notifications.dispatchEmails(
      createResendSender(apiKey, from),
      async (userId) => {
        const { data, error } = await db.auth.admin.getUserById(userId);
        if (error) throw error;
        return data.user?.email ?? null;
      },
      siteUrl,
    );
    return { ...alerts, email };
  },
});
