import type { DetailedFilter, DetailedKind } from "./detailed";

const kinds: DetailedKind[] = ["colaborador", "estagiarios", "processos", "atas", "contratos", "estoque"];
const first = (x: string | string[] | undefined) => Array.isArray(x) ? x[0] : x;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function parseDetailedFilter(raw: Record<string, string | string[] | undefined>): DetailedFilter {
  const kind = first(raw.kind);
  const getId = (key: string) => { const value = first(raw[key]); return value && uuid.test(value) ? value : undefined; };
  const getDate = (key: string) => { const value = first(raw[key]); return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined; };
  const dateBasis = first(raw.dateBasis);
  const month = first(raw.month);
  const monthly = (kind === "estagiarios" || kind === "processos") && month && /^\d{4}-(0[1-9]|1[0-2])$/.test(month);
  const start = monthly ? `${month}-01` : getDate("start");
  const end = monthly ? new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0)).toISOString().slice(0, 10) : getDate("end");
  return { kind: kinds.includes(kind as DetailedKind) ? kind as DetailedKind : "processos", councilId: getId("councilId"), actorId: getId("actorId"), responsibleId: getId("responsibleId"), supplierId: getId("supplierId"), materialId: getId("materialId"), start, end, dateBasis: dateBasis === "movimentacao" || dateBasis === "conclusao" ? dateBasis : "criacao", status: first(raw.status)?.slice(0, 50), mode: first(raw.mode)?.slice(0, 50), processType: first(raw.processType)?.slice(0, 80) };
}
