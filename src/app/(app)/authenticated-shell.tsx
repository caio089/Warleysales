import { Bell } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/modules/identity/actions";
import { getSession } from "@/server/session";
import { filterNavigation, NAV_ITEMS, type AccessContext } from "@/shared/lib/authz/navigation";
import { AppShell } from "@/shared/ui/app-shell/app-shell";

/** Layout autenticado: valida sessão no servidor e entrega ao AppShell apenas as rotas permitidas. */
export async function AuthenticatedShell({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (session.status === "anonymous") redirect("/login");

  const unconfigured = session.status === "unconfigured";
  const access: AccessContext = unconfigured
    ? { isCentralAdmin: true, roles: [] } // sem fonte de dados não há nada a proteger; mostra a estrutura
    : {
        isCentralAdmin: session.actor.isCentralAdmin,
        roles: session.actor.memberships.map((m) => m.role),
      };
  const navHrefs = filterNavigation(access, NAV_ITEMS).map((item) => item.href);

  return (
    <AppShell
      navHrefs={navHrefs}
      topbarSlot={
        <>
          <Link href="/alertas" aria-label="Alertas e notificações" className="rounded-md p-2 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
            <Bell className="size-4" aria-hidden />
          </Link>
          {session.status === "authenticated" ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">{session.displayName}</span>
              <form action={signOutAction}><Button type="submit" variant="outline" size="sm">Sair</Button></form>
            </>
          ) : null}
        </>
      }
    >
      {unconfigured ? (
        <div role="status" className="mb-4 rounded-lg border border-warning-foreground/30 bg-warning p-3 text-sm text-warning-foreground">
          <strong>Fonte de dados não configurada.</strong> As telas mostram apenas a estrutura; nenhum dado é simulado e nenhuma operação é gravada.
        </div>
      ) : null}
      {children}
    </AppShell>
  );
}
