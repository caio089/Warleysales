import { log } from "@/shared/lib/logger";
import { authorize, readableCouncilIds, type Actor } from "@/shared/lib/authz/policy";
import { ok, type Result } from "@/shared/lib/result";
import type { AuditRepository } from "./repository";
import type { AuditEntry, NewAuditEntry } from "./schemas";

/** Contrato mínimo usado por todos os serviços para auditar. */
export interface AuditRecorder {
  record(entry: NewAuditEntry): Promise<void>;
}

export class AuditService implements AuditRecorder {
  constructor(private readonly repository: AuditRepository) {}

  /** Nunca lança: falha de auditoria é logada, mas não derruba a operação principal já concluída. */
  async record(entry: NewAuditEntry): Promise<void> {
    try {
      await this.repository.append(entry);
    } catch (error) {
      log("error", "audit.append_failed", { action: entry.action, entity: entry.entity, error: String(error) });
    }
  }

  /** Admin central vê tudo; gestor, apenas seus conselhos (matriz §6). */
  async list(actor: Actor, filter: { councilId?: string; entity?: string; entityId?: string } = {}): Promise<Result<AuditEntry[]>> {
    const authorization = authorize(actor, "audit.view", filter.councilId);
    if (!authorization.ok) {
      // Gestor sem filtro de conselho: lista apenas os conselhos em que é gestor.
      const managed = actor.memberships.filter((m) => m.role === "council_manager").map((m) => m.councilId);
      if (filter.councilId || managed.length === 0) return authorization;
      return ok(await this.repository.list({ councilIds: managed, entity: filter.entity, entityId: filter.entityId }));
    }
    const scope = filter.councilId ? [filter.councilId] : readableCouncilIds(actor);
    return ok(await this.repository.list({ councilIds: scope, entity: filter.entity, entityId: filter.entityId }));
  }
}
