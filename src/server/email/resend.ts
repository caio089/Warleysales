import "server-only";
import type { EmailSender } from "@/modules/notifications/email-delivery";

/** Transporte HTTP mínimo: não requer SDK e mantém a chave apenas no servidor. */
export function createResendSender(apiKey: string, from: string): EmailSender {
  return {
    async send(message) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": message.idempotencyKey,
        },
        body: JSON.stringify({ from, to: [message.to], subject: message.subject, text: message.text }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) {
        throw new Error(`Resend recusou o e-mail (HTTP ${response.status}).`);
      }
    },
  };
}
