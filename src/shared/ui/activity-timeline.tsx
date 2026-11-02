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
    <ol className="relative space-y-5 border-l border-border pl-6" aria-label="Histórico de atividades">
      {ordered.map((entry, index) => (
        <li key={entry.id} className="relative">
          <span
            className={`absolute top-1.5 -left-[1.85rem] size-2.5 rounded-full ring-4 ring-background ${index === 0 ? "bg-highlight" : "bg-primary"}`}
            aria-hidden
          />
          <p className="text-sm font-medium text-primary">{entry.title}</p>
          {entry.description ? <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{entry.description}</p> : null}
          <p className="mt-1 text-xs tracking-wide text-muted-foreground">
            <time dateTime={entry.occurredAt}>{formatDateTimeFortaleza(entry.occurredAt)}</time>
            {entry.actor ? ` · ${entry.actor}` : ""}
          </p>
        </li>
      ))}
    </ol>
  );
}
