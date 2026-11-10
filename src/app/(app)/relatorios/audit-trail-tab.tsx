"use client";

import { useMemo, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Activity,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FilterX,
  Search,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AuditEntry } from "@/modules/audit/schemas";
import { formatPercent } from "@/shared/lib/format";
import { formatDateTimeFortaleza, toFortalezaDate } from "@/shared/lib/time";
import { KpiCard } from "@/shared/ui/kpi-card";
import { StatusBadge } from "@/shared/ui/status-badge";

export const ACTION_LABELS: Record<string, string> = {
  "process.create": "Criação de Processo",
  "process.status_change": "Alteração de Situação",
  "process.closing_report": "Relatório de Encerramento",
  "process.close_incomplete": "Encerramento Incompleto",
  "purchase.receive_incomplete": "Recebimento Incompleto",
  "request.create": "Criação de Solicitação",
  "request.approve": "Aprovação de Solicitação",
  "request.reject": "Recusa de Solicitação",
  "request.cancel": "Cancelamento de Solicitação",
  "request.order": "Emissão de Pedido",
  "request.receive": "Recebimento de Solicitação",
  "order.create": "Criação de Pedido de Material",
  "order.approve": "Aprovação de Pedido",
  "order.reject": "Recusa de Pedido",
  "order.dispatch": "Expedição de Pedido",
  "order.cancel": "Cancelamento de Pedido",
  "formalization.submit": "Submissão de Formalização",
  "formalization.homologate": "Homologação de Formalização",
  "formalization.reject": "Recusa de Formalização",
  "stock.entry": "Entrada em Estoque",
  "stock.exit": "Saída de Estoque",
  "stock.reserve": "Reserva de Estoque",
  "stock.release_reserve": "Liberação de Reserva",
  "stock.set_minimum": "Definição de Estoque Mínimo",
  "stock.physical_count": "Contagem Física / Inventário",
  "ata.create": "Criação de Ata",
  "ata.activate": "Ativação de Ata",
  "ata.extend": "Prorrogação de Ata",
  "ata.allocate": "Remanejamento de Ata",
  "contract.create": "Criação de Contrato",
  "contract.amend": "Aditivo de Contrato",
  "document.upload": "Upload de Documento",
  "document.unlink": "Desvinculação de Documento",
  "document.manual_delete": "Exclusão Manual de Documento",
  "meeting.create": "Criação de Reunião",
  "meeting.minutes": "Registro de Ata da Reunião",
  "meeting.action_item": "Item de Ação de Reunião",
  "supplier.create": "Cadastro de Fornecedor",
  "supplier.update": "Atualização de Fornecedor",
  "council.create": "Criação de Órgão",
  "council.update": "Atualização de Órgão",
  "membership.assign": "Atribuição de Papel",
  "membership.remove": "Remoção de Membro",
  "retention.authorize": "Autorização de Temporalidade",
  "retention.hold": "Aplicação de Bloqueio Legal",
  "retention.release_hold": "Liberação de Bloqueio Legal",
  "retention.archive": "Arquivamento de Processo",
  "retention.dispose": "Eliminação de Processo",
};

export function formatActionLabel(action: string): string {
  if (ACTION_LABELS[action]) return ACTION_LABELS[action];
  return action
    .replace(/[._]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export const ENTITY_LABELS: Record<string, string> = {
  administrative_process: "Processos Administrativos",
  purchase_request: "Solicitações de Compra",
  material_order: "Pedidos de Materiais",
  process_formalization: "Formalizações",
  stock_movement: "Movimentações de Estoque",
  stock_balance: "Saldos de Estoque",
  price_registration_ata: "Atas de Registro de Preço",
  contract: "Contratos",
  attachment: "Documentos",
  meeting: "Reuniões",
  supplier: "Fornecedores",
  council: "Órgãos / Conselhos",
  council_membership: "Usuários e Permissões",
  retention_schedule: "Tabela de Temporalidade",
};

export function formatEntityLabel(entity: string): string {
  if (ENTITY_LABELS[entity]) return ENTITY_LABELS[entity];
  return entity
    .replace(/[._]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function extractJustificationOrDetails(details: Record<string, unknown> | null | undefined): string {
  if (!details || typeof details !== "object") return "—";

  if (typeof details.justification === "string" && details.justification.trim()) {
    return details.justification.trim();
  }
  if (typeof details.reason === "string" && details.reason.trim()) {
    return details.reason.trim();
  }
  if (typeof details.note === "string" && details.note.trim()) {
    return details.note.trim();
  }
  if (Array.isArray(details.missingTypes) && details.missingTypes.length > 0) {
    return `Pendências: ${details.missingTypes.join(", ")}`;
  }
  if (details.number !== undefined) {
    return `Nº ${details.number}`;
  }
  if (details.quantity !== undefined) {
    return `Qtd: ${details.quantity}`;
  }

  const entries = Object.entries(details).filter(
    ([, v]) => v !== undefined && v !== null && v !== "" && typeof v !== "object",
  );
  if (entries.length > 0) {
    return entries.map(([k, v]) => `${k}: ${v}`).join(", ");
  }
  return "—";
}

export interface AuditTrailFilters {
  councilId?: string;
  entity?: string;
  actorId?: string;
  period?: "todos" | "hoje" | "7d" | "30d" | string;
  result?: "todos" | "success" | "denied" | "error" | string;
}

export interface AuditTrailTabProps {
  entries: AuditEntry[];
  councils: { id: string; label: string }[];
  councilLabel?: Record<string, string>;
  initialFilters?: AuditTrailFilters;
}

export function matchesPeriod(createdAt: Date | string, period?: string): boolean {
  if (!period || period === "todos") return true;
  const date = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
  const now = new Date();
  if (period === "hoje") {
    return toFortalezaDate(date) === toFortalezaDate(now);
  }
  if (period === "7d") {
    return date.getTime() >= now.getTime() - 7 * 86_400_000;
  }
  if (period === "30d") {
    return date.getTime() >= now.getTime() - 30 * 86_400_000;
  }
  return true;
}

export function AuditTrailTab({
  entries,
  councils,
  councilLabel = {},
  initialFilters = {},
}: AuditTrailTabProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [councilFilter, setCouncilFilter] = useState(initialFilters.councilId ?? "");
  const [entityFilter, setEntityFilter] = useState(initialFilters.entity ?? "");
  const [userFilter, setUserFilter] = useState(initialFilters.actorId ?? "");
  const [periodFilter, setPeriodFilter] = useState(initialFilters.period ?? "todos");
  const [resultFilter, setResultFilter] = useState(initialFilters.result ?? "todos");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // Sincroniza query params
  const updateUrl = (updates: Partial<{ councilId: string; entity: string; actorId: string; period: string; result: string }>) => {
    if (!router || !pathname) return;
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (pathname.includes("/relatorios")) {
      params.set("tab", "auditoria");
    }
    Object.entries(updates).forEach(([key, val]) => {
      if (val && val !== "todos") {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    });
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const handleClearFilters = () => {
    setCouncilFilter("");
    setEntityFilter("");
    setUserFilter("");
    setPeriodFilter("todos");
    setResultFilter("todos");
    setPage(1);
    if (router && pathname) {
      const params = new URLSearchParams();
      if (pathname.includes("/relatorios")) {
        params.set("tab", "auditoria");
      }
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    }
  };

  // Lista dinâmica de módulos
  const availableEntities = useMemo(() => {
    const known = Object.keys(ENTITY_LABELS);
    const fromEntries = entries.map((e) => e.entity);
    const all = Array.from(new Set([...known, ...fromEntries])).sort();
    return all.map((e) => ({ id: e, label: formatEntityLabel(e) }));
  }, [entries]);

  // Filtragem local
  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      if (councilFilter && e.councilId !== councilFilter) return false;
      if (entityFilter && e.entity !== entityFilter) return false;
      if (userFilter.trim()) {
        const query = userFilter.trim().toLowerCase();
        const actor = e.actorId ? e.actorId.toLowerCase() : "sistema (job)";
        if (!actor.includes(query)) return false;
      }
      if (!matchesPeriod(e.createdAt, periodFilter)) return false;
      if (resultFilter && resultFilter !== "todos" && e.result !== resultFilter) return false;
      return true;
    });
  }, [entries, councilFilter, entityFilter, userFilter, periodFilter, resultFilter]);

  // Métricas
  const totalCount = filteredEntries.length;
  const successCount = filteredEntries.filter((e) => e.result === "success").length;
  const failedCount = filteredEntries.filter((e) => e.result === "denied" || e.result === "error").length;
  const successRate = totalCount > 0 ? (successCount / totalCount) * 100 : null;

  // Paginação
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedEntries = filteredEntries.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const hasActiveFilters = Boolean(
    councilFilter || entityFilter || userFilter || (periodFilter && periodFilter !== "todos") || (resultFilter && resultFilter !== "todos"),
  );

  return (
    <div className="space-y-6">
      {/* Top Cards de Métricas */}
      <section aria-labelledby="kpis-auditoria" className="space-y-3">
        <h2 id="kpis-auditoria" className="sr-only">Métricas da Trilha de Auditoria</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Total de Ações"
            value={totalCount}
            hint="Eventos registrados no período"
            icon={<Activity className="size-4" aria-hidden />}
          />
          <KpiCard
            label="Ações Bem-Sucedidas"
            value={successCount}
            hint={totalCount > 0 ? `${formatPercent((successCount / totalCount) * 100)} do total filtrado` : "Nenhum evento"}
            icon={<CheckCircle2 className="size-4" aria-hidden />}
          />
          <KpiCard
            label="Negadas e Erros"
            value={failedCount}
            hint={failedCount > 0 ? "Atenção necessária" : "Zero inconformidades"}
            accent={failedCount > 0}
            icon={<ShieldAlert className="size-4" aria-hidden />}
          />
          <KpiCard
            label="Taxa de Conformidade"
            value={successRate === null ? null : formatPercent(successRate)}
            hint="Operações válidas"
            icon={<ShieldCheck className="size-4" aria-hidden />}
          />
        </div>
      </section>

      {/* Barra de Filtros */}
      <section aria-label="Filtros de Auditoria" className="surface-card p-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 items-end">
          {/* Órgão */}
          <label className="flex flex-col gap-1.5">
            <span className="text-[0.7rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">Órgão</span>
            <select
              aria-label="Filtrar por órgão"
              value={councilFilter}
              onChange={(e) => {
                const val = e.target.value;
                setCouncilFilter(val);
                setPage(1);
                updateUrl({ councilId: val });
              }}
              className="h-10 rounded-xl border border-input bg-card px-3 text-sm font-medium text-foreground shadow-xs transition-colors focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 focus-visible:outline-none"
            >
              <option value="">Todos os órgãos</option>
              {councils.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>

          {/* Módulo / Entidade */}
          <label className="flex flex-col gap-1.5">
            <span className="text-[0.7rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">Módulo / Entidade</span>
            <select
              aria-label="Filtrar por módulo"
              value={entityFilter}
              onChange={(e) => {
                const val = e.target.value;
                setEntityFilter(val);
                setPage(1);
                updateUrl({ entity: val });
              }}
              className="h-10 rounded-xl border border-input bg-card px-3 text-sm font-medium text-foreground shadow-xs transition-colors focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 focus-visible:outline-none"
            >
              <option value="">Todos os módulos</option>
              {availableEntities.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>

          {/* Usuário */}
          <label className="flex flex-col gap-1.5">
            <span className="text-[0.7rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">Usuário / Autor</span>
            <div className="relative">
              <Search className="pointer-events-none absolute top-3 left-3 size-4 text-muted-foreground" aria-hidden />
              <Input
                aria-label="Filtrar por usuário"
                type="text"
                placeholder="Buscar autor…"
                value={userFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  setUserFilter(val);
                  setPage(1);
                  updateUrl({ actorId: val });
                }}
                className="h-10 pl-9 rounded-xl text-sm"
              />
            </div>
          </label>

          {/* Período */}
          <label className="flex flex-col gap-1.5">
            <span className="text-[0.7rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">Período</span>
            <select
              aria-label="Filtrar por período"
              value={periodFilter}
              onChange={(e) => {
                const val = e.target.value;
                setPeriodFilter(val);
                setPage(1);
                updateUrl({ period: val });
              }}
              className="h-10 rounded-xl border border-input bg-card px-3 text-sm font-medium text-foreground shadow-xs transition-colors focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 focus-visible:outline-none"
            >
              <option value="todos">Todos os períodos</option>
              <option value="hoje">Hoje</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
            </select>
          </label>

          {/* Resultado */}
          <label className="flex flex-col gap-1.5">
            <span className="text-[0.7rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">Resultado</span>
            <select
              aria-label="Filtrar por resultado"
              value={resultFilter}
              onChange={(e) => {
                const val = e.target.value;
                setResultFilter(val);
                setPage(1);
                updateUrl({ result: val });
              }}
              className="h-10 rounded-xl border border-input bg-card px-3 text-sm font-medium text-foreground shadow-xs transition-colors focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 focus-visible:outline-none"
            >
              <option value="todos">Todos os resultados</option>
              <option value="success">Sucesso</option>
              <option value="denied">Negado</option>
              <option value="error">Erro</option>
            </select>
          </label>
        </div>

        {hasActiveFilters ? (
          <div className="flex justify-end pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <FilterX className="size-3.5" />
              Limpar Filtros
            </Button>
          </div>
        ) : null}
      </section>

      {/* Tabela Detalhada */}
      {filteredEntries.length === 0 ? (
        <div className="surface-card p-12 text-center space-y-3">
          <ShieldAlert className="mx-auto size-10 text-muted-foreground/60" aria-hidden />
          <p className="text-base font-semibold">Nenhum registro de auditoria encontrado</p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Não foram localizados registros de auditoria correspondentes aos critérios de filtragem selecionados.
          </p>
          {hasActiveFilters ? (
            <Button variant="outline" size="sm" onClick={handleClearFilters} className="mt-2">
              Limpar Filtros
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="surface-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Registros detalhados da trilha de auditoria</caption>
              <thead className="border-b border-border bg-muted/40 text-[0.7rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                <tr>
                  <th scope="col" className="px-4 py-3.5 whitespace-nowrap">Data / Hora</th>
                  <th scope="col" className="px-4 py-3.5 whitespace-nowrap">Órgão</th>
                  <th scope="col" className="px-4 py-3.5 whitespace-nowrap">Autor</th>
                  <th scope="col" className="px-4 py-3.5 whitespace-nowrap">Ação</th>
                  <th scope="col" className="px-4 py-3.5 whitespace-nowrap">Módulo</th>
                  <th scope="col" className="px-4 py-3.5">Justificativa / Detalhes</th>
                  <th scope="col" className="px-4 py-3.5 text-right whitespace-nowrap">Resultado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {paginatedEntries.map((entry) => {
                  const councilName = entry.councilId
                    ? councilLabel[entry.councilId] ?? councils.find((c) => c.id === entry.councilId)?.label ?? entry.councilId
                    : "Central";
                  const justification = extractJustificationOrDetails(entry.details);
                  const resultTone = entry.result === "success" ? "success" : entry.result === "denied" ? "warning" : "danger";
                  const resultLabel = entry.result === "success" ? "Sucesso" : entry.result === "denied" ? "Negado" : "Erro";

                  return (
                    <tr key={entry.id} className="transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3 text-xs whitespace-nowrap text-muted-foreground tabular-nums">
                        {formatDateTimeFortaleza(entry.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap font-medium text-foreground">
                        {councilName}
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap text-muted-foreground">
                        {entry.actorId ?? "Sistema (job)"}
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap">
                        <span className="font-medium text-foreground block">
                          {formatActionLabel(entry.action)}
                        </span>
                        <span className="text-[0.65rem] text-muted-foreground font-mono">
                          {entry.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap text-muted-foreground">
                        {formatEntityLabel(entry.entity)}
                        {entry.entityId ? (
                          <span className="block text-[0.65rem] font-mono opacity-80" title={entry.entityId}>
                            ID: {entry.entityId.length > 12 ? `${entry.entityId.slice(0, 8)}…` : entry.entityId}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-xs max-w-sm">
                        {justification !== "—" ? (
                          <span
                            className="inline-block rounded border border-border/60 bg-muted/50 px-2 py-0.5 text-xs text-foreground max-w-xs md:max-w-md truncate"
                            title={justification}
                          >
                            {justification}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <StatusBadge label={resultLabel} tone={resultTone} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Barra de Paginação */}
          {totalPages > 1 ? (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-xs text-muted-foreground">
              <span>
                Mostrando {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalCount)} de {totalCount} eventos
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-8 gap-1 px-2.5"
                >
                  <ChevronLeft className="size-3.5" />
                  Anterior
                </Button>
                <span className="tabular-nums font-medium">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="h-8 gap-1 px-2.5"
                >
                  Próximo
                  <ChevronRight className="size-3.5" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="border-t border-border px-4 py-2.5 text-right text-xs text-muted-foreground">
              {totalCount} {totalCount === 1 ? "evento registrado" : "eventos registrados"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
