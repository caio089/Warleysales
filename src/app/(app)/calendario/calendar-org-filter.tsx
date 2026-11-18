"use client";

import { Building2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface CalendarOrgFilterProps {
  councils: { id: string; label: string }[];
  /** Null mostra todos os órgãos que o usuário pode ver. */
  councilId: string | null;
  /** Consulta atual sem o órgão, para o filtro não perder mês ou ano. */
  preserved: string;
  allLabel: string;
}

function hrefFor(preserved: string, councilId: string | undefined): string {
  const params = new URLSearchParams(preserved);
  if (councilId) params.set("orgao", councilId);
  const query = params.toString();
  return query ? `/calendario?${query}` : "/calendario";
}

/** Troca o órgão na URL. A lista já veio filtrada pelo que o usuário pode ver. */
export function CalendarOrgFilter({ councils, councilId, preserved, allLabel }: CalendarOrgFilterProps) {
  const router = useRouter();

  return (
    <label className="relative flex w-full items-center sm:w-72">
      <span className="sr-only">Órgão</span>
      <Building2 className="pointer-events-none absolute left-3 size-4 text-slate-400" aria-hidden />
      <select
        value={councilId ?? ""}
        onChange={(event) => router.push(hrefFor(preserved, event.target.value || undefined))}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-8 pl-9 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-[#0F2942]/20 focus:outline-none"
      >
        <option value="">{allLabel}</option>
        {councils.map((council) => (
          <option key={council.id} value={council.id}>{council.label}</option>
        ))}
      </select>
    </label>
  );
}
