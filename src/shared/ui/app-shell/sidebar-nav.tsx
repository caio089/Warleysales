"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/shared/lib/authz/navigation";

interface SidebarNavProps {
  items: NavItem[];
  onNavigate?: () => void;
  /** Modo ícone apenas (sidebar recolhida). */
  collapsed?: boolean;
}

/** Lista de navegação com destaque da rota ativa — sem deslocamento no hover. */
export function SidebarNav({ items, onNavigate, collapsed = false }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegação principal" className={cn("flex flex-col gap-0.5", collapsed ? "px-1.5" : "px-2")}>
      {items.map(({ label, href, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            aria-label={collapsed ? label : undefined}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex items-center rounded-lg text-sm font-medium transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight",
              collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5",
              active
                ? "bg-white/10 text-white"
                : "text-white/60 hover:bg-white/6 hover:text-white",
            )}
          >
            {!collapsed ? (
              <span
                aria-hidden
                className={cn(
                  "absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-full bg-highlight",
                  active ? "opacity-100" : "opacity-0",
                )}
              />
            ) : null}
            <Icon
              className={cn("size-4 shrink-0", active ? "text-highlight" : "text-white/50")}
              aria-hidden
            />
            {!collapsed ? <span className="truncate">{label}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}
