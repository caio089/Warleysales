import Link from "next/link";
import type { ReactNode } from "react";
import { Calendar, FolderKanban, Inbox, ShoppingCart, type LucideIcon } from "lucide-react";
import { formatDateTimeFortaleza } from "@/shared/lib/time";
import { StatusBadge } from "@/shared/ui/status-badge";
import {
  MEETING_STATUS,
  PROCESS_STATUS,
  REQUEST_STATUS,
  presentationOf,
  type StatusPresentation,
} from "@/shared/ui/status-presentation";
import { cn } from "@/lib/utils";

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
  icon: Icon,
  iconBg,
  children,
  hasItems,
  action,
}: {
  title: string;
  href: string;
  empty: string;
  icon: LucideIcon;
  iconBg: string;
  children: ReactNode;
  hasItems: boolean;
  action?: ReactNode;
}) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs" aria-label={title}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
            <Icon className="w-4 h-4" aria-hidden />
          </div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {action}
          <Link href={href} className="text-xs font-bold text-[#0F2942] hover:underline">
            Ver tudo
          </Link>
        </div>
      </div>
      {!hasItems ? (
        <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-4 px-3 text-center">
          <Inbox className="size-4 text-slate-400" aria-hidden />
          <p className="text-xs text-slate-400">{empty}</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">{children}</ul>
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
        className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50/70 -mx-2 px-2 rounded-lg transition-colors block"
      >
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-slate-900 truncate">{row.title}</p>
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">{row.meta}</p>
        </div>
        <span className="shrink-0 whitespace-nowrap">
          <StatusBadge label={status.label} tone={status.tone} />
        </span>
      </Link>
    </li>
  );
}

export function RequestsOverview({
  rows,
  action,
}: {
  rows: { id: string; title: string; status: string; createdAt: Date }[];
  action?: ReactNode;
}) {
  return (
    <PanelShell
      title="Solicitações"
      href="/solicitacoes"
      empty="Nenhuma solicitação neste conselho."
      icon={ShoppingCart}
      iconBg="bg-slate-100 text-slate-700"
      hasItems={rows.length > 0}
      action={action}
    >
      {rows.slice(0, 3).map((r) => (
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
  action,
}: {
  rows: { id: string; number: string; title: string; status: string; progress: number }[];
  action?: ReactNode;
}) {
  return (
    <PanelShell
      title="Processos e documentos"
      href="/processos"
      empty="Nenhum processo em andamento."
      icon={FolderKanban}
      iconBg="bg-blue-50 text-blue-700"
      hasItems={rows.length > 0}
      action={action}
    >
      {rows.slice(0, 3).map((r) => (
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
  action,
}: {
  rows: { id: string; title: string; status: string; scheduledAt: Date }[];
  action?: ReactNode;
}) {
  return (
    <PanelShell
      title="Reuniões"
      href="/reunioes"
      empty="Nenhuma reunião agendada."
      icon={Calendar}
      iconBg="bg-emerald-50 text-emerald-700"
      hasItems={rows.length > 0}
      action={action}
    >
      {rows.slice(0, 3).map((r) => (
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
