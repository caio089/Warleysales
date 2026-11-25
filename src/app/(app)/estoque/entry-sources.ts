import type { AtaView } from "@/modules/atas/service";
import type { PurchaseRequest } from "@/modules/purchases/schemas";
import type { ProcessView } from "@/modules/processes/service";

export type StockEntryItem = {
  itemId: string;
  materialId: string;
  materialLabel: string;
  ordered: number;
  pending: number;
  unitPrice: number | null;
  lineTotal: number | null;
};

/** Processo com solicitação pronta para entrada no estoque. */
export type StockEntrySource = {
  processId: string;
  requestId: string;
  councilId: string;
  processNumber: string;
  processTitle: string;
  label: string;
  estimatedValue: number | null;
  items: StockEntryItem[];
};

const RECEIVABLE = new Set(["aprovada", "em_atendimento", "parcialmente_atendida"]);

/**
 * Monta as entradas possíveis: órgão + processo → itens, quantidades pendentes e valores.
 */
export function buildStockEntrySources(input: {
  requests: PurchaseRequest[];
  processes: ProcessView[];
  atas: AtaView[];
  materialLabel: Record<string, string>;
}): StockEntrySource[] {
  const processById = new Map(input.processes.map((view) => [view.process.id, view]));
  const ataUnitByItemId = new Map<string, number>();
  for (const ata of input.atas) {
    for (const item of ata.ata.items) {
      ataUnitByItemId.set(item.id, item.unitPrice);
    }
  }

  const sources: StockEntrySource[] = [];
  for (const request of input.requests) {
    if (!request.processId || !RECEIVABLE.has(request.status)) continue;
    const pendingItems = request.items
      .map((item) => {
        const pending = Math.max(0, item.quantity - item.receivedTotal);
        if (pending <= 0 || !item.materialId) return null;
        const unitFromAta = item.ataItemId ? (ataUnitByItemId.get(item.ataItemId) ?? null) : null;
        return { item, pending, unitFromAta };
      })
      .filter((row): row is NonNullable<typeof row> => row != null);
    if (pendingItems.length === 0) continue;

    const process = processById.get(request.processId);
    if (!process) continue;

    const totalQty = pendingItems.reduce((sum, row) => sum + row.pending, 0);
    const estimated = request.estimatedValue ?? process.process.estimatedValue ?? null;
    const fallbackUnit =
      estimated != null && totalQty > 0 ? estimated / request.items.reduce((sum, item) => sum + item.quantity, 0) : null;

    sources.push({
      processId: process.process.id,
      requestId: request.id,
      councilId: request.councilId,
      processNumber: process.process.number,
      processTitle: process.process.title,
      label: `${process.process.number} — ${process.process.title}`,
      estimatedValue: estimated,
      items: pendingItems.map(({ item, pending, unitFromAta }) => {
        const unitPrice = unitFromAta ?? fallbackUnit;
        return {
          itemId: item.id,
          materialId: item.materialId,
          materialLabel: input.materialLabel[item.materialId] ?? "Material",
          ordered: item.quantity,
          pending,
          unitPrice,
          lineTotal: unitPrice != null ? unitPrice * pending : null,
        };
      }),
    });
  }

  return sources.sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
}
