"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, Search, SlidersHorizontal, X } from "lucide-react";
import { useId, useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "./feedback-states";
import {
  nextSort,
  runTableQuery,
  type FilterDefinition,
  type SortDirection,
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
  emptyTitle = "Nenhum registro encontrado",
  emptyDescription,
  emptyAction,
}: DataTableProps<T>) {
  const searchId = useId();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{ key: string | null; direction: SortDirection }>({ key: null, direction: "asc" });
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  const result = useMemo(
    () =>
      runTableQuery(data, columns, filters, {
        search,
        sortKey: sort.key,
        sortDirection: sort.direction,
        filters: activeFilters,
        page,
        pageSize,
      }),
    [data, columns, filters, search, sort, activeFilters, page, pageSize],
  );
  const hasActiveQuery = search.trim().length > 0 || Object.values(activeFilters).some(Boolean);
  const clearQuery = () => { setSearch(""); setActiveFilters({}); setPage(1); };

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
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            autoComplete="off"
          />
        </div>
        {filters.map((filter) => (
          <label key={filter.id} className="flex flex-col gap-1.5">
            <span className="text-[0.7rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">{filter.label}</span>
            <select
              className="h-10 min-w-40 rounded-lg border border-input bg-card px-3 text-sm font-medium text-foreground focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 focus-visible:outline-none"
              value={activeFilters[filter.id] ?? ""}
              onChange={(e) => { setActiveFilters((f) => ({ ...f, [filter.id]: e.target.value })); setPage(1); }}
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
                    const active = sort.key === col.key;
                    const ariaSort = active ? (sort.direction === "asc" ? "ascending" : "descending") : "none";
                    const Icon = !active ? ArrowUpDown : sort.direction === "asc" ? ArrowUp : ArrowDown;
                    return (
                      <th key={col.key} scope="col" aria-sort={col.sortable ? ariaSort : undefined} className="px-4 py-3.5 text-[0.7rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                        {col.sortable ? (
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-md tracking-[0.12em] uppercase transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            onClick={() => { setSort((s) => nextSort(s, col.key)); setPage(1); }}
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
            <Button variant="outline" size="sm" disabled={result.page <= 1} onClick={() => setPage(result.page - 1)}>Anterior</Button>
            <span>Página {result.page} de {result.pageCount}</span>
            <Button variant="outline" size="sm" disabled={result.page >= result.pageCount} onClick={() => setPage(result.page + 1)}>Próxima</Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
