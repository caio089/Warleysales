import type { AuditRecorder } from "@/modules/audit/service";
import type { Actor } from "@/shared/lib/authz/policy";
import { log } from "@/shared/lib/logger";
import { fail, ok, type Result } from "@/shared/lib/result";
import { idSchema, parseInput, type RuntimeDeps } from "@/shared/lib/service-support";
import { toFortalezaDate } from "@/shared/lib/time";
import { z } from "zod";
import { dedupKey, selectDueAlerts, type AlertCandidate } from "./domain/milestones";
import type { AlertSource, NotificationRepository } from "./repository";
import type { AppNotification } from "./schemas";

export interface AlertRunSummary {
  today: string;
  candidates: number;
  created: number;
}

const markReadSchema = z.object({ notificationId: idSchema });

export class NotificationService {
  constructor(
    private readonly repository: NotificationRepository,
    private readonly source: AlertSource,
    private readonly audit: AuditRecorder,
    private readonly runtime: RuntimeDeps,
  ) {}

  /**
   * Job de alertas (marcos 90/60/30/15/7/0). Usa o dia civil de Fortaleza (R15) e é
   * idempotente: a chave única (tipo, entidade, destinatário, marco) impede repetição.
   */
  async generateExpiryAlerts(): Promise<AlertRunSummary> {
    const today = toFortalezaDate(this.runtime.now());
    const items = await this.source.listExpiring();
    const labels = new Map(items.map((i) => [`${i.entityType}:${i.entityId}`, i.label]));

    const candidates: AlertCandidate[] = [];
    for (const item of items) {
      for (const recipientId of await this.source.recipientsFor(item.councilId)) {
        candidates.push({ entityType: item.entityType, entityId: item.entityId, endDate: item.endDate, recipientId });
      }
    }

    const due = selectDueAlerts(candidates, today, await this.repository.existingKeys(candidates.flatMap((c) => [90, 60, 30, 15, 7, 0].map((m) => dedupKey(c, m as 0)))));
    let created = 0;
    for (const alert of due) {
      const label = labels.get(`${alert.candidate.entityType}:${alert.candidate.entityId}`) ?? "Item";
      const inserted = await this.repository.insertIfAbsent({
        id: this.runtime.newId(), recipientId: alert.candidate.recipientId, dedupKey: alert.key,
        entityType: alert.candidate.entityType, entityId: alert.candidate.entityId, milestone: alert.milestone,
        title: alert.daysRemaining < 0 ? `${label} vencido` : `${label} vence em ${alert.daysRemaining} dia(s)`,
        body: `Vigência até ${alert.candidate.endDate}. Providencie a renovação ou o encerramento.`,
        readAt: null, createdAt: this.runtime.now(),
      });
      if (inserted) created += 1;
    }
    log("info", "notifications.expiry_alerts", { today, candidates: candidates.length, created });
    return { today, candidates: candidates.length, created };
  }

  async listMine(actor: Actor): Promise<Result<{ items: AppNotification[]; unread: number }>> {
    const items = await this.repository.listForUser(actor.userId);
    return ok({ items, unread: items.filter((n) => !n.readAt).length });
  }

  /** Só o próprio destinatário marca como lida. */
  async markRead(actor: Actor, input: unknown): Promise<Result<true>> {
    const parsed = parseInput(markReadSchema, input);
    if (!parsed.ok) return parsed;
    const done = await this.repository.markRead(parsed.data.notificationId, actor.userId, this.runtime.now());
    return done ? ok(true) : fail("NOT_FOUND", "Notificação não encontrada.");
  }
}
