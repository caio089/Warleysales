"use client";

import { Menu } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import type { NavItem } from "@/shared/lib/authz/navigation";
import { SidebarNav } from "./sidebar-nav";

interface AppShellProps {
  navItems: NavItem[];
  /** Slots preenchidos por módulos reais (seletor de conselho, busca, notificações, perfil). */
  topbarSlot?: ReactNode;
  children: ReactNode;
}

/** Layout administrativo: sidebar fixa no desktop, gaveta em telas menores. */
export function AppShell({ navItems, topbarSlot, children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 border-r bg-card md:block">
        <div className="flex h-14 items-center border-b px-4 text-sm font-semibold">
          Gestão de Conselhos
        </div>
        <SidebarNav items={navItems} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="flex h-14 items-center border-b px-4 text-sm font-semibold">
            Gestão de Conselhos
          </SheetTitle>
          <SidebarNav items={navItems} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b bg-card px-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Abrir menu de navegação"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" aria-hidden />
          </Button>
          <div className="flex flex-1 items-center justify-end gap-2">{topbarSlot}</div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
