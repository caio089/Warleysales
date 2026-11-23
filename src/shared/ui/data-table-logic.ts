/**
 * Lógica pura da DataTable (busca, filtro, ordenação, paginação), separada da UI para ser testável.
 */
export type SortDirection = "asc" | "desc";

export interface UrlTableState {
  search: string;
  sortKey: string | null;
  sortDirection: SortDirection;
  filters: Record<string, string>;
  page: number;
}

const MAX_URL_PAGE = 1_000_000;

export function tableQueryKey(caption: string): string {
  const slug = caption.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `dt-${slug || "table"}`;
}

export function parseTableUrlState(
  params: URLSearchParams,
  namespace: string,
  columns: readonly { key: string; sortable?: boolean }[],
  filters: readonly { id: string; options: readonly { value: string }[] }[],
): UrlTableState {
  const allowedColumns = new Set(columns.filter((column) => column.sortable === true).map((column) => column.key));
  const allowedFilters = new Map(filters.map((filter) => [filter.id, new Set(filter.options.map((option) => option.value))]));
  const rawPage = params.get(`${namespace}.page`);
  const parsedPage = rawPage && /^\d+$/.test(rawPage) ? Number(rawPage) : 1;
  const rawSort = params.get(`${namespace}.sort`);
  const [sortKey, direction] = rawSort?.split(":") ?? [];
  const cleanFilters: Record<string, string> = {};
  for (const [id, values] of allowedFilters) {
    const value = params.get(`${namespace}.f.${id}`);
    if (value && values.has(value)) cleanFilters[id] = value;
  }
  return {
    search: (params.get(`${namespace}.q`) ?? "").slice(0, 200),
    sortKey: sortKey && allowedColumns.has(sortKey) && (direction === "asc" || direction === "desc") ? sortKey : null,
    sortDirection: direction === "desc" ? "desc" : "asc",
    filters: cleanFilters,
    page: Number.isSafeInteger(parsedPage) && parsedPage > 0 && parsedPage <= MAX_URL_PAGE ? parsedPage : 1,
  };
}

export function writeTableUrlState(params: URLSearchParams, namespace: string, state: UrlTableState): URLSearchParams {
  const prefix = `${namespace}.`;
  for (const key of [...params.keys()]) if (key.startsWith(prefix)) params.delete(key);
  if (state.search) params.set(`${namespace}.q`, state.search.slice(0, 200));
  if (state.sortKey) params.set(`${namespace}.sort`, `${state.sortKey}:${state.sortDirection}`);
  for (const [id, value] of Object.entries(state.filters)) if (value) params.set(`${namespace}.f.${id}`, value);
  if (state.page > 1) params.set(`${namespace}.page`, String(Math.min(state.page, MAX_URL_PAGE)));
  return params;
}

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
  return paginateTableRows(filterAndSortTableRows(data, columns, filters, query), query.page, query.pageSize);
}

export function filterAndSortTableRows<T>(
  data: readonly T[],
  columns: readonly QueryColumn<T>[],
  filters: readonly FilterDefinition<T>[],
  query: Omit<TableQuery, "page" | "pageSize">,
): T[] {
  const term = normalize(query.search.trim());
  const searchable = columns.filter((c) => c.searchable !== false);

  const rows = data.filter((row) => {
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
    rows.sort((a, b) => compareValues(sortColumn.accessor(a), sortColumn.accessor(b), factor));
  }

  return rows;
}

export function paginateTableRows<T>(rows: readonly T[], requestedPage: number, requestedPageSize: number): TablePage<T> {
  const pageSize = Math.max(1, requestedPageSize);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const page = Math.min(Math.max(1, requestedPage), pageCount);
  return { rows: rows.slice((page - 1) * pageSize, page * pageSize), total: rows.length, page, pageCount };
}

/** Alterna ordenação: asc -> desc -> sem ordenação. */
export function nextSort(current: { key: string | null; direction: SortDirection }, key: string): { key: string | null; direction: SortDirection } {
  if (current.key !== key) return { key, direction: "asc" };
  if (current.direction === "asc") return { key, direction: "desc" };
  return { key: null, direction: "asc" };
}
