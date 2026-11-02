import { formatDateTimeFortaleza } from "@/shared/lib/time";

export interface TimelineEntry {
  id: string;
  title: string;
  description?: string;
  /** Instante ISO (UTC); exibido em America/Fortaleza. */
  occurredAt: string;
  actor?: string;
}

/** Linha do tempo cronológica (mais recente primeiro) usada em históricos e auditoria. */
export function ActivityTimeline({ entries, emptyLabel = "Nenhuma atividade registrada." }: { entries: TimelineEntry[]; emptyLabel?: string }) {
  if (entries.length === 0) return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  const ordered = [...entries].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  return (
    <ol className="relative space-y-4 border-l pl-5" aria-label="Histórico de atividades">
      {ordered.map((entry) => (
        <li key={entry.id} className="relative">
          <span className="absolute -left-[1.6rem] top-1.5 size-2.5 rounded-full bg-primary" aria-hidden />
          <p className="text-sm font-medium">{entry.title}</p>
          {entry.description ? <p className="text-sm text-muted-foreground">{entry.description}</p> : null}
          <p className="text-xs text-muted-foreground">
            <time dateTime={entry.occurredAt}>{formatDateTimeFortaleza(entry.occurredAt)}</time>
            {entry.actor ? ` · ${entry.actor}` : ""}
          </p>
        </li>
      ))}
    </ol>
  );
}
