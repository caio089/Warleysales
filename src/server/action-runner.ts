import "server-only";
import type { Actor } from "@/shared/lib/authz/policy";
import type { Result } from "@/shared/lib/result";
import type { ActionState } from "@/shared/ui/forms/action-state";
import type { Services } from "./container";
import { getServices } from "./runtime";
import { getSession } from "./session";

export interface ActionContext {
  services: Services;
  actor: Actor;
}

/**
 * Executa uma Server Action com sessão, serviços e tratamento de erro padronizados.
 * Retorna ActionState serializável; exceções inesperadas viram mensagem genérica.
 */
export async function runAction<T>(
  execute: (context: ActionContext) => Promise<Result<T>>,
  successMessage: string | ((data: T) => string),
): Promise<ActionState & { data?: T }> {
  const services = getServices();
  if (!services) return { status: "error", message: "Fonte de dados não configurada. A operação não foi realizada." };

  const session = await getSession();
  if (session.status !== "authenticated") return { status: "error", message: "Sua sessão expirou. Entre novamente." };

  try {
    const result = await execute({ services, actor: session.actor });
    if (!result.ok) return { status: "error", message: result.message, fieldErrors: result.fieldErrors };
    return { status: "success", message: typeof successMessage === "function" ? successMessage(result.data) : successMessage, data: result.data };
  } catch {
    return { status: "error", message: "Ocorreu um erro inesperado. Tente novamente em instantes." };
  }
}
