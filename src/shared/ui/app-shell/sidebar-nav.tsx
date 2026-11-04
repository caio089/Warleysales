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

/** Lista de navegação categorizada por grupos lógicos com realce limpo. */
export function SidebarNav({ items, onNavigate, collapsed = false }: SidebarNavProps) {
  const pathname = usePathname();

  // Agrupa itens mantendo a ordem original
  let lastSection: string | undefined = undefined;

  return (
    <nav aria-label="Navegação principal" className={cn("flex flex-col gap-0.5", collapsed ? "px-1.5" : "px-2")}>
      {items.map((item, index) => {
        const { label, href, icon: Icon, section } = item;
        const active = pathname === href || pathname.startsWith(`${href}/`);
        const showSectionHeader = !collapsed && section && section !== lastSection && index > 0;
        const showDivider = collapsed && section && section !== lastSection && index > 0;
        lastSection = section;

        return (
          <div key={href} className="flex flex-col">
            {showSectionHeader ? (
              <p className="mt-3.5 mb-1 px-3 text-[0.62rem] font-bold tracking-[0.16em] text-sidebar-foreground/40 uppercase">
                {section}
              </p>
            ) : null}
            {showDivider ? <div className="my-1.5 border-t border-sidebar-border/50" /> : null}

            <Link
              href={href}
              onClick={onNavigate}
              title={collapsed ? label : undefined}
              aria-label={collapsed ? label : undefined}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex items-center rounded-lg text-sm font-medium transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight",
                collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2",
                active
                  ? "bg-white/10 text-white shadow-xs"
                  : "text-white/60 hover:bg-white/6 hover:text-white",
              )}
            >
              {!collapsed && active ? (
                <span
                  aria-hidden
                  className="absolute top-1/2 left-0 h-4 w-0.5 -translate-y-1/2 rounded-full bg-highlight"
                />
              ) : null}
              <Icon
                className={cn("size-4 shrink-0 transition-colors", active ? "text-highlight" : "text-white/50")}
                aria-hidden
              />
              {!collapsed ? <span className="truncate">{label}</span> : null}
            </Link>
          </div>
        );
      })}
    </nav>
  );
}
