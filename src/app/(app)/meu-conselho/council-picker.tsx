"use client";

import { useRouter } from "next/navigation";

interface CouncilPickerProps {
  councils: { id: string; label: string }[];
  councilId: string;
}

/** Troca o conselho ativo do painel via query string (compartilhável). */
export function CouncilPicker({ councils, councilId }: CouncilPickerProps) {
  const router = useRouter();
  if (councils.length <= 1) return null;

  return (
    <label className="flex min-w-[14rem] flex-col gap-1.5">
      <span className="text-[0.7rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">Conselho ativo</span>
      <select
        className="h-11 rounded-xl border border-input bg-card px-3 text-sm font-medium text-foreground shadow-sm focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 focus-visible:outline-none"
        value={councilId}
        onChange={(event) => router.push(`/meu-conselho?councilId=${event.target.value}`)}
      >
        {councils.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </select>
    </label>
  );
}
