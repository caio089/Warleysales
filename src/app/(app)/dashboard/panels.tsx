import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  Bell,
  Calendar,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Inbox,
  ShoppingCart,
  Truck,
  type LucideIcon,
} from "lucide-react";
import type { DashboardDeadline } from "@/modules/reports/service";
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

function parseMaterialLabel(raw: string): { sku: string; name: string } {
  if (raw.includes(" — ")) {
    const [part1, ...rest] = raw.split(" — ");
    return { sku: part1.trim(), name: rest.join(" — ").trim() };
  }
  if (raw.includes(" - ")) {
    const [part1, ...rest] = raw.split(" - ");
    return { sku: part1.trim(), name: rest.join(" - ").trim() };
  }
  return { sku: "", name: raw };
}

/** Painel de órgãos que necessitam de reposição / atenção de estoque */
export function ReplenishmentPanel({
  items,
}: {
  items: { companyId: string; company: string; material: string; available: number; minimum: number; level: string }[];
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-full" aria-label="Necessidade de reposição">
      <div>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Órgãos com Necessidade de Reposição</h2>
              <p className="text-xs text-slate-500">{items.length} itens abaixo do estoque mínimo</p>
            </div>
          </div>
          <Link href="/estoque" className="text-xs font-semibold text-[#0F2942] hover:underline flex items-center gap-1">
            Ver todos <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
            <CheckCircle2 className="size-6 text-emerald-500" />
            <p>Todos os órgãos estão com níveis de estoque regulares acima do mínimo.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 px-5">
            {items.map((item, idx) => {
              const parsed = parseMaterialLabel(item.material);
              return (
                <div key={`${item.companyId}-${item.material}-${idx}`} className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/60 -mx-5 px-5 transition-colors">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-50 text-red-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        {item.company}
                      </span>
                      <span className="text-sm font-semibold text-slate-800">{parsed.name}</span>
                      {parsed.sku ? (
                        <span className="font-mono text-[11px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                          {parsed.sku}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-red-600 block">
                      {item.available} disp. <span className="text-slate-400 font-normal">(mín. {item.minimum})</span>
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Repor Urgente
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/** Painel de solicitações recentes aguardando ou em andamento */
export function RecentRequestsPanel({
  items,
}: {
  items: { id: string; title: string; company: string; status: string; createdAt: string; itemsCount: number }[];
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-full" aria-label="Solicitações operacionais">
      <div>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Solicitações Operacionais</h2>
              <p className="text-xs text-slate-500">{items.length} recentes registradas</p>
            </div>
          </div>
          <Link href="/solicitacoes" className="text-xs font-semibold text-[#0F2942] hover:underline flex items-center gap-1">
            Ver todos <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
            <Inbox className="size-6 text-slate-400" />
            <p>Nenhuma solicitação operacional registrada no momento.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 px-5">
            {items.map((sol) => {
              const statusPres = presentationOf(REQUEST_STATUS, sol.status);
              return (
                <Link
                  key={sol.id}
                  href={`/solicitacoes/${sol.id}`}
                  className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/60 -mx-5 px-5 transition-colors block"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {sol.company}
                      </span>
                      <p className="text-sm font-semibold text-slate-800 truncate">{sol.title}</p>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {formatDateTimeFortaleza(sol.createdAt)} · {sol.itemsCount} item(ns)
                    </p>
                  </div>
                  <span className="shrink-0">
                    <StatusBadge label={statusPres.label} tone={statusPres.tone} />
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/** Painel de alertas com divisórias contínuas */
export function AlertsPanel({ items, unread }: { items: DashboardAlertItem[]; unread: number }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-full" aria-label="Alertas recentes">
      <div>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Alertas & Avisos</h2>
              <p className="text-xs text-slate-500">{unread} não lidos</p>
            </div>
          </div>
          <Link href="/alertas" className="text-xs font-semibold text-[#0F2942] hover:underline flex items-center gap-1">
            Ver todos <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
            <Inbox className="size-6 text-slate-400" />
            <p>Nenhum alerta gerado. Prazos e avisos importantes aparecem aqui.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 px-5 max-h-[380px] overflow-y-auto">
            {items.map((alerta) => (
              <Link
                key={alerta.id}
                href={alerta.href}
                className="py-3.5 flex items-start justify-between gap-3 hover:bg-slate-50/60 -mx-5 px-5 transition-colors block"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full mt-1.5 shrink-0",
                      alerta.unread ? "bg-amber-500" : "bg-slate-300",
                    )}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{alerta.title}</p>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{alerta.body}</p>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      {formatDateTimeFortaleza(alerta.at)}
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Card Combinado: Próximas Reuniões + Prazos (60 dias) */
export function AgendaAndDeadlinesPanel({
  meetings,
  deadlines,
}: {
  meetings: { id: string; title: string; company: string; scheduledAt: string }[];
  deadlines: DashboardDeadline[];
}) {
  const meeting = meetings[0];
  const deadline = deadlines[0];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5" aria-label="Agenda e prazos">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
            <Calendar className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-slate-900">Agenda & Prazos (60 dias)</h2>
        </div>
        <Link href="/reunioes" className="text-xs font-semibold text-[#0F2942] hover:underline">
          Ver todos
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Sub-bloco Reunião */}
        {meeting ? (
          <Link
            href="/reunioes"
            className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 block hover:bg-slate-100/60 transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                Reunião · {meeting.company}
              </span>
              <span className="text-[11px] font-semibold text-amber-600">
                {formatDateTimeFortaleza(meeting.scheduledAt)}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-800 mt-1 truncate">
              {meeting.title}
            </p>
          </Link>
        ) : (
          <div className="p-3 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400 flex items-center justify-center">
            Nenhuma reunião agendada
          </div>
        )}

        {/* Sub-bloco Contrato / Ata */}
        {deadline ? (
          <Link
            href={deadline.href}
            className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col justify-between hover:bg-slate-100/60 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {deadline.kind === "contract" ? "Contrato" : "Ata"}
              </span>
              <span
                className={cn(
                  "text-[11px] font-bold px-2 py-0.5 rounded-full",
                  deadline.days <= 15 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700",
                )}
              >
                Vence em {deadline.days}d
              </span>
            </div>
            <p className="text-sm font-bold text-slate-900 mt-1 font-mono truncate">{deadline.label}</p>
          </Link>
        ) : (
          <div className="p-3 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400 flex items-center justify-center">
            Nenhum prazo próximo
          </div>
        )}
      </div>
    </div>
  );
}

/** Card: Situação dos Processos */
export function StatusDistribution({
  rows,
  total,
}: {
  rows: { status: string; count: number }[];
  total: number;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex-1 flex flex-col justify-between" aria-label="Processos por situação">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <h2 className="text-sm font-bold text-slate-900">Situação dos Processos</h2>
      </div>

      {total === 0 ? (
        <div className="p-4 text-center text-xs text-slate-400">
          Nenhum processo neste recorte.
        </div>
      ) : (
        <div className="space-y-3 my-auto">
          {rows.map((row) => {
            const pct = total === 0 ? 0 : Math.round((row.count / total) * 100);
            const presentation = presentationOf(PROCESS_STATUS, row.status);
            const cor =
              row.status === "concluido"
                ? "bg-emerald-500"
                : row.status === "em_andamento"
                  ? "bg-[#0F2942]"
                  : "bg-amber-500";

            return (
              <div key={row.status} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-600">{presentation.label}</span>
                  <span className="font-bold text-slate-900">{row.count}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${cor}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Mantido para foco em Prazos específico */
export function DeadlinesPanel({ items }: { items: DashboardDeadline[] }) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex h-full flex-col p-5" aria-label="Prazos próximos">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
          <CalendarClock className="w-4 h-4" />
        </div>
        <h2 className="text-sm font-bold text-slate-900">Prazos (60 dias)</h2>
      </div>
      {items.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400">Nenhum contrato ou ata vence nos próximos 60 dias neste recorte.</div>
      ) : (
        <div className="divide-y divide-slate-100">
          {items.map((item) => (
            <Link
              key={`${item.kind}-${item.id}`}
              href={item.href}
              className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors block"
            >
              <span>
                <span className="block text-[0.7rem] font-semibold tracking-wider text-slate-400 uppercase">
                  {item.kind === "contract" ? "Contrato" : "Ata"}
                </span>
                <span className="text-sm font-medium text-slate-800">{item.label}</span>
              </span>
              <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums", item.days <= 15 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700")}>
                {item.days} d
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

/** Mantido para compatibilidade */
export function UpcomingMeetingsPanel({
  items,
}: {
  items: { id: string; title: string; company: string; scheduledAt: string }[];
}) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col p-5" aria-label="Próximas reuniões">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
            <CalendarDays className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-slate-900">Próximas Reuniões</h2>
        </div>
        <Link href="/reunioes" className="text-xs font-semibold text-[#0F2942] hover:underline">
          Ver todos
        </Link>
      </div>
      {items.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-400">Nenhuma reunião agendada para os próximos dias.</div>
      ) : (
        <div className="divide-y divide-slate-100">
          {items.map((m) => (
            <Link
              key={m.id}
              href="/reunioes"
              className="py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors block"
            >
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">{m.company}</span>
                <p className="truncate text-sm font-medium text-slate-800 mt-1">{m.title}</p>
                <time className="mt-0.5 block text-xs text-amber-600 font-medium">
                  {formatDateTimeFortaleza(m.scheduledAt)}
                </time>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

/** Mantido para compatibilidade */
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
    <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col p-5" aria-label="Resumo de entregas">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
          <Truck className="w-4 h-4" />
        </div>
        <h2 className="text-sm font-bold text-slate-900">Entregas & Atendimento</h2>
      </div>
      <div className="flex flex-1 flex-col justify-between gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            <span className="text-[0.68rem] font-semibold tracking-wider text-emerald-800 uppercase">Realizadas</span>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-emerald-700">{delivered} un</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
            <span className="text-[0.68rem] font-semibold tracking-wider text-amber-800 uppercase">Pendentes</span>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-amber-700">{pending} un</p>
          </div>
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500">
            <span>Taxa de conclusão de entregas</span>
            <span className="font-semibold tabular-nums text-slate-700">{progressPct}%</span>
          </div>
          <ProgressBar value={progressPct} label="Taxa de entregas" showValue={false} />
        </div>
      </div>
    </section>
  );
}
