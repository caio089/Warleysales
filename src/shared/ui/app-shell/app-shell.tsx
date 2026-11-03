"use client";

import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/shared/lib/authz/navigation";
import { BrandMark } from "../brand-mark";
import { PageReveal } from "../page-reveal";
import { SidebarNav } from "./sidebar-nav";

const SIDEBAR_STORAGE_KEY = "conselhos.sidebar.collapsed";
const SIDEBAR_EXPANDED = "16.5rem";
const SIDEBAR_COLLAPSED = "4.25rem";

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

/** Layout administrativo: sidebar fixa (não rola nem desloca no hover), recolhível no desktop. */
export function AppShell({ navHrefs, topbarSlot, children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const navItems = NAV_ITEMS.filter((item) => navHrefs.includes(item.href));

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(SIDEBAR_STORAGE_KEY) === "1");
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  const desktopWidth = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

  return (
    <div className="min-h-screen bg-background">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded focus:bg-background focus:px-3 focus:py-2">
        Ir para o conteúdo
      </a>

      {/* Sidebar desktop: fixed — não acompanha scroll nem se move no hover */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden flex-col overflow-hidden bg-sidebar text-sidebar-foreground md:flex",
          hydrated && "transition-[width] duration-200 ease-out",
        )}
        style={{ width: desktopWidth }}
        aria-label="Menu lateral"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,oklch(0.68_0.16_52_/_0.18),transparent_55%),linear-gradient(180deg,oklch(1_0_0_/_0.04),transparent_28%)]"
        />
        <div
          className={cn(
            "relative flex h-[4.25rem] shrink-0 items-center border-b border-sidebar-border/60",
            collapsed ? "justify-center px-1" : "justify-between gap-2 px-3",
          )}
        >
          {collapsed ? <BrandMark inverted compact /> : <BrandMark inverted />}
          {!collapsed ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 text-sidebar-foreground/70 hover:bg-white/10 hover:text-white"
              aria-label="Recolher menu lateral"
              aria-expanded
              onClick={toggleCollapsed}
            >
              <PanelLeftClose className="size-4" aria-hidden />
            </Button>
          ) : null}
        </div>
        <div className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-3">
          <SidebarNav items={navItems} collapsed={collapsed} />
        </div>
        <div className="relative shrink-0 border-t border-sidebar-border/60">
          {collapsed ? (
            <div className="flex justify-center py-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-sidebar-foreground/70 hover:bg-white/10 hover:text-white"
                aria-label="Expandir menu lateral"
                aria-expanded={false}
                onClick={toggleCollapsed}
              >
                <PanelLeftOpen className="size-4" aria-hidden />
              </Button>
            </div>
          ) : (
            <div className="px-4 py-3">
              <p className="text-[0.65rem] tracking-[0.14em] text-sidebar-foreground/45 uppercase">Operação real</p>
              <p className="mt-0.5 text-xs text-sidebar-foreground/70">Dados no Supabase</p>
            </div>
          )}
        </div>
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[16.5rem] border-transparent bg-sidebar p-0 text-sidebar-foreground">
          <SheetTitle className="sr-only">Navegação</SheetTitle>
          <div className="flex h-[4.25rem] items-center border-b border-sidebar-border/60 px-4">
            <BrandMark inverted />
          </div>
          <div className="px-2 py-4">
            <SidebarNav items={navItems} onNavigate={() => setMobileOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <div
        className={cn("flex min-h-screen min-w-0 flex-col md:pl-[var(--shell-sidebar)]", hydrated && "md:transition-[padding] md:duration-200 md:ease-out")}
        style={{ ["--shell-sidebar" as string]: desktopWidth }}
      >
        <header className="sticky top-0 z-20 flex h-[4.25rem] items-center gap-3 border-b border-border/70 bg-card/80 px-4 backdrop-blur-md md:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Abrir menu de navegação"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" aria-hidden />
          </Button>
          {collapsed ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex"
              aria-label="Expandir menu lateral"
              onClick={toggleCollapsed}
            >
              <PanelLeftOpen className="size-5" aria-hidden />
            </Button>
          ) : null}
          <div className="min-w-0 flex-1 md:hidden">
            <BrandMark compact />
          </div>
          <div className="flex flex-1 items-center justify-end gap-2">{topbarSlot}</div>
        </header>
        <main id="conteudo" className="relative flex-1 p-5 md:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(ellipse_at_top,oklch(0.28_0.07_250_/_0.045),transparent_70%)]"
          />
          <div className="relative mx-auto w-full max-w-6xl">
            <PageReveal>{children}</PageReveal>
          </div>
        </main>
      </div>
    </div>
  );
}
