"use client";

import Link from "next/link";
import { AlertTriangle, Building2, Calendar, FileText, LayoutGrid } from "lucide-react";
import { useRouter } from "next/navigation";
import type { DashboardFocus } from "@/modules/reports/dashboard-query";
import { cn } from "@/lib/utils";

const FOCUS_OPTIONS: { id: DashboardFocus; label: string; icon: typeof LayoutGrid }[] = [
  { id: "todos", label: "Visão Geral", icon: LayoutGrid },
  { id: "atencao", label: "Atenção & Reposição", icon: AlertTriangle },
  { id: "documentos", label: "Documentos", icon: FileText },
  { id: "prazos", label: "Prazos", icon: Calendar },
];

interface DashboardFiltersProps {
  councils: { id: string; label: string }[];
  councilId?: string;
  councilLabel: string | null;
  focus: DashboardFocus;
  attentionCount?: number;
}

function hrefFor(councilId: string | undefined, focus: DashboardFocus): string {
  const params = new URLSearchParams();
  if (councilId) params.set("councilId", councilId);
  if (focus !== "todos") params.set("focus", focus);
  const query = params.toString();
  return query ? `/dashboard?${query}` : "/dashboard";
}

/** Filtros do painel: GET na URL (compartilhável, sem estado inventado no cliente). */
export function DashboardFilters({ councils, councilId, councilLabel, focus, attentionCount = 0 }: DashboardFiltersProps) {
  const router = useRouter();

  return (
    <div className="rounded-2xl border border-border bg-card shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
            <Building2 className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Contexto do órgão</p>
            <p className="break-words text-sm font-semibold text-primary">{councilLabel ?? "Visão consolidada dos órgãos autorizados"}</p>
          </div>
        </div>
        <select
          aria-label="Selecionar órgão"
          value={councilId ?? ""}
          onChange={(event) => router.push(hrefFor(event.target.value || undefined, focus))}
          className="min-h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-72"
        >
          <option value="">Todos os órgãos autorizados</option>
          {councils.map((council) => (
            <option key={council.id} value={council.id}>{council.label}</option>
          ))}
        </select>
      </div>
      <nav aria-label="Visões do painel" className="flex flex-wrap items-center gap-1 border-t border-border px-3 py-2">
        {FOCUS_OPTIONS.map((option) => {
          const active = option.id === focus;
          const Icon = option.icon;
          const section = option.id === "todos" ? "" : `#${option.id}`;
          return (
            <Link
              key={option.id}
              href={hrefFor(councilId, option.id) + section}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "bg-[#0F2942] text-white shadow-xs"
                  : "text-muted-foreground hover:bg-secondary hover:text-primary",
              )}
            >
              <Icon className="w-3.5 h-3.5" aria-hidden />
              <span>{option.label}</span>
              {option.id === "atencao" && attentionCount > 0 ? (
                <span
                  className={cn(
                    "px-1.5 py-0.2 rounded-full text-[10px]",
                    active ? "bg-amber-500 text-slate-950 font-bold" : "bg-amber-100 text-amber-800 font-semibold",
                  )}
                >
                  {attentionCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
