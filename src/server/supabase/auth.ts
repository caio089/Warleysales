import "server-only";
import { fail } from "@/shared/lib/result";
import type { AuthGateway } from "../auth-gateway";

/** PLACEHOLDER da onda 4; implementação com @supabase/ssr na onda final. */
export const supabaseAuthGateway: AuthGateway = {
  signIn: async () => fail("UNAVAILABLE", "Autenticação ainda não integrada."),
  sendPasswordRecovery: async () => fail("UNAVAILABLE", "Autenticação ainda não integrada."),
  signOut: async () => undefined,
};
