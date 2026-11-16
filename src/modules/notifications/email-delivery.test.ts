import { describe, expect, it, vi } from "vitest";
import { InMemoryNotificationRepository } from "./repository.memory";
import { dispatchNotificationEmails, type EmailMessage } from "./email-delivery";

function notification(id: string, recipientId = "user-1") {
  return {
    id,
    recipientId,
    dedupKey: `contract:${id}:${recipientId}:30`,
    entityType: "contract" as const,
    entityId: id,
    milestone: 30 as const,
    title: "Contrato vence em 30 dias",
    body: "Vigência até 2026-12-16.",
    readAt: null,
    createdAt: new Date("2026-11-16T12:00:00Z"),
  };
}

describe("entrega de avisos por e-mail", () => {
  it("consolida avisos do mesmo gestor em um e-mail e marca todos como enviados", async () => {
    const repo = new InMemoryNotificationRepository();
    await repo.insertIfAbsent(notification("notice-1"));
    await repo.insertIfAbsent(notification("notice-2"));
    const sent: EmailMessage[] = [];
    const send = vi.fn(async (message: EmailMessage) => { sent.push(message); });
    const deliver = () => dispatchNotificationEmails(
      repo, { send }, async () => "gestor@example.org", "https://warley.example.org",
      () => new Date("2026-11-16T12:01:00Z"), async () => undefined,
    );

    expect(await deliver()).toEqual({ queuedAlerts: 2, sentEmails: 1, sentAlerts: 2, failedAlerts: 0 });
    expect(await deliver()).toEqual({ queuedAlerts: 0, sentEmails: 0, sentAlerts: 0, failedAlerts: 0 });
    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({ to: "gestor@example.org", subject: "[Warley] 2 avisos de contratos e atas" });
    expect(sent[0]?.idempotencyKey).toMatch(/^notifications\/[a-f0-9]{64}$/);
    expect(sent[0]?.text).toContain("Você tem 2 novos avisos");
    expect(sent[0]?.text).toContain("https://warley.example.org/alertas");
  });

  it("mantém aviso pendente para nova tentativa quando o provedor falha", async () => {
    const repo = new InMemoryNotificationRepository();
    await repo.insertIfAbsent(notification("notice-2"));
    const send = vi.fn().mockRejectedValueOnce(new Error("indisponível")).mockResolvedValue(undefined);
    const deliver = () => dispatchNotificationEmails(
      repo, { send }, async () => "gestor@example.org", "https://warley.example.org",
      () => new Date(), async () => undefined,
    );

    expect(await deliver()).toEqual({ queuedAlerts: 1, sentEmails: 0, sentAlerts: 0, failedAlerts: 1 });
    expect(await deliver()).toEqual({ queuedAlerts: 1, sentEmails: 1, sentAlerts: 1, failedAlerts: 0 });
    expect(send).toHaveBeenCalledTimes(2);
    expect(send.mock.calls[0]?.[0].idempotencyKey).toBe(send.mock.calls[1]?.[0].idempotencyKey);
  });

  it("não envia quando o usuário não possui e-mail", async () => {
    const repo = new InMemoryNotificationRepository();
    await repo.insertIfAbsent(notification("notice-3"));
    const send = vi.fn();
    const summary = await dispatchNotificationEmails(
      repo, { send }, async () => null, "https://warley.example.org",
      () => new Date(), async () => undefined,
    );
    expect(summary).toEqual({ queuedAlerts: 1, sentEmails: 0, sentAlerts: 0, failedAlerts: 1 });
    expect(send).not.toHaveBeenCalled();
  });

  it("envia resumos separados por gestor e não envia sem avisos", async () => {
    const repo = new InMemoryNotificationRepository();
    await repo.insertIfAbsent(notification("notice-a", "user-a"));
    await repo.insertIfAbsent(notification("notice-b", "user-b"));
    const send = vi.fn(async () => undefined);
    const resolve = vi.fn(async (userId: string) => `${userId}@example.org`);
    const deliver = () => dispatchNotificationEmails(
      repo, { send }, resolve, "https://warley.example.org",
      () => new Date(), async () => undefined,
    );
    expect(await deliver()).toEqual({ queuedAlerts: 2, sentEmails: 2, sentAlerts: 2, failedAlerts: 0 });
    expect(send).toHaveBeenCalledTimes(2);
    expect(resolve).toHaveBeenCalledTimes(2);
    expect(await deliver()).toEqual({ queuedAlerts: 0, sentEmails: 0, sentAlerts: 0, failedAlerts: 0 });
  });
});
