"use client";

import Link from "next/link";
import { CalendarClock, FileCheck2, LayoutGrid, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import type { DashboardFocus } from "@/modules/reports/dashboard-query";
import { cn } from "@/lib/utils";

const FOCUS_OPTIONS: { id: DashboardFocus; label: string; icon: typeof LayoutGrid }[] = [
  { id: "todos", label: "Tudo", icon: LayoutGrid },
  { id: "atencao", label: "Atenção", icon: TriangleAlert },
  { id: "documentos", label: "Documentação", icon: FileCheck2 },
  { id: "prazos", label: "Prazos", icon: CalendarClock },
];

interface DashboardFiltersProps {
  councils: { id: string; label: string }[];
  councilId?: string;
  focus: DashboardFocus;
}

function hrefFor(councilId: string | undefined, focus: DashboardFocus): string {
  const params = new URLSearchParams();
  if (councilId) params.set("councilId", councilId);
  if (focus !== "todos") params.set("focus", focus);
  const query = params.toString();
  return query ? `/dashboard?${query}` : "/dashboard";
}

/** Filtros do painel: GET na URL (compartilhável, sem estado inventado no cliente). */
export function DashboardFilters({ councils, councilId, focus }: DashboardFiltersProps) {
  const router = useRouter();

  return (
    <div className="surface-card flex flex-col gap-4 p-4 xl:flex-row xl:items-end xl:justify-between">
      <label className="flex min-w-0 flex-1 flex-col gap-1.5 xl:max-w-sm">
        <span className="text-[0.7rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">Conselho</span>
        <select
          className="h-11 rounded-xl border border-input bg-card px-3 text-sm font-medium text-foreground shadow-sm transition-colors focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 focus-visible:outline-none"
          value={councilId ?? ""}
          onChange={(event) => router.push(hrefFor(event.target.value || undefined, focus))}
        >
          <option value="">Todos os conselhos do seu acesso</option>
          {councils.map((council) => (
            <option key={council.id} value={council.id}>
              {council.label}
            </option>
          ))}
        </select>
      </label>
      <div role="tablist" aria-label="Foco do painel" className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
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
                "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-all",
                active
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:-translate-y-0.5 hover:border-primary/30 hover:text-primary hover:shadow-sm",
              )}
            >
              <Icon className="size-3.5" aria-hidden />
              {option.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
