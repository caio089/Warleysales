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
export function DashboardFilters({ councils, councilId, focus, attentionCount = 0 }: DashboardFiltersProps) {
  const router = useRouter();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-sm">
      <div role="tablist" aria-label="Foco do painel" className="flex flex-wrap items-center gap-1.5">
        {FOCUS_OPTIONS.map((option) => {
          const active = option.id === focus;
          const Icon = option.icon;
          return (
            <Link
              key={option.id}
              href={hrefFor(councilId, option.id)}
              role="tab"
              aria-selected={active}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all",
                active
                  ? "bg-[#0F2942] text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100",
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
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="relative flex items-center w-full sm:w-72">
          <Building2 className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <select
            value={councilId ?? ""}
            onChange={(event) => router.push(hrefFor(event.target.value || undefined, focus))}
            className="w-full pl-9 pr-8 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20"
          >
            <option value="">Todos os órgãos cadastrados</option>
            {councils.map((council) => (
              <option key={council.id} value={council.id}>
                {council.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
