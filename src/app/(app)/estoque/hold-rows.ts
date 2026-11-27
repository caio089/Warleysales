import type { AtaView } from "@/modules/atas/service";
import type { Contract } from "@/modules/contracts/schemas";
import { formatNumber } from "@/shared/lib/format";

export interface HoldItemInput {
  id: string;
  title: string;
  councilId: string;
  processId: string;
  status: string;
  items: readonly { materialId: string; quantity: number; status?: string; ataTotal?: number | null; ataBalance?: number | null; contractTotal?: number | null; contractBalance?: number | null; stockBalance?: number | null }[];
}

export function contractedMaterialsByProcess(contracts: readonly Contract[], atas: readonly AtaView[]) {
  const cancelledAtas = new Set(atas.filter(({ ata }) => ata.status === "cancelada").map(({ ata }) => ata.id));
  const materialByAtaItem = new Map(atas.flatMap(({ ata }) => ata.items.map((item) => [item.id, item.materialId] as const)));
  const byProcess = new Map<string, Set<string> | "all">();
  for (const contract of contracts) {
    if (!contract.processId || (contract.ataId && cancelledAtas.has(contract.ataId))) continue;
    const key = `${contract.councilId}:${contract.processId}`;
    const existing = byProcess.get(key);
    if (existing === "all") continue;
    if (contract.ataItems.length === 0) {
      byProcess.set(key, "all");
      continue;
    }
    const materials = existing ?? new Set<string>();
    for (const line of contract.ataItems) {
      if (line.quantity <= 0) continue;
      const material = materialByAtaItem.get(line.ataItemId);
      if (material) materials.add(material);
    }
    byProcess.set(key, materials);
  }
  return byProcess;
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
  ataTotal: number | null;
  ataBalance: number | null;
  contractTotal: number | null;
  contractBalance: number | null;
  stockBalance: number | null;
  balanceNotice: string;
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
        ataTotal: null, ataBalance: null, contractTotal: null, contractBalance: null, stockBalance: null, balanceNotice: "—",
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
        status: item.status ?? request.status,
        href: `/processos/${request.processId}`,
        ataTotal: item.ataTotal ?? null,
        ataBalance: item.ataBalance ?? null,
        contractTotal: item.contractTotal ?? null,
        contractBalance: item.contractBalance ?? null,
        stockBalance: item.stockBalance ?? null,
        balanceNotice: item.ataTotal == null ? "Sem ata" : item.ataBalance === 0 ? "Ata esgotada" : item.contractTotal == null ? "Sem contrato" : item.contractBalance === 0 ? "Contrato esgotado" : item.stockBalance === 0 ? "Estoque físico zerado" : "Disponível",
      });
    }
  }
  return rows;
}
