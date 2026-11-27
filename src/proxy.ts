import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "@/server/supabase/config";

/**
 * Renova o token de sessão do Supabase a cada navegação e repassa os cookies atualizados.
 * O redirecionamento reflete o escopo de navegação. Os serviços conferem as permissões dos dados.
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
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;
  const path = request.nextUrl.pathname;
  const isRequestModule = /^\/solicitacoes(?:\/(?!processos(?:\/|$))[^/]+)?\/?$/.test(path);
  const isAccountRoute = path === "/login" || path === "/redefinir-senha" || path === "/recuperar-senha" || path.startsWith("/auth/");

  if (userId && (request.method === "GET" || request.method === "HEAD") && !isRequestModule && !isAccountRoute && !path.startsWith("/api/")) {
    const [profile, memberships] = await Promise.all([
      supabase.from("profiles").select("is_central_admin").eq("id", userId).maybeSingle(),
      supabase.from("council_memberships").select("role").eq("user_id", userId),
    ]);
    if (profile.data && !profile.data.is_central_admin && memberships.data?.length &&
      memberships.data.every((membership) => membership.role === "request_collaborator")) {
      const redirect = NextResponse.redirect(new URL("/solicitacoes", request.url));
      for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
      return redirect;
    }
  }
  return response;
}

export const config = {
  // Ignora estáticos e imagens; cron usa Bearer próprio e não precisa de sessão.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/cron|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
