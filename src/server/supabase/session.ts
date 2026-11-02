import "server-only";
import type { Actor, Membership } from "@/shared/lib/authz/policy";
import type { CouncilRole } from "@/shared/lib/authz/navigation";
import { log } from "@/shared/lib/logger";
import type { SessionState } from "../session";
import { getServiceClient } from "./client";
import { createSessionClient } from "./session-client";

interface ProfileRow {
  full_name: string;
  is_central_admin: boolean;
  is_special_deleter: boolean;
  active: boolean;
}

/**
 * Resolve o ator a partir do JWT VERIFICADO (getClaims valida a assinatura) e das tabelas protegidas
 * `profiles`/`council_memberships`. Nada de user_metadata nem de dados enviados pelo cliente (R14).
 */
export async function resolveActorFromSession(): Promise<SessionState> {
  try {
    const session = await createSessionClient();
    const { data, error } = await session.auth.getClaims();
    const userId = data?.claims?.sub;
    if (error || !userId) return { status: "anonymous" };

    const admin = getServiceClient();
    const profileResponse = await admin.from("profiles").select("full_name, is_central_admin, is_special_deleter, active").eq("id", userId).maybeSingle<ProfileRow>();
    const profile = profileResponse.data;
    if (profileResponse.error || !profile || !profile.active) return { status: "anonymous" }; // inativo = sem acesso

    const membershipsResponse = await admin.from("council_memberships").select("council_id, role").eq("user_id", userId).returns<{ council_id: string; role: CouncilRole }[]>();
    if (membershipsResponse.error) throw new Error(membershipsResponse.error.message);
    const memberships: Membership[] = (membershipsResponse.data ?? []).map((m) => ({ councilId: m.council_id, role: m.role }));

    const actor: Actor = { userId, isCentralAdmin: profile.is_central_admin, isSpecialDeleter: profile.is_special_deleter, memberships };
    const email = typeof data.claims.email === "string" ? data.claims.email : "";
    return { status: "authenticated", actor, displayName: profile.full_name.trim() || email || "Usuário" };
  } catch (error) {
    log("error", "sessao.falha", { message: error instanceof Error ? error.message : "desconhecido" });
    return { status: "anonymous" };
  }
}
