import { NextResponse, type NextRequest } from "next/server";
import { createSessionClient } from "@/server/supabase/session-client";

/** Destinos internos permitidos após o link do e-mail (evita redirecionamento aberto). */
const ALLOWED_NEXT = new Set(["/redefinir-senha", "/dashboard"]);

/** Troca o `code` (PKCE) enviado por e-mail (convite/recuperação) por uma sessão e segue para o destino. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const requestedNext = searchParams.get("next") ?? "/dashboard";
  const next = ALLOWED_NEXT.has(requestedNext) ? requestedNext : "/dashboard";

  if (code) {
    const client = await createSessionClient();
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }
  return NextResponse.redirect(`${origin}/login`);
}
