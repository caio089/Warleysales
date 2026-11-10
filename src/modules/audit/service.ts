import { log } from "@/shared/lib/logger";
import { authorize, readableCouncilIds, type Actor } from "@/shared/lib/authz/policy";
import { fail, ok, type Result } from "@/shared/lib/result";
import type { AuditRepository } from "./repository";
import type { AuditEntry, AuditFilter, NewAuditEntry } from "./schemas";

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
  async list(actor: Actor, filter: AuditFilter = {}): Promise<Result<AuditEntry[]>> {
    // Gestor restrito aos conselhos onde tem papel council_manager
    const managedCouncils = actor.memberships.filter((m) => m.role === "council_manager").map((m) => m.councilId);

    // Se não for admin central e tentar filtrar conselho específico, valida autorização
    if (filter.councilId) {
      const authorization = authorize(actor, "audit.view", filter.councilId);
      if (!authorization.ok) return authorization;
    } else if (!actor.isCentralAdmin && managedCouncils.length === 0) {
      const authorization = authorize(actor, "audit.view");
      if (!authorization.ok) return authorization;
    }

    // Se filter.councilIds for passado por usuário não-admin, verificar que todos pertencem a managedCouncils
    if (!actor.isCentralAdmin && filter.councilIds) {
      if (filter.councilIds === "all") {
        return fail("FORBIDDEN", "Você não tem permissão para visualizar todos os conselhos.");
      }
      const unauthorized = filter.councilIds.filter((id) => !managedCouncils.includes(id));
      if (unauthorized.length > 0) {
        return fail("FORBIDDEN", "Você não tem permissão para visualizar auditoria deste conselho.");
      }
    }

    let scope: readonly string[] | "all";
    if (filter.councilId) {
      scope = [filter.councilId];
    } else if (filter.councilIds) {
      scope = filter.councilIds;
    } else if (actor.isCentralAdmin) {
      scope = readableCouncilIds(actor);
    } else {
      scope = managedCouncils;
    }

    return ok(await this.repository.list({
      ...filter,
      councilIds: scope,
    }));
  }
}
