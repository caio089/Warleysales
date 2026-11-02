"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/shared/lib/authz/navigation";

interface SidebarNavProps {
  items: NavItem[];
  onNavigate?: () => void;
}

/** Lista de navegação com destaque da rota ativa e foco visível por teclado. */
export function SidebarNav({ items, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegação principal" className="flex flex-col gap-0.5 p-2">
      {items.map(({ label, href, icon: Icon }, index) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            style={{ ["--stagger" as string]: `${index * 35}ms` }}
            className={cn(
              "nav-in group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight",
              active
                ? "bg-white/10 text-white shadow-[inset_0_1px_0_oklch(1_0_0_/_0.06)]"
                : "text-white/60 hover:bg-white/6 hover:text-white",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-full bg-highlight transition-opacity",
                active ? "opacity-100" : "opacity-0",
              )}
            />
            <Icon className={cn("size-4 shrink-0", active ? "text-highlight" : "text-white/50 group-hover:text-white")} aria-hidden />
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
