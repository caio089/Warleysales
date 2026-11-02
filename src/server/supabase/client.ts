import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./config";

let serviceClient: SupabaseClient | null = null;

/**
 * Cliente com service_role: usado SOMENTE no servidor pelos adapters de repositório.
 * A autorização de negócio é feita nos serviços (policy + guard); o RLS é defesa em profundidade
 * para qualquer acesso direto com a chave publicável. Nunca importar em código de cliente.
 */
export function getServiceClient(): SupabaseClient {
  if (serviceClient) return serviceClient;
  const config = getSupabaseConfig();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!config || !serviceRoleKey) throw new Error("Supabase não configurado (URL ou SUPABASE_SERVICE_ROLE_KEY ausentes).");
  serviceClient = createClient(config.url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  return serviceClient;
}
