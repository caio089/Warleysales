import type { AuditRecorder } from "@/modules/audit/service";
import type { Result } from "../result";
import { authorize, type Actor, type PermissionAction } from "./policy";

/**
 * Autoriza e, em caso de negativa, registra tentativa negada na auditoria (§ segurança).
 * Serviços chamam `guard` antes de qualquer leitura/escrita sensível.
 */
export async function guard(
  audit: AuditRecorder,
  actor: Actor,
  action: PermissionAction,
  councilId: string | undefined,
  entity: string,
  entityId?: string,
): Promise<Result<true>> {
  const result = authorize(actor, action, councilId);
  if (!result.ok) {
    await audit.record({
      actorId: actor.userId,
      action,
      entity,
      entityId: entityId ?? null,
      councilId: councilId ?? null,
      result: "denied",
      details: {},
    });
  }
  return result;
}
