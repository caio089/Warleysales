"use client";

import { Menu } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { NAV_ITEMS } from "@/shared/lib/authz/navigation";
import { BrandMark } from "../brand-mark";
import { PageReveal } from "../page-reveal";
import { SidebarNav } from "./sidebar-nav";

interface AppShellProps {
  /**
   * Rotas visíveis ao usuário (já filtradas no servidor). Apenas strings atravessam a fronteira
   * servidor→cliente; os ícones (funções) são resolvidos aqui a partir de NAV_ITEMS.
   */
  navHrefs: string[];
  /** Slots preenchidos por módulos reais (seletor de conselho, busca, notificações, perfil). */
  topbarSlot?: ReactNode;
  children: ReactNode;
}

/** Layout administrativo: sidebar navy à esquerda, gaveta em telas menores. */
export function AppShell({ navHrefs, topbarSlot, children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = NAV_ITEMS.filter((item) => navHrefs.includes(item.href));

  return (
    <div className="flex min-h-screen bg-background">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded focus:bg-background focus:px-3 focus:py-2">
        Ir para o conteúdo
      </a>
      <aside className="relative hidden w-64 shrink-0 overflow-hidden bg-primary text-primary-foreground md:flex md:flex-col">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,oklch(0.68_0.16_52_/_0.16),transparent_55%)]"
        />
        <div className="relative flex h-16 items-center px-4">
          <BrandMark inverted />
        </div>
        <div className="relative min-h-0 flex-1 overflow-y-auto px-2 pb-6">
          <SidebarNav items={navItems} />
        </div>
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 border-transparent bg-primary p-0 text-primary-foreground">
          <SheetTitle className="sr-only">Navegação</SheetTitle>
          <div className="flex h-16 items-center px-4">
            <BrandMark inverted />
          </div>
          <SidebarNav items={navItems} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border/70 bg-card/75 px-4 backdrop-blur-md">
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
        <main id="conteudo" className="relative flex-1 p-5 md:p-8">
          <div className="relative mx-auto w-full max-w-6xl">
            <PageReveal>{children}</PageReveal>
          </div>
        </main>
      </div>
    </div>
  );
}
