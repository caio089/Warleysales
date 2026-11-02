/**
 * Lógica pura da DataTable (busca, filtro, ordenação, paginação), separada da UI para ser testável.
 */
export type SortDirection = "asc" | "desc";

export interface TableQuery {
  search: string;
  sortKey: string | null;
  sortDirection: SortDirection;
  filters: Record<string, string>;
  page: number; // base 1
  pageSize: number;
}

export interface QueryColumn<T> {
  key: string;
  /** Valor textual/numérico usado para busca e ordenação. */
  accessor: (row: T) => string | number | null | undefined;
  searchable?: boolean;
}

export interface FilterDefinition<T> {
  id: string;
  label: string;
  options: { value: string; label: string }[];
  /** Retorna o valor da linha comparado com a opção escolhida. */
  accessor: (row: T) => string;
}

export interface TablePage<T> {
  rows: T[];
  total: number;
  page: number;
  pageCount: number;
}

const collator = new Intl.Collator("pt-BR", { numeric: true, sensitivity: "base" });

/** Normaliza para busca sem acento/caixa ("Inclusão" encontra "inclusao"). */
export const normalize = (value: string): string =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

type Cell = string | number | null | undefined;

/** Compara com direção; nulos ficam sempre ao final, independentemente da direção. */
function compareValues(a: Cell, b: Cell, factor: number): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === "number" && typeof b === "number") return factor * (a - b);
  return factor * collator.compare(String(a), String(b));
}

export function runTableQuery<T>(
  data: readonly T[],
  columns: readonly QueryColumn<T>[],
  filters: readonly FilterDefinition<T>[],
  query: TableQuery,
): TablePage<T> {
  const term = normalize(query.search.trim());
  const searchable = columns.filter((c) => c.searchable !== false);

  let rows = data.filter((row) => {
    const matchesFilters = filters.every((f) => {
      const selected = query.filters[f.id];
      return !selected || f.accessor(row) === selected;
    });
    if (!matchesFilters) return false;
    if (!term) return true;
    return searchable.some((c) => normalize(String(c.accessor(row) ?? "")).includes(term));
  });

  const sortColumn = columns.find((c) => c.key === query.sortKey);
  if (sortColumn) {
    const factor = query.sortDirection === "asc" ? 1 : -1;
    rows = [...rows].sort((a, b) => compareValues(sortColumn.accessor(a), sortColumn.accessor(b), factor));
  }

  const pageSize = Math.max(1, query.pageSize);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const page = Math.min(Math.max(1, query.page), pageCount);
  return { rows: rows.slice((page - 1) * pageSize, page * pageSize), total: rows.length, page, pageCount };
}

/** Alterna ordenação: asc -> desc -> sem ordenação. */
export function nextSort(current: { key: string | null; direction: SortDirection }, key: string): { key: string | null; direction: SortDirection } {
  if (current.key !== key) return { key, direction: "asc" };
  if (current.direction === "asc") return { key, direction: "desc" };
  return { key: null, direction: "asc" };
}
