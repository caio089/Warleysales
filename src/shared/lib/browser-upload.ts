import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/server/supabase/config";
import { fail, ok, type Result } from "@/shared/lib/result";

const BUCKET = "process-documents";

/** SHA-256 (hex) do arquivo, calculado no navegador para o servidor conferir na confirmação. */
export async function sha256Hex(file: Blob): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Envia o arquivo direto ao bucket privado usando o token assinado emitido pelo servidor.
 * Usa só a chave publicável; o token autoriza apenas o caminho definido pelo servidor, uma única vez.
 */
export async function uploadToSignedUrl(path: string, token: string, file: File, mime: string): Promise<Result<true>> {
  const config = getSupabaseConfig();
  if (!config) return fail("UNAVAILABLE", "Armazenamento não configurado.");
  const client = createClient(config.url, config.publishableKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await client.storage.from(BUCKET).uploadToSignedUrl(path, token, file, { contentType: mime });
  return error ? fail("INTERNAL", "Falha ao enviar o arquivo ao armazenamento. Tente novamente.") : ok(true);
}
