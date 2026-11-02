import "server-only";
import { fail, ok } from "@/shared/lib/result";
import { log } from "@/shared/lib/logger";
import type { AuthGateway } from "../auth-gateway";
import { createSessionClient } from "./session-client";

const GENERIC_CREDENTIALS_ERROR = "E-mail ou senha inválidos.";

/** URL pública do site para links de e-mail (obrigatória em produção; local usa localhost). */
const siteUrl = (): string => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const supabaseAuthGateway: AuthGateway = {
  async signIn(email, password) {
    try {
      const client = await createSessionClient();
      const { error } = await client.auth.signInWithPassword({ email, password });
      // Mensagem única: não revela se o e-mail existe nem o motivo exato.
      return error ? fail("UNAUTHENTICATED", GENERIC_CREDENTIALS_ERROR) : ok(true as const);
    } catch (error) {
      log("error", "auth.signIn.falha", { message: error instanceof Error ? error.message : "desconhecido" });
      return fail("UNAVAILABLE", "Não foi possível entrar agora. Tente novamente em instantes.");
    }
  },

  async sendPasswordRecovery(email) {
    try {
      const client = await createSessionClient();
      await client.auth.resetPasswordForEmail(email, { redirectTo: `${siteUrl()}/auth/callback?next=/redefinir-senha` });
    } catch (error) {
      log("error", "auth.recuperacao.falha", { message: error instanceof Error ? error.message : "desconhecido" });
    }
    return ok(true as const); // resposta neutra, independente do resultado (anti-enumeração)
  },

  async updatePassword(password) {
    try {
      const client = await createSessionClient();
      const { error } = await client.auth.updateUser({ password });
      return error ? fail("VALIDATION", "Não foi possível definir a senha. O link pode ter expirado.") : ok(true as const);
    } catch {
      return fail("UNAVAILABLE", "Não foi possível definir a senha agora. Tente novamente.");
    }
  },

  async signOut() {
    try {
      const client = await createSessionClient();
      await client.auth.signOut();
    } catch (error) {
      log("warn", "auth.signOut.falha", { message: error instanceof Error ? error.message : "desconhecido" });
    }
  },
};
