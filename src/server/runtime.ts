import "server-only";
import { systemRuntime } from "@/shared/lib/service-support";
import { createServices, type Services } from "./container";
import { createSupabaseRepositories } from "./supabase/repositories";
import { isSupabaseConfigured } from "./supabase/config";

let cached: Services | null = null;

/**
 * Serviços ligados aos adapters reais (Supabase). Retorna `null` quando a fonte de dados
 * não está configurada: as telas então mostram estado honesto, nunca dados simulados.
 */
export function getServices(): Services | null {
  if (!isSupabaseConfigured()) return null;
  cached ??= createServices(createSupabaseRepositories(), systemRuntime);
  return cached;
}
