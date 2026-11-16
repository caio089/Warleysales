import { createHash } from "node:crypto";
import type { AppNotification } from "./schemas";
import type { NotificationRepository } from "./repository";

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  idempotencyKey: string;
}

export interface EmailSender {
  send(message: EmailMessage): Promise<void>;
}

export interface EmailDispatchSummary {
  queuedAlerts: number;
  sentEmails: number;
  sentAlerts: number;
  failedAlerts: number;
}

const MAX_ALERTS_PER_RUN = 200;
const MAX_EMAILS_PER_RUN = 40;
const pause = () => new Promise<void>((resolve) => setTimeout(resolve, 550));

function groupByRecipient(alerts: AppNotification[]): AppNotification[][] {
  const groups = new Map<string, AppNotification[]>();
  for (const alert of alerts) {
    const group = groups.get(alert.recipientId) ?? [];
    group.push(alert);
    groups.set(alert.recipientId, group);
  }
  return [...groups.values()]
    .slice(0, MAX_EMAILS_PER_RUN)
    .map((group) => group.sort((a, b) =>
      a.createdAt.getTime() - b.createdAt.getTime() || a.id.localeCompare(b.id),
    ));
}

function digestMessage(alerts: AppNotification[], to: string, link: string): EmailMessage {
  const ids = alerts.map((alert) => alert.id).sort();
  const fingerprint = createHash("sha256").update(ids.join(":"), "utf8").digest("hex");
  const count = alerts.length;
  return {
    to,
    subject: `[Warley] ${count} aviso${count === 1 ? "" : "s"} de contratos e atas`,
    text: [
      `Você tem ${count} novo${count === 1 ? "" : "s"} aviso${count === 1 ? "" : "s"}:`,
      ...alerts.map((alert, index) => `${index + 1}. ${alert.title}\n${alert.body}`),
      `Consulte os detalhes: ${link}`,
    ].join("\n\n"),
    idempotencyKey: `notifications/${fingerprint}`,
  };
}

/** Um resumo por destinatário na execução diária, apenas quando existem avisos pendentes. */
export async function dispatchNotificationEmails(
  repository: NotificationRepository,
  sender: EmailSender,
  recipientEmail: (userId: string) => Promise<string | null>,
  siteUrl: string,
  now: () => Date,
  delay: () => Promise<void> = pause,
): Promise<EmailDispatchSummary> {
  const link = new URL("/alertas", siteUrl).toString();
  const pending = await repository.listPendingEmails(MAX_ALERTS_PER_RUN);
  const groups = groupByRecipient(pending);
  let sentEmails = 0;
  let sentAlerts = 0;
  let failedAlerts = 0;

  for (const [index, alerts] of groups.entries()) {
    if (index > 0) await delay();
    const ids = alerts.map((alert) => alert.id);
    let to: string | null;
    try {
      to = await recipientEmail(alerts[0]!.recipientId);
      if (!to) throw new Error("Destinatário sem e-mail no Auth.");
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Falha ao consultar destinatário.";
      await repository.markEmailFailed(ids, now(), reason);
      failedAlerts += ids.length;
      continue;
    }

    try {
      await sender.send(digestMessage(alerts, to, link));
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Falha desconhecida.";
      await repository.markEmailFailed(ids, now(), reason);
      failedAlerts += ids.length;
      // Evita insistir no provedor durante indisponibilidade ou limite de envio.
      break;
    }

    await repository.markEmailSent(ids, now());
    sentEmails += 1;
    sentAlerts += ids.length;
  }
  return { queuedAlerts: pending.length, sentEmails, sentAlerts, failedAlerts };
}
