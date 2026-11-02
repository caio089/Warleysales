import "server-only";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import type { Actor } from "@/shared/lib/authz/policy";
import type { ErrorCode, Result } from "@/shared/lib/result";
import type { Services } from "./container";
import { getServices } from "./runtime";
import { getSession } from "./session";

export type ScreenResult<T> =
  | { kind: "ok"; data: T }
  | { kind: "unconfigured" }
  | { kind: "forbidden"; message: string }
  | { kind: "not_found"; message: string }
  | { kind: "error"; message: string };

export interface ScreenContext {
  services: Services;
  actor: Actor;
}

const toScreenError = (code: ErrorCode, message: string): ScreenResult<never> => {
  if (code === "FORBIDDEN") return { kind: "forbidden", message };
  if (code === "NOT_FOUND") return { kind: "not_found", message };
  if (code === "UNAVAILABLE") return { kind: "unconfigured" };
  return { kind: "error", message };
};

/**
 * Carrega os dados de uma tela. Sem fonte de dados => "unconfigured" (estado honesto);
 * sem sessão => redireciona ao login; erros viram estados de tela, sem vazar detalhes internos.
 */
export async function loadScreen<T>(load: (context: ScreenContext) => Promise<Result<T>>): Promise<ScreenResult<T>> {
  await connection();
  const services = getServices();
  if (!services) return { kind: "unconfigured" };

  const session = await getSession();
  if (session.status !== "authenticated") redirect("/login");

  try {
    const result = await load({ services, actor: session.actor });
    return result.ok ? { kind: "ok", data: result.data } : toScreenError(result.code, result.message);
  } catch {
    return { kind: "error", message: "Não foi possível carregar os dados. Tente novamente." };
  }
}
