"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { contextualHref } from "@/shared/ui/contextual-link";
import { useRouter } from "next/navigation";
import { type ReactNode, useCallback, useEffect, useId, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  Search,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  type FilterDefinition,
  type QueryColumn,
  type UrlTableState,
  nextSort,
  parseTableUrlState,
  filterAndSortTableRows,
  paginateTableRows,
  writeTableUrlState,
} from "@/shared/ui/data-table-logic";
import { EmptyState } from "@/shared/ui/feedback-states";
import { ProgressBar } from "@/shared/ui/progress-bar";
import { StatusBadge } from "@/shared/ui/status-badge";
import {
  COMPLETION_STATUS,
  PROCESS_STATUS,
  presentationOf,
} from "@/shared/ui/status-presentation";
export interface ProcessTableRow {
  id: string;
  number: string;
  title: string;
  council: string;
  status: string;
  completion: string;
  progress: number;
  createdAt?: string;
  priority?: string;
  href: string;
}

export interface ProcessesTableProps {
  rows: ProcessTableRow[];
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
}

/** Tabela interativa de processos com ordenação, busca, filtros e ação rápida de anexar. */
export function ProcessesTable({
  rows,
  emptyTitle = "Nenhum processo ainda",
  emptyDescription = "Crie o primeiro processo e anexe DFD, ETP, MR, TR, PP, PJ e ED — o progresso sobe sozinho.",
  emptyAction,
}: ProcessesTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchId = useId();
  const [pageSize, setPageSize] = useState<20 | 50 | "all">(20);
  const [visibleAll, setVisibleAll] = useState(100);

  const queryColumns: QueryColumn<ProcessTableRow>[] = useMemo(
    () => [
      { key: "number", accessor: (r) => r.number, sortable: true },
      { key: "title", accessor: (r) => r.title, sortable: true },
      { key: "council", accessor: (r) => r.council, sortable: true },
      { key: "status", accessor: (r) => r.status, sortable: true },
      { key: "completion", accessor: (r) => r.completion, sortable: true },
      { key: "progress", accessor: (r) => r.progress, sortable: true },
      { key: "createdAt", accessor: (r) => r.createdAt, sortable: true, searchable: false },
    ],
    [],
  );

  const statusValues = useMemo(
    () => [...new Set(rows.map((r) => r.status))].filter(Boolean).sort(),
    [rows],
  );
  const statusOptions = useMemo(
    () =>
      statusValues.map((v) => ({
        value: v,
        label: presentationOf(PROCESS_STATUS, v).label,
      })),
    [statusValues],
  );

  const councilValues = useMemo(
    () => [...new Set(rows.map((r) => r.council))].filter(Boolean).sort(),
    [rows],
  );
  const councilOptions = useMemo(
    () => councilValues.map((c) => ({ value: c, label: c })),
    [councilValues],
  );

  const filterDefs: FilterDefinition<ProcessTableRow>[] = useMemo(
    () => [
      { id: "status", label: "Situação", options: statusOptions, accessor: (r) => r.status },
      { id: "council", label: "Órgão", options: councilOptions, accessor: (r) => r.council },
      { id: "priority", label: "Prioridade do prazo", options: [
        { value: "Alta", label: "Alta (0 a 30 dias)" },
        { value: "Média", label: "Média (31 a 60 dias)" },
        { value: "Baixa", label: "Baixa (61 a 90 dias)" },
      ], accessor: (r) => r.priority ?? "" },
    ],
    [statusOptions, councilOptions],
  );
  const namespace = "dt-processos";
  const [tableState, setTableState] = useState<UrlTableState>(() =>
    parseTableUrlState(new URLSearchParams(searchParams.toString()), namespace, queryColumns, filterDefs),
  );
  const updateTableState = useCallback((next: UrlTableState) => {
    setTableState(next);
    const params = writeTableUrlState(new URLSearchParams(window.location.search), namespace, next);
    window.history.pushState(null, "", `${window.location.pathname}${params.size ? `?${params}` : ""}${window.location.hash}`);
  }, [namespace]);
  useEffect(() => {
    const restore = () => setTableState(parseTableUrlState(new URLSearchParams(window.location.search), namespace, queryColumns, filterDefs));
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, [namespace, queryColumns, filterDefs]);
  const { search, filters: activeFilters, page } = tableState;
  const sort = useMemo(() => ({ key: tableState.sortKey, direction: tableState.sortDirection }), [tableState.sortKey, tableState.sortDirection]);

  const matchingRows = useMemo(
    () =>
      filterAndSortTableRows(rows, queryColumns, filterDefs, {
        search,
        sortKey: sort.key,
        sortDirection: sort.direction,
        filters: activeFilters,
      }),
    [rows, queryColumns, filterDefs, search, sort, activeFilters],
  );
  const result = paginateTableRows(matchingRows, page, pageSize === "all" ? visibleAll : pageSize);

  const headers: { key: string; label: string; sortable: boolean }[] = [
    { key: "number", label: "Número", sortable: true },
    { key: "title", label: "Objeto", sortable: true },
    { key: "council", label: "Órgão", sortable: true },
    { key: "status", label: "Situação", sortable: true },
    { key: "completion", label: "Documentação", sortable: true },
    { key: "progress", label: "Progresso", sortable: true },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative w-full sm:w-72">
          <label htmlFor={searchId} className="sr-only">
            Buscar na tabela
          </label>
          <Search
            className="pointer-events-none absolute top-3 left-3 size-4 text-muted-foreground"
            aria-hidden
          />
          <Input
            id={searchId}
            type="text"
            placeholder="Buscar…"
            className="pl-9"
            value={search}
            onChange={(e) => {
              updateTableState({ ...tableState, search: e.target.value, page: 1 });
            }}
            autoComplete="off"
          />
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-[0.7rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            Situação
          </span>
          <select
            className="h-10 min-w-40 rounded-lg border border-input bg-card px-3 text-sm font-medium text-foreground focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 focus-visible:outline-none"
            value={activeFilters["status"] ?? ""}
            onChange={(e) => {
              updateTableState({ ...tableState, filters: { ...activeFilters, status: e.target.value }, page: 1 });
            }}
          >
            <option value="">Todos</option>
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[0.7rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">Prioridade do prazo</span>
          <select className="h-10 min-w-40 rounded-lg border border-input bg-card px-3 text-sm font-medium text-foreground focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 focus-visible:outline-none"
            value={activeFilters.priority ?? ""}
            onChange={(event) => updateTableState({ ...tableState, filters: { ...activeFilters, priority: event.target.value }, page: 1 })}>
            <option value="">Todas as prioridades</option>
            <option value="Alta">Alta (0 a 30 dias)</option>
            <option value="Média">Média (31 a 60 dias)</option>
            <option value="Baixa">Baixa (61 a 90 dias)</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[0.7rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">Ordem de criação</span>
          <select
            className="h-10 min-w-44 rounded-lg border border-input bg-card px-3 text-sm font-medium text-foreground focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 focus-visible:outline-none"
            value={sort.key === "createdAt" ? sort.direction : ""}
            onChange={(event) => updateTableState({ ...tableState,
              sortKey: event.target.value ? "createdAt" : null,
              sortDirection: event.target.value === "asc" ? "asc" : "desc", page: 1 })}
          >
            <option value="">Ordem atual</option>
            <option value="desc">Mais recentes primeiro</option>
            <option value="asc">Mais antigos primeiro</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[0.7rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            Órgão
          </span>
          <select
            className="h-10 min-w-40 rounded-lg border border-input bg-card px-3 text-sm font-medium text-foreground focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 focus-visible:outline-none"
            value={activeFilters["council"] ?? ""}
            onChange={(e) => {
              updateTableState({ ...tableState, filters: { ...activeFilters, council: e.target.value }, page: 1 });
            }}
          >
            <option value="">Todos</option>
            {councilOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[0.7rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">Exibir</span>
          <select
            className="h-10 min-w-32 rounded-lg border border-input bg-card px-3 text-sm font-medium text-foreground focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 focus-visible:outline-none"
            value={pageSize}
            onChange={(event) => {
              const value = event.target.value;
              setPageSize(value === "all" ? "all" : value === "50" ? 50 : 20);
              setVisibleAll(100);
              updateTableState({ ...tableState, page: 1 });
            }}
          >
            <option value="20">20 processos</option>
            <option value="50">50 processos</option>
            <option value="all">Todos os processos</option>
          </select>
        </label>
      </div>

      {result.total === 0 ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      ) : (
        <div className="surface-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Processos administrativos</caption>
              <thead className="sticky top-0 bg-secondary/90 text-left backdrop-blur-sm">
                <tr>
                  {headers.map((h) => {
                    const active = sort.key === h.key;
                    const ariaSort = active
                      ? sort.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : "none";
                    const Icon = !active
                      ? ArrowUpDown
                      : sort.direction === "asc"
                        ? ArrowUp
                        : ArrowDown;

                    return (
                      <th
                        key={h.key}
                        scope="col"
                        aria-sort={h.sortable ? ariaSort : undefined}
                        className="px-4 py-3.5 text-[0.7rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase"
                      >
                        {h.sortable ? (
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-md tracking-[0.12em] uppercase transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            onClick={() => {
                              const next = nextSort(sort, h.key);
                              updateTableState({ ...tableState, sortKey: next.key, sortDirection: next.direction, page: 1 });
                            }}
                          >
                            {h.label}
                            <Icon className="size-3.5" aria-hidden />
                          </button>
                        ) : (
                          h.label
                        )}
                      </th>
                    );
                  })}
                  <th
                    scope="col"
                    className="px-4 py-3.5 text-right text-[0.7rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase"
                  >
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => {
                  const pStatus = presentationOf(PROCESS_STATUS, row.status);
                  const pCompletion = presentationOf(COMPLETION_STATUS, row.completion);

                  return (
                    <tr
                      key={row.id}
                      onClick={() => router.push(contextualHref(row.href, pathname, searchParams.size ? `?${searchParams.toString()}` : ""))}
                      className="group cursor-pointer border-t border-border/70 transition-colors hover:bg-primary/[0.035]"
                    >
                      <td className="px-4 py-3.5">
                        <Link
                          href={contextualHref(row.href, pathname, searchParams.size ? `?${searchParams.toString()}` : "")}
                          onClick={(event) => event.stopPropagation()}
                          className="font-medium text-primary underline-offset-4 transition-colors group-hover:text-highlight group-hover:underline"
                        >
                          {row.number}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5">
                        <Link
                          href={contextualHref(row.href, pathname, searchParams.size ? `?${searchParams.toString()}` : "")}
                          onClick={(event) => event.stopPropagation()}
                          className="line-clamp-2 font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
                        >
                          {row.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5">{row.council}</td>
                      <td className="px-4 py-3.5">
                        <StatusBadge label={pStatus.label} tone={pStatus.tone} />
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge
                          label={pCompletion.label}
                          tone={pCompletion.tone}
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <ProgressBar
                          value={row.progress}
                          label="Progresso"
                          className="min-w-32"
                        />
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Link
                          href={contextualHref(row.href, pathname, searchParams.size ? `?${searchParams.toString()}` : "")}
                          className={cn(
                            buttonVariants({ variant: "outline", size: "sm" }),
                            "inline-flex items-center gap-1.5",
                          )}
                          onClick={(event) => event.stopPropagation()}
                          title={`Abrir processo completo ${row.number}`}
                        >
                          <span>Abrir</span>
                          <ArrowRight className="size-3.5" aria-hidden />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {result.total > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span aria-live="polite">Exibindo {result.rows.length} de {result.total} processo(s) encontrado(s)</span>
          <div className="flex items-center gap-2">
            {pageSize === "all" && result.rows.length < result.total ? (
              <Button variant="outline" size="sm" onClick={() => setVisibleAll((count) => count + 100)}>
                Carregar mais
              </Button>
            ) : pageSize !== "all" ? (
              <>
                <Button variant="outline" size="sm" disabled={result.page <= 1}
                  onClick={() => updateTableState({ ...tableState, page: result.page - 1 })}>
                  Anterior
                </Button>
                <span>Página {result.page} de {result.pageCount}</span>
                <Button variant="outline" size="sm" disabled={result.page >= result.pageCount}
                  onClick={() => updateTableState({ ...tableState, page: result.page + 1 })}>
                  Próxima
                </Button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
