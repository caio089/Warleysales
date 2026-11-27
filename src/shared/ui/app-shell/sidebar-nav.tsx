"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { NAV_GROUPS, type NavItem, type NavGroup } from "@/shared/lib/authz/navigation";

interface SidebarNavProps {
  items: NavItem[];
  onNavigate?: () => void;
  /** Modo ícone apenas (sidebar recolhida). */
  collapsed?: boolean;
  idPrefix?: string;
}

/** Determina qual grupo deve começar aberto com base na rota atual. */
function matchesPath(item: NavItem, pathname: string): boolean {
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function isItemActive(items: NavItem[], item: NavItem, pathname: string): boolean {
  return matchesPath(item, pathname) && !items.some(
    (candidate) => candidate.href.length > item.href.length && matchesPath(candidate, pathname),
  );
}

function resolveInitialOpen(items: NavItem[], pathname: string): string | null {
  const active = items.filter((item) => matchesPath(item, pathname))
    .sort((a, b) => b.href.length - a.href.length)[0];
  if (active?.group && active.group !== "inicio") return active.group;
  return "processos";
}

/** Menu lateral com grupos colapsáveis (acordeão). */
export function SidebarNav({ items, onNavigate, collapsed = false, idPrefix = "nav-group" }: SidebarNavProps) {
  const pathname = usePathname();
  const [override, setOverride] = useState<{ pathname: string; group: string | null } | null>(null);
  const openGroup = override?.pathname === pathname ? override.group : resolveInitialOpen(items, pathname);

  // Filtra apenas grupos que tenham ao menos um item visível
  const visibleGroups = NAV_GROUPS.filter((g) => items.some((i) => i.group === g.id));

  return (
    <nav aria-label="Navegação principal" className={cn("flex flex-col gap-0.5", collapsed ? "px-1.5" : "px-2")}>
      {visibleGroups.map((group) => {
        const groupItems = items.filter((i) => i.group === group.id);
        const isOpen = openGroup === group.id;
        const hasActive = groupItems.some((i) => isItemActive(items, i, pathname));

        return group.id === "inicio" ? (
          collapsed ? (
            <CollapsedGroup key={group.id} items={groupItems} allItems={items} pathname={pathname} onNavigate={onNavigate} hasActive={hasActive} />
          ) : (
            <ExpandedHome key={group.id} items={groupItems} allItems={items} pathname={pathname} onNavigate={onNavigate} />
          )
        ) : collapsed ? (
          // ── Modo recolhido: apenas ícones dos itens, sem cabeçalho de grupo ──
          <CollapsedGroup
            key={group.id}
            items={groupItems}
            allItems={items}
            pathname={pathname}
            onNavigate={onNavigate}
            hasActive={hasActive}
          />
        ) : (
          // ── Modo expandido: grupos com acordeão ──
          <ExpandedGroup
            key={group.id}
            group={group}
            items={groupItems}
            allItems={items}
            isOpen={isOpen}
            hasActive={hasActive}
            pathname={pathname}
            onNavigate={onNavigate}
            onToggle={() => setOverride({ pathname, group: openGroup === group.id ? null : group.id })}
            idPrefix={idPrefix}
          />
        );
      })}
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-componentes
// ─────────────────────────────────────────────────────────────────────────────

function CollapsedGroup({
  items,
  allItems,
  pathname,
  onNavigate,
  hasActive,
}: {
  items: NavItem[];
  allItems: NavItem[];
  pathname: string;
  onNavigate?: () => void;
  hasActive: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      {/* Ponto indicador de grupo ativo */}
      {hasActive ? (
        <span className="mb-0.5 h-0.5 w-4 rounded-full bg-highlight" aria-hidden />
      ) : (
        <span className="mb-0.5 h-0.5 w-4" aria-hidden />
      )}
      {items.map((item) => {
        const Icon = item.icon;
        const active = isItemActive(allItems, item, pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={false}
            onClick={onNavigate}
            title={item.label}
            aria-label={item.label}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex items-center justify-center rounded-lg px-0 py-2.5 text-sm font-medium transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight",
              active
                ? "bg-white/10 text-white shadow-xs"
                : "text-white/60 hover:bg-white/6 hover:text-white",
            )}
          >
            <Icon
              className={cn("size-4 shrink-0 transition-colors", active ? "text-highlight" : "text-white/50")}
              aria-hidden
            />
          </Link>
        );
      })}
    </div>
  );
}

function ExpandedHome({
  items,
  allItems,
  pathname,
  onNavigate,
}: {
  items: NavItem[];
  allItems: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex flex-col">
      {items.map((item) => {
        const Icon = item.icon;
        const active = isItemActive(allItems, item, pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={false}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight",
              active ? "bg-white/10 text-white" : "text-white/55 hover:bg-white/6 hover:text-white",
            )}
          >
            {active ? <span aria-hidden className="absolute top-1/2 left-0 h-3.5 w-0.5 -translate-y-1/2 rounded-full bg-highlight" /> : null}
            <Icon className={cn("size-3.5 shrink-0", active ? "text-highlight" : "text-white/40")} aria-hidden />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

function ExpandedGroup({
  group,
  items,
  allItems,
  isOpen,
  hasActive,
  pathname,
  onNavigate,
  onToggle,
  idPrefix,
}: {
  group: NavGroup;
  items: NavItem[];
  allItems: NavItem[];
  isOpen: boolean;
  hasActive: boolean;
  pathname: string;
  onNavigate?: () => void;
  onToggle: () => void;
  idPrefix: string;
}) {
  const GroupIcon = group.icon;
  return (
    <div className="flex flex-col">
      {/* Cabeçalho do grupo — botão de acordeão */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`${idPrefix}-${group.id}`}
        className={cn(
          "group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-semibold transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight",
          hasActive
            ? "text-white"
            : "text-white/50 hover:bg-white/5 hover:text-white/80",
        )}
      >
        <span
          className={cn(
            "grid size-7 shrink-0 place-items-center rounded-lg transition-colors",
            hasActive ? "bg-white/10 text-highlight" : "text-white/40 group-hover:text-white/60",
          )}
        >
          <GroupIcon className="size-3.5" aria-hidden />
        </span>
        <span className="flex-1 truncate tracking-wide uppercase text-[0.62rem]">
          {group.label}
        </span>
        {/* Indicador de grupo com itens ativos */}
        {hasActive && !isOpen ? (
          <span className="size-1.5 shrink-0 rounded-full bg-highlight" aria-hidden />
        ) : null}
        <ChevronDown
          className={cn(
            "size-3.5 shrink-0 text-white/30 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {/* Itens do grupo — expande/recolhe com animação CSS */}
      <div
        id={`${idPrefix}-${group.id}`}
        inert={!isOpen}
        className={cn(
          "overflow-hidden transition-all duration-200 ease-out",
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="ml-3 flex flex-col gap-0.5 border-l border-white/8 pl-2 pb-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(allItems, item, pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight",
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/55 hover:bg-white/6 hover:text-white",
                )}
              >
                {active ? (
                  <span
                    aria-hidden
                    className="absolute top-1/2 left-0 h-3.5 w-0.5 -translate-y-1/2 rounded-full bg-highlight"
                  />
                ) : null}
                <Icon
                  className={cn("size-3.5 shrink-0", active ? "text-highlight" : "text-white/40")}
                  aria-hidden
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
