import "server-only";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "./config";

/** Cliente com os cookies da requisição (identidade do usuário). Não usa service_role. */
export async function createSessionClient(): Promise<SupabaseClient> {
  const config = getSupabaseConfig();
  if (!config) throw new Error("Supabase não configurado.");
  const store = await cookies();
  return createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Server Components não gravam cookies; o proxy.ts já renova a sessão.
        }
      },
    },
  });
}
