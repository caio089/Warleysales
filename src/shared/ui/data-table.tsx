"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "./feedback-states";
import {
  nextSort,
  runTableQuery,
  type FilterDefinition,
  type SortDirection,
  parseTableUrlState,
  tableQueryKey,
  writeTableUrlState,
} from "./data-table-logic";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  accessor: (row: T) => string | number | null | undefined;
  /** Renderização customizada da célula; padrão: valor do accessor. */
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  searchable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  /** Legenda acessível da tabela. */
  caption: string;
  data: readonly T[];
  columns: readonly DataTableColumn<T>[];
  getRowId: (row: T) => string;
  filters?: readonly FilterDefinition<T>[];
  pageSize?: number;
  queryKey?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
}

/** Tabela com busca, filtros, ordenação por cabeçalho (teclado) e paginação. */
export function DataTable<T>({
  caption,
  data,
  columns,
  getRowId,
  filters = [],
  pageSize = 10,
  queryKey,
  emptyTitle = "Nenhum registro encontrado",
  emptyDescription,
  emptyAction,
}: DataTableProps<T>) {
  const searchId = useId();
  const namespace = queryKey ?? tableQueryKey(caption);
  const [tableState, setTableState] = useState({ search: "", sortKey: null as string | null, sortDirection: "asc" as SortDirection, filters: {} as Record<string, string>, page: 1 });
  const { search, sortKey, sortDirection, filters: activeFilters, page } = tableState;

  const parserConfig = useRef({ columns, filters });
  useEffect(() => { parserConfig.current = { columns, filters }; });
  useEffect(() => {
    const read = () => setTableState(parseTableUrlState(new URLSearchParams(window.location.search), namespace, parserConfig.current.columns.map(({ key, sortable }) => ({ key, sortable })), parserConfig.current.filters));
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, [namespace]);

  const updateTableState = (next: typeof tableState) => {
    setTableState(next);
    const url = new URL(window.location.href);
    writeTableUrlState(url.searchParams, namespace, next);
    window.history.pushState(null, "", `${url.pathname}${url.search}${url.hash}`);
  };

  const result = useMemo(
    () =>
      runTableQuery(data, columns, filters, {
        search,
        sortKey,
        sortDirection,
        filters: activeFilters,
        page,
        pageSize,
      }),
    [data, columns, filters, search, sortKey, sortDirection, activeFilters, page, pageSize],
  );
  const hasActiveQuery = search.trim().length > 0 || Object.values(activeFilters).some(Boolean);
  const clearQuery = () => updateTableState({ ...tableState, search: "", filters: {}, page: 1 });

  return (
    <section aria-label={caption} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-border bg-card text-primary" aria-hidden><SlidersHorizontal className="size-4" /></span>
          <div>
            <h2 className="font-heading text-lg font-semibold text-primary">{caption}</h2>
            <p className="text-xs text-muted-foreground" aria-live="polite">{result.total} de {data.length} registros</p>
          </div>
        </div>
        {hasActiveQuery ? <Button type="button" variant="ghost" size="sm" onClick={clearQuery}><X className="size-3.5" aria-hidden /> Limpar filtros</Button> : null}
      </div>
      <div className="surface-card flex flex-wrap items-end gap-3 p-3 sm:p-4">
        <div className="relative w-full sm:w-72">
          <label htmlFor={searchId} className="sr-only">Buscar em {caption}</label>
          <Search className="pointer-events-none absolute top-3 left-3 size-4 text-muted-foreground" aria-hidden />
          <Input
            id={searchId}
            type="text"
            placeholder={`Buscar em ${caption.toLowerCase()}…`}
            className="pl-9"
            value={search}
            onChange={(e) => updateTableState({ ...tableState, search: e.target.value, page: 1 })}
            autoComplete="off"
          />
        </div>
        {filters.map((filter) => (
          <label key={filter.id} className="flex flex-col gap-1.5">
            <span className="text-[0.7rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">{filter.label}</span>
            <select
              className="h-10 min-w-40 rounded-lg border border-input bg-card px-3 text-sm font-medium text-foreground focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 focus-visible:outline-none"
              value={activeFilters[filter.id] ?? ""}
              onChange={(e) => updateTableState({ ...tableState, filters: { ...activeFilters, [filter.id]: e.target.value }, page: 1 })}
            >
              <option value="">Todos</option>
              {filter.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
        ))}
      </div>

      {result.total === 0 ? (
        <EmptyState
          title={hasActiveQuery ? "Nenhum resultado para estes filtros" : emptyTitle}
          description={hasActiveQuery ? "Tente outra busca ou limpe os filtros para ver todos os registros." : emptyDescription}
          action={hasActiveQuery ? <Button type="button" variant="outline" onClick={clearQuery}>Mostrar todos</Button> : emptyAction}
        />
      ) : (
        <div className="surface-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">{caption}</caption>
              <thead className="bg-secondary/90 text-left">
                <tr>
                  {columns.map((col) => {
                    const active = sortKey === col.key;
                    const ariaSort = active ? (sortDirection === "asc" ? "ascending" : "descending") : "none";
                    const Icon = !active ? ArrowUpDown : sortDirection === "asc" ? ArrowUp : ArrowDown;
                    return (
                      <th key={col.key} scope="col" aria-sort={col.sortable ? ariaSort : undefined} className="px-4 py-3.5 text-[0.7rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                        {col.sortable ? (
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-md tracking-[0.12em] uppercase transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            onClick={() => {
                              const next = nextSort({ key: sortKey, direction: sortDirection }, col.key);
                              updateTableState({ ...tableState, sortKey: next.key, sortDirection: next.direction, page: 1 });
                            }}
                          >
                            {col.header}
                            <Icon className="size-3.5" aria-hidden />
                          </button>
                        ) : col.header}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={getRowId(row)} className="border-t border-border/70 transition-colors even:bg-secondary/20 hover:bg-primary/[0.06] focus-within:bg-primary/[0.06]">
                    {columns.map((col) => (
                      <td key={col.key} className={col.className ?? "px-4 py-3.5"}>
                        {col.render ? col.render(row) : (col.accessor(row) ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {result.total > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span aria-live="polite">Mostrando {Math.min((result.page - 1) * pageSize + 1, result.total)}–{Math.min(result.page * pageSize, result.total)} de {result.total}</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={result.page <= 1} onClick={() => updateTableState({ ...tableState, page: result.page - 1 })}>Anterior</Button>
            <span>Página {result.page} de {result.pageCount}</span>
            <Button variant="outline" size="sm" disabled={result.page >= result.pageCount} onClick={() => updateTableState({ ...tableState, page: result.page + 1 })}>Próxima</Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
