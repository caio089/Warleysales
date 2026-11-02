import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "@/server/supabase/config";

/**
 * Renova o token de sessão do Supabase a cada navegação e repassa os cookies atualizados.
 * Não decide autorização: isso é feito no servidor (loadScreen/runAction) a partir das tabelas protegidas.
 */
export async function proxy(request: NextRequest) {
  const config = getSupabaseConfig();
  if (!config) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  // getClaims valida a assinatura do JWT e dispara a renovação quando necessário.
  await supabase.auth.getClaims();
  return response;
}

export const config = {
  // Ignora estáticos e imagens; cron usa Bearer próprio e não precisa de sessão.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/cron|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
