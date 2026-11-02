/**
 * Variáveis públicas do Supabase (URL e chave publicável). Validadas sem expor valores.
 * Aceita NEXT_PUBLIC_SUPABASE_ANON_KEY como fallback legado. Os acessos precisam ser literais
 * (`process.env.NEXT_PUBLIC_*`) para o Next.js inlinar os valores no bundle do navegador.
 */
export function getSupabaseConfig(): { url: string; publishableKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && publishableKey ? { url, publishableKey } : null;
}

export const isSupabaseConfigured = (): boolean => getSupabaseConfig() !== null;
