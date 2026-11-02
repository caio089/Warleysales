import "server-only";
import type { Result } from "@/shared/lib/result";
import { fail } from "@/shared/lib/result";
import { isSupabaseConfigured } from "./supabase/config";
import { supabaseAuthGateway } from "./supabase/auth";

/** Operações de autenticação (login por convite/senha, recuperação, logout). */
export interface AuthGateway {
  signIn(email: string, password: string): Promise<Result<true>>;
  sendPasswordRecovery(email: string): Promise<Result<true>>;
  signOut(): Promise<void>;
}

export function getAuthGateway(): AuthGateway | null {
  return isSupabaseConfigured() ? supabaseAuthGateway : null;
}

export const authUnavailable = () => fail("UNAVAILABLE", "Autenticação não configurada neste ambiente.");
