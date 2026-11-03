import Link from "next/link";
import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { formatDateTimeFortaleza } from "@/shared/lib/time";
import { StatusBadge } from "@/shared/ui/status-badge";
import {
  MEETING_STATUS,
  PROCESS_STATUS,
  REQUEST_STATUS,
  presentationOf,
  type StatusPresentation,
} from "@/shared/ui/status-presentation";

interface RowLink {
  id: string;
  title: string;
  meta: string;
  href: string;
  statusKey: string;
  dictionary: "request" | "process" | "meeting";
}

const DICTS = {
  request: REQUEST_STATUS,
  process: PROCESS_STATUS,
  meeting: MEETING_STATUS,
} as const;

function statusOf(row: RowLink): StatusPresentation {
  return presentationOf(DICTS[row.dictionary], row.statusKey);
}

function PanelShell({
  title,
  href,
  empty,
  children,
  hasItems,
}: {
  title: string;
  href: string;
  empty: string;
  children: ReactNode;
  hasItems: boolean;
}) {
  return (
    <section className="surface-card flex h-full flex-col p-5">
      <header className="mb-4 flex items-center justify-between gap-2">
        <h2 className="font-heading text-lg font-medium tracking-tight text-primary">{title}</h2>
        <Link href={href} className="text-sm font-medium text-primary underline-offset-4 hover:text-highlight hover:underline">
          Ver tudo
        </Link>
      </header>
      {!hasItems ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/80 bg-secondary/40 px-4 py-8 text-center">
          <Inbox className="size-5 text-muted-foreground" aria-hidden />
          <p className="max-w-xs text-sm text-muted-foreground">{empty}</p>
        </div>
      ) : (
        <ul className="space-y-2">{children}</ul>
      )}
    </section>
  );
}

function Row({ row }: { row: RowLink }) {
  const status = statusOf(row);
  return (
    <li>
      <Link
        href={row.href}
        className="flex items-start justify-between gap-3 rounded-xl border border-transparent bg-secondary/50 px-3 py-2.5 transition-colors hover:border-border hover:bg-card"
      >
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-primary">{row.title}</span>
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">{row.meta}</span>
        </span>
        <StatusBadge label={status.label} tone={status.tone} />
      </Link>
    </li>
  );
}

export function RequestsOverview({
  rows,
}: {
  rows: { id: string; title: string; status: string; createdAt: Date }[];
}) {
  return (
    <PanelShell
      title="Solicitações"
      href="/solicitacoes"
      empty="Nenhuma solicitação neste conselho. Use Nova solicitação acima."
      hasItems={rows.length > 0}
    >
      {rows.map((r) => (
        <Row
          key={r.id}
          row={{
            id: r.id,
            title: r.title,
            meta: `Criada em ${formatDateTimeFortaleza(r.createdAt.toISOString())}`,
            href: `/solicitacoes/${r.id}`,
            statusKey: r.status,
            dictionary: "request",
          }}
        />
      ))}
    </PanelShell>
  );
}

export function ProcessesOverview({
  rows,
}: {
  rows: { id: string; number: string; title: string; status: string; progress: number }[];
}) {
  return (
    <PanelShell
      title="Processos e documentos"
      href="/processos"
      empty="Nenhum processo. Abra um processo para anexar os 7 documentos."
      hasItems={rows.length > 0}
    >
      {rows.map((r) => (
        <Row
          key={r.id}
          row={{
            id: r.id,
            title: `${r.number} — ${r.title}`,
            meta: `Documentação ${r.progress}%`,
            href: `/processos/${r.id}`,
            statusKey: r.status,
            dictionary: "process",
          }}
        />
      ))}
    </PanelShell>
  );
}

export function MeetingsOverview({
  rows,
}: {
  rows: { id: string; title: string; status: string; scheduledAt: Date }[];
}) {
  return (
    <PanelShell
      title="Reuniões"
      href="/reunioes"
      empty="Nenhuma reunião agendada. Use Agendar reunião abaixo."
      hasItems={rows.length > 0}
    >
      {rows.map((r) => (
        <Row
          key={r.id}
          row={{
            id: r.id,
            title: r.title,
            meta: formatDateTimeFortaleza(r.scheduledAt.toISOString()),
            href: "/reunioes",
            statusKey: r.status,
            dictionary: "meeting",
          }}
        />
      ))}
    </PanelShell>
  );
}
