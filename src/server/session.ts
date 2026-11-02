import "server-only";
import { connection } from "next/server";
import type { Actor } from "@/shared/lib/authz/policy";
import { isSupabaseConfigured } from "./supabase/config";
import { resolveActorFromSession } from "./supabase/session";

export type SessionState =
  | { status: "unconfigured" }
  | { status: "anonymous" }
  | { status: "authenticated"; actor: Actor; displayName: string };

/**
 * Sessão do usuário atual, resolvida SEMPRE no servidor. O papel/conselho vêm das tabelas
 * protegidas (profiles/council_memberships), nunca de user_metadata nem do cliente (R14).
 */
export async function getSession(): Promise<SessionState> {
  await connection();
  if (!isSupabaseConfigured()) return { status: "unconfigured" };
  return resolveActorFromSession();
}
