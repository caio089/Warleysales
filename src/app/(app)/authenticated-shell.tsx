import { Bell, Database } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/modules/identity/actions";
import { getServices } from "@/server/runtime";
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
  const displayName = session.status === "authenticated" ? session.displayName : "";
  let unreadAlerts = 0;
  if (session.status === "authenticated") {
    const services = getServices();
    if (services) {
      const listed = await services.notifications.listMine(session.actor);
      if (listed.ok) unreadAlerts = listed.data.unread;
    }
  }
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <AppShell
      navHrefs={navHrefs}
      topbarSlot={
        <>
          {!unconfigured ? (
            <span
              title="Gravações vão para o Postgres do Supabase"
              className="hidden items-center gap-1.5 rounded-full border border-success-foreground/15 bg-success px-2.5 py-1 text-[0.7rem] font-semibold tracking-wide text-success-foreground sm:inline-flex"
            >
              <Database className="size-3" aria-hidden />
              Banco conectado
            </span>
          ) : null}
          <Link
            href="/alertas"
            aria-label={unreadAlerts > 0 ? `Alertas e notificações, ${unreadAlerts} não lida(s)` : "Alertas e notificações"}
            className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <Bell className="size-4" aria-hidden />
            {unreadAlerts > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 grid min-w-4 place-items-center rounded-full bg-highlight px-1 text-[0.6rem] font-bold text-highlight-foreground">
                {unreadAlerts > 9 ? "9+" : unreadAlerts}
              </span>
            ) : null}
          </Link>
          {session.status === "authenticated" ? (
            <>
              <span className="hidden items-center gap-2 rounded-full border border-border/80 bg-card py-1 pr-3 pl-1 text-sm font-medium text-primary sm:inline-flex">
                <span className="grid size-6 place-items-center rounded-full bg-primary text-[0.65rem] font-semibold tracking-wide text-primary-foreground">
                  {initials || "U"}
                </span>
                {displayName}
              </span>
              <form action={signOutAction}>
                <Button type="submit" variant="outline" size="sm">
                  Sair
                </Button>
              </form>
            </>
          ) : null}
        </>
      }
    >
      {unconfigured ? (
        <div role="status" className="mb-4 rounded-xl border border-warning-foreground/30 bg-warning p-3 text-sm text-warning-foreground">
          <strong>Fonte de dados não configurada.</strong> As telas mostram apenas a estrutura; nenhum dado é simulado e nenhuma operação é gravada.
        </div>
      ) : null}
      {children}
    </AppShell>
  );
}
