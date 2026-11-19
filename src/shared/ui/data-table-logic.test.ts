import { describe, expect, it } from "vitest";
import { nextSort, normalize, parseTableUrlState, runTableQuery, tableQueryKey, writeTableUrlState, type QueryColumn, type TableQuery } from "./data-table-logic";

interface Row { name: string; qty: number | null; status: string }
const data: Row[] = [
  { name: "Álcool 70%", qty: 10, status: "a" },
  { name: "Caneta", qty: 2, status: "b" },
  { name: "Papel A4", qty: null, status: "a" },
  { name: "Grampeador", qty: 30, status: "b" },
];
const columns: QueryColumn<Row>[] = [
  { key: "name", accessor: (r) => r.name },
  { key: "qty", accessor: (r) => r.qty },
];
const filters = [{ id: "status", label: "Status", options: [], accessor: (r: Row) => r.status }];
const base: TableQuery = { search: "", sortKey: null, sortDirection: "asc", filters: {}, page: 1, pageSize: 2 };

describe("table URL state", () => {
  const namespace = tableQueryKey("Ordens de materiais");
  const urlColumns = [{ key: "name", accessor: (row: Row) => row.name, sortable: true }, { key: "status", accessor: (row: Row) => row.status, sortable: false }];
  const urlFilters = [{ id: "status", label: "Status", options: [{ value: "a", label: "A" }, { value: "b", label: "B" }], accessor: (row: Row) => row.status }];

  it("round-trips allowed state and preserves unrelated query/hash", () => {
    const params = new URLSearchParams("aba=governanca&keep=1");
    writeTableUrlState(params, namespace, { search: "luvas", sortKey: "name", sortDirection: "desc", filters: { status: "b" }, page: 3 });
    expect(parseTableUrlState(params, namespace, urlColumns, urlFilters)).toEqual({ search: "luvas", sortKey: "name", sortDirection: "desc", filters: { status: "b" }, page: 3 });
    expect(params.get("aba")).toBe("governanca");
    expect(new URL(`https://example.test/list?${params}#section`).hash).toBe("#section");
  });

  it("rejects invalid column, filter, direction and unsafe page", () => {
    const params = new URLSearchParams(`${namespace}.q=x&${namespace}.sort=other:asc&${namespace}.f.status=admin&${namespace}.page=9007199254740992`);
    expect(parseTableUrlState(params, namespace, urlColumns, urlFilters)).toMatchObject({ search: "x", sortKey: null, sortDirection: "asc", filters: {}, page: 1 });
    params.set(`${namespace}.sort`, "status:asc");
    expect(parseTableUrlState(params, namespace, urlColumns, urlFilters).sortKey).toBeNull();
    params.set(`${namespace}.sort`, "name:sideways");
    params.set(`${namespace}.page`, "-1");
    expect(parseTableUrlState(params, namespace, urlColumns, urlFilters).sortKey).toBeNull();
    expect(parseTableUrlState(params, namespace, urlColumns, urlFilters).page).toBe(1);
  });
});

describe("runTableQuery", () => {
  it("busca ignora acentos e caixa", () => {
    expect(runTableQuery(data, columns, filters, { ...base, search: "alcool" }).rows.map((r) => r.name)).toEqual(["Álcool 70%"]);
    expect(normalize("Inclusão")).toBe("inclusao");
  });
  it("filtra por status", () => {
    expect(runTableQuery(data, columns, filters, { ...base, filters: { status: "b" }, pageSize: 10 }).total).toBe(2);
  });
  it("ordena numericamente com nulos ao final em ambas as direções", () => {
    const asc = runTableQuery(data, columns, filters, { ...base, sortKey: "qty", pageSize: 10 }).rows.map((r) => r.qty);
    expect(asc).toEqual([2, 10, 30, null]);
    const desc = runTableQuery(data, columns, filters, { ...base, sortKey: "qty", sortDirection: "desc", pageSize: 10 }).rows.map((r) => r.qty);
    expect(desc.at(-1)).toBeNull();
    expect(desc[0]).toBe(30);
  });
  it("pagina e limita a página ao intervalo válido", () => {
    const p2 = runTableQuery(data, columns, filters, { ...base, page: 2 });
    expect(p2.rows).toHaveLength(2);
    expect(p2.pageCount).toBe(2);
    expect(runTableQuery(data, columns, filters, { ...base, page: 99 }).page).toBe(2);
  });
  it("lista vazia tem 1 página", () => {
    expect(runTableQuery([], columns, filters, base)).toMatchObject({ total: 0, pageCount: 1, page: 1 });
  });
  it("alterna ordenação asc -> desc -> nenhuma", () => {
    const s1 = nextSort({ key: null, direction: "asc" }, "name");
    const s2 = nextSort(s1, "name");
    const s3 = nextSort(s2, "name");
    expect([s1.direction, s2.direction, s3.key]).toEqual(["asc", "desc", null]);
  });
});
