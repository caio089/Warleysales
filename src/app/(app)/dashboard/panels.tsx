import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  Bell,
  Building2,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileStack,
  Inbox,
  Package,
  PackageX,
  ScrollText,
  ShieldCheck,
  ShoppingCart,
  Truck,
  type LucideIcon,
} from "lucide-react";
import type { DashboardAttention, DashboardDeadline } from "@/modules/reports/service";
import { formatDateTimeFortaleza } from "@/shared/lib/time";
import { ProgressBar } from "@/shared/ui/progress-bar";
import { StatusBadge } from "@/shared/ui/status-badge";
import { presentationOf, PROCESS_STATUS, REQUEST_STATUS } from "@/shared/ui/status-presentation";
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
      <span className="grid size-11 place-items-center rounded-2xl bg-card text-muted-foreground shadow-xs">
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
        <span className="grid size-9 place-items-center rounded-xl bg-secondary text-primary">
          <Icon className="size-4" aria-hidden />
        </span>
        <div>
          <h2 className="font-heading text-base font-semibold tracking-tight text-primary">{title}</h2>
          {meta ? <p className="text-xs text-muted-foreground">{meta}</p> : null}
        </div>
      </div>
      {href ? (
        <Link href={href} className="text-xs font-semibold text-primary underline-offset-4 hover:text-highlight hover:underline">
          Ver todos
        </Link>
      ) : null}
    </header>
  );
}

/** Painel de empresas que necessitam de reposição / atenção de estoque */
export function ReplenishmentPanel({
  items,
}: {
  items: { companyId: string; company: string; material: string; available: number; minimum: number; level: string }[];
}) {
  return (
    <section className="surface-card card-hover flex h-full flex-col p-5" aria-label="Necessidade de reposição">
      <PanelHeader icon={AlertTriangle} title="Empresas com Necessidade de Reposição" meta={`${items.length} item(ns)`} href="/estoque" />
      {items.length === 0 ? (
        <PanelEmpty icon={CheckCircle2}>Todas as empresas estão com níveis de estoque regulares acima do mínimo.</PanelEmpty>
      ) : (
        <ul className="space-y-2.5">
          {items.map((item, idx) => (
            <li key={`${item.companyId}-${item.material}-${idx}`}>
              <Link
                href={`/estoque`}
                className="group flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-card p-3 transition-all hover:-translate-y-0.5 hover:border-highlight/35 hover:shadow-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-xs font-semibold text-muted-foreground uppercase">{item.company}</span>
                    <span className={cn("size-2 rounded-full", item.level === "sem_disponibilidade" || item.level === "critico" ? "bg-destructive animate-pulse" : "bg-highlight")} />
                  </div>
                  <p className="mt-0.5 truncate text-sm font-medium text-primary">{item.material}</p>
                </div>
                <div className="text-right">
                  <span className="block text-xs font-semibold tabular-nums text-destructive">
                    {item.available} disp. (mín. {item.minimum})
                  </span>
                  <span className="text-[0.65rem] tracking-wide text-muted-foreground uppercase">
                    Repor urgente
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Painel de solicitações recentes aguardando ou em andamento */
export function RecentRequestsPanel({
  items,
}: {
  items: { id: string; title: string; company: string; status: string; createdAt: string; itemsCount: number }[];
}) {
  return (
    <section className="surface-card card-hover flex h-full flex-col p-5" aria-label="Solicitações operacionais">
      <PanelHeader icon={ShoppingCart} title="Solicitações Operacionais" meta={`${items.length} recente(s)`} href="/solicitacoes" />
      {items.length === 0 ? (
        <PanelEmpty icon={Inbox}>Nenhuma solicitação registrada no momento.</PanelEmpty>
      ) : (
        <ul className="space-y-2.5">
          {items.map((req) => {
            const statusPres = presentationOf(REQUEST_STATUS, req.status);
            return (
              <li key={req.id}>
                <Link
                  href={`/solicitacoes/${req.id}`}
                  className="group flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-card p-3 transition-all hover:-translate-y-0.5 hover:border-highlight/35 hover:shadow-xs"
                >
                  <div className="min-w-0 flex-1">
                    <span className="truncate text-xs font-semibold text-muted-foreground uppercase">{req.company}</span>
                    <p className="mt-0.5 truncate text-sm font-medium text-primary">{req.title}</p>
                    <time className="mt-1 block text-[0.7rem] text-muted-foreground">
                      {formatDateTimeFortaleza(req.createdAt)} · {req.itemsCount} item(ns)
                    </time>
                  </div>
                  <div className="shrink-0">
                    <StatusBadge label={statusPres.label} tone={statusPres.tone} />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/** Painel de entregas e conferência de materiais */
export function DeliveriesSummaryPanel({
  delivered,
  pending,
}: {
  delivered: number;
  pending: number;
}) {
  const total = delivered + pending;
  const progressPct = total > 0 ? Math.round((delivered / total) * 100) : 100;

  return (
    <section className="surface-card card-hover flex h-full flex-col p-5" aria-label="Resumo de entregas">
      <PanelHeader icon={Truck} title="Entregas & Atendimento" href="/solicitacoes" />
      <div className="flex flex-1 flex-col justify-between gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-success-foreground/15 bg-success/30 p-3">
            <span className="text-[0.68rem] font-semibold tracking-wider text-success-foreground uppercase">Realizadas</span>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-success-foreground">{delivered} un</p>
          </div>
          <div className="rounded-xl border border-highlight/20 bg-highlight/10 p-3">
            <span className="text-[0.68rem] font-semibold tracking-wider text-highlight uppercase">Pendentes</span>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-highlight">{pending} un</p>
          </div>
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
            <span>Taxa de conclusão de entregas</span>
            <span className="font-semibold tabular-nums">{progressPct}%</span>
          </div>
          <ProgressBar value={progressPct} label="Taxa de entregas" showValue={false} />
        </div>
      </div>
    </section>
  );
}

/** Painel de próximas reuniões */
export function UpcomingMeetingsPanel({
  items,
}: {
  items: { id: string; title: string; company: string; scheduledAt: string }[];
}) {
  return (
    <section className="surface-card card-hover flex h-full flex-col p-5" aria-label="Próximas reuniões">
      <PanelHeader icon={CalendarDays} title="Próximas Reuniões" meta={`${items.length} agendada(s)`} href="/reunioes" />
      {items.length === 0 ? (
        <PanelEmpty icon={CalendarClock}>Nenhuma reunião agendada para os próximos dias.</PanelEmpty>
      ) : (
        <ul className="space-y-2.5">
          {items.map((m) => (
            <li key={m.id}>
              <Link
                href="/reunioes"
                className="group flex items-start gap-3 rounded-xl border border-border/70 bg-card p-3 transition-all hover:-translate-y-0.5 hover:border-highlight/35 hover:shadow-xs"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                  <CalendarDays className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <span className="truncate text-xs font-semibold text-muted-foreground uppercase">{m.company}</span>
                  <p className="truncate text-sm font-medium text-primary">{m.title}</p>
                  <time className="mt-0.5 block text-[0.72rem] text-highlight font-medium">
                    {formatDateTimeFortaleza(m.scheduledAt)}
                  </time>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function AlertsPanel({ items, unread }: { items: DashboardAlertItem[]; unread: number }) {
  return (
    <section className="surface-card card-hover flex h-full flex-col p-5" aria-label="Alertas recentes">
      <PanelHeader icon={Bell} title="Alertas & Avisos" meta={`${unread} não lido(s)`} href="/alertas" />
      {items.length === 0 ? (
        <PanelEmpty icon={Inbox}>Nenhum alerta gerado. Prazos e avisos importantes aparecem aqui.</PanelEmpty>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="group flex items-start gap-3 rounded-xl border border-transparent bg-secondary/60 px-3 py-2.5 transition-all hover:-translate-y-0.5 hover:border-highlight/30 hover:bg-card hover:shadow-xs"
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
              <Link href={item.href} className="group flex items-start gap-3 rounded-xl border border-border/70 bg-card px-3 py-3 transition-all hover:-translate-y-0.5 hover:border-highlight/35 hover:shadow-xs">
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
              <Link href={item.href} className="group flex items-center justify-between gap-3 rounded-xl border border-border/70 px-3 py-3 transition-all hover:-translate-y-0.5 hover:border-highlight/35 hover:shadow-xs">
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
  { href: "/solicitacoes/nova", label: "Nova Solicitação", detail: "Registrar pedido de material", icon: ShoppingCart },
  { href: "/conselhos", label: "Empresas", detail: "Ver empresas e contatos WhatsApp", icon: Building2 },
  { href: "/estoque", label: "Estoque & Reposição", detail: "Saldos, entradas e níveis críticos", icon: Package },
  { href: "/reunioes", label: "Reuniões", detail: "Agendar e registrar atas", icon: CalendarDays },
  { href: "/processos", label: "Documentos", detail: "Processos e arquivos anexados", icon: ClipboardList },
  { href: "/alertas", label: "Alertas", detail: "Vencimentos e avisos", icon: Bell },
] as const;

export function ShortcutGrid() {
  return (
    <section aria-label="Atalhos Rápidos" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {SHORTCUTS.map(({ href, label, detail, icon: Icon }) => (
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
