import Link from "next/link";
import {
  ArrowUpRight,
  Bell,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FileStack,
  Inbox,
  Package,
  ScrollText,
  ShieldCheck,
  Truck,
  type LucideIcon,
} from "lucide-react";
import type { DashboardAttention, DashboardDeadline } from "@/modules/reports/service";
import { formatDateTimeFortaleza } from "@/shared/lib/time";
import { ProgressBar } from "@/shared/ui/progress-bar";
import { presentationOf, PROCESS_STATUS } from "@/shared/ui/status-presentation";
import { cn } from "@/lib/utils";

export interface DashboardAlertItem {
  id: string;
  title: string;
  body: string;
  unread: boolean;
  at: string;
  href: string;
}

const SEVERITY_DOT: Record<DashboardAttention["severity"], string> = {
  info: "bg-primary",
  warning: "bg-highlight",
  danger: "bg-destructive",
};

function PanelEmpty({ icon: Icon, children }: { icon: LucideIcon; children: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/80 bg-secondary/40 px-4 py-8 text-center">
      <span className="grid size-11 place-items-center rounded-2xl bg-card text-muted-foreground shadow-sm">
        <Icon className="size-5" aria-hidden />
      </span>
      <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}

function PanelHeader({
  icon: Icon,
  title,
  meta,
  href,
}: {
  icon: LucideIcon;
  title: string;
  meta?: string;
  href?: string;
}) {
  return (
    <header className="mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
          <Icon className="size-4" aria-hidden />
        </span>
        <div>
          <h2 className="font-heading text-lg font-medium tracking-tight text-primary">{title}</h2>
          {meta ? <p className="text-xs text-muted-foreground">{meta}</p> : null}
        </div>
      </div>
      {href ? (
        <Link href={href} className="text-sm font-medium text-primary underline-offset-4 hover:text-highlight hover:underline">
          Ver todos
        </Link>
      ) : null}
    </header>
  );
}

export function AlertsPanel({ items, unread }: { items: DashboardAlertItem[]; unread: number }) {
  return (
    <section className="surface-card card-hover flex h-full flex-col p-5" aria-label="Alertas recentes">
      <PanelHeader icon={Bell} title="Alertas" meta={`${unread} não lida(s)`} href="/alertas" />
      {items.length === 0 ? (
        <PanelEmpty icon={Inbox}>Nenhum alerta gerado. Os marcos de vencimento (90 a 0 dias) aparecem aqui.</PanelEmpty>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="group flex items-start gap-3 rounded-xl border border-transparent bg-secondary/60 px-3 py-2.5 transition-all hover:-translate-y-0.5 hover:border-highlight/30 hover:bg-card hover:shadow-sm"
              >
                <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", item.unread ? "bg-highlight" : "bg-muted-foreground/40")} aria-hidden />
                <span className="min-w-0">
                  <span className={cn("block truncate text-sm", item.unread ? "font-semibold text-primary" : "text-foreground")}>{item.title}</span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">{item.body}</span>
                  <time className="mt-1 block text-[0.7rem] text-muted-foreground" dateTime={item.at}>
                    {formatDateTimeFortaleza(item.at)}
                  </time>
                </span>
                <ArrowUpRight className="mt-1 ml-auto size-4 shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function AttentionPanel({ items }: { items: DashboardAttention[] }) {
  return (
    <section className="surface-card card-hover flex h-full flex-col p-5" aria-label="Pontos de atenção">
      <PanelHeader icon={ShieldCheck} title="Pontos de atenção" />
      {items.length === 0 ? (
        <PanelEmpty icon={CheckCircle2}>Nada crítico no recorte atual. Os números vêm dos cadastros reais.</PanelEmpty>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <Link href={item.href} className="group flex items-start gap-3 rounded-xl border border-border/70 bg-card px-3 py-3 transition-all hover:-translate-y-0.5 hover:border-highlight/35 hover:shadow-sm">
                <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", SEVERITY_DOT[item.severity])} aria-hidden />
                <span>
                  <span className="block text-sm font-medium text-primary">{item.title}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{item.detail}</span>
                </span>
                <ArrowUpRight className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-highlight" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function DeadlinesPanel({ items }: { items: DashboardDeadline[] }) {
  return (
    <section className="surface-card card-hover flex h-full flex-col p-5" aria-label="Prazos próximos">
      <PanelHeader icon={CalendarClock} title="Prazos (60 dias)" />
      {items.length === 0 ? (
        <PanelEmpty icon={CalendarClock}>Nenhum contrato ou ata vence nos próximos 60 dias neste recorte.</PanelEmpty>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={`${item.kind}-${item.id}`}>
              <Link href={item.href} className="group flex items-center justify-between gap-3 rounded-xl border border-border/70 px-3 py-3 transition-all hover:-translate-y-0.5 hover:border-highlight/35 hover:shadow-sm">
                <span>
                  <span className="block text-[0.7rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                    {item.kind === "contract" ? "Contrato" : "Ata"}
                  </span>
                  <span className="text-sm font-medium text-primary">{item.label}</span>
                </span>
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums", item.days <= 7 ? "bg-highlight/15 text-highlight" : "bg-secondary text-primary")}>
                  {item.days} d
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function StatusDistribution({ rows, total }: { rows: { status: string; count: number }[]; total: number }) {
  return (
    <section className="surface-card card-hover p-5" aria-label="Processos por situação">
      <PanelHeader icon={ClipboardList} title="Situação dos processos" />
      {total === 0 ? (
        <PanelEmpty icon={Inbox}>Nenhum processo neste recorte — a média documental permanece sem valor.</PanelEmpty>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => {
            const pct = total === 0 ? 0 : Math.round((row.count / total) * 100);
            const presentation = presentationOf(PROCESS_STATUS, row.status);
            return (
              <li key={row.status}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>{presentation.label}</span>
                  <span className="tabular-nums text-muted-foreground">{row.count}</span>
                </div>
                <ProgressBar value={pct} label={presentation.label} showValue={false} />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

const SHORTCUTS = [
  { href: "/processos/novo", label: "Novo processo", detail: "Abrir e anexar os 7 documentos", icon: ClipboardList },
  { href: "/solicitacoes", label: "Solicitações", detail: "Criar → enviar → aprovar → receber", icon: Truck },
  { href: "/estoque", label: "Estoque", detail: "Saldos e itens críticos", icon: Package },
  { href: "/atas", label: "Atas", detail: "Saldo de registro de preços", icon: ScrollText },
  { href: "/contratos", label: "Contratos", detail: "Vigências e aditivos", icon: FileStack },
  { href: "/alertas", label: "Alertas", detail: "Vencimentos e avisos", icon: Bell },
] as const;

export function ShortcutGrid({ canCreateProcess = true }: { canCreateProcess?: boolean }) {
  const items = SHORTCUTS.filter((s) => s.href !== "/processos/novo" || canCreateProcess);
  return (
    <section aria-label="Atalhos" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ href, label, detail, icon: Icon }) => (
        <Link key={href} href={href} className="surface-card card-hover group flex items-center gap-3 p-4">
          <span className="grid size-11 place-items-center rounded-2xl bg-secondary text-primary transition-all group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground">
            <Icon className="size-4" aria-hidden />
          </span>
          <span>
            <span className="block font-medium text-primary">{label}</span>
            <span className="block text-xs text-muted-foreground">{detail}</span>
          </span>
          <ArrowUpRight className="ml-auto size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-highlight" aria-hidden />
        </Link>
      ))}
    </section>
  );
}
