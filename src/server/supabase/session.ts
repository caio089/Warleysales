import "server-only";
import type { SessionState } from "../session";

/** PLACEHOLDER da onda 4: leitura de sessão via @supabase/ssr entra na onda final. */
export async function resolveActorFromSession(): Promise<SessionState> {
  return { status: "anonymous" };
}
