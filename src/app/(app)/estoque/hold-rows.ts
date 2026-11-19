import { formatNumber } from "@/shared/lib/format";

export interface HoldItemInput {
  id: string;
  title: string;
  councilId: string;
  processId: string;
  status: string;
  items: readonly { materialId: string; quantity: number }[];
}

export interface HoldRow extends Record<string, string | number | null> {
  id: string;
  name: string;
  demand: string;
  council: string;
  quantity: number;
  quantityLabel: string;
  status: string;
  href: string;
}

/**
 * Uma linha por item da demanda.
 * Assim 100 de um produto e 50 de outro não viram um total 150 sem contexto.
 */
export function buildHoldRows(
  requests: readonly HoldItemInput[],
  labels: { council: Record<string, string>; material: Record<string, string> },
): HoldRow[] {
  const rows: HoldRow[] = [];
  for (const request of requests) {
    if (request.items.length === 0) {
      rows.push({
        id: request.id,
        name: request.title,
        demand: request.title,
        council: labels.council[request.councilId] ?? "—",
        quantity: 0,
        quantityLabel: "—",
        status: request.status,
        href: `/processos/${request.processId}`,
      });
      continue;
    }
    for (const item of request.items) {
      const product = labels.material[item.materialId] ?? request.title;
      rows.push({
        id: `${request.id}:${item.materialId}`,
        name: product,
        demand: request.title,
        council: labels.council[request.councilId] ?? "—",
        quantity: item.quantity,
        quantityLabel: `${formatNumber(item.quantity)} un`,
        status: request.status,
        href: `/processos/${request.processId}`,
      });
    }
  }
  return rows;
}
