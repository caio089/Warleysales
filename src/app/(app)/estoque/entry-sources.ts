import type { AtaView } from "@/modules/atas/service";
import {
  assertContractAllowsReceive,
  contractedQuantityByAtaItem,
  maxReceivableAgainstContract,
  receiptDefaults,
  receivedQuantitiesByProcess,
  type ContractForReceiveGate,
} from "@/modules/purchases/domain/receive-contract-gate";
import type { PurchaseRequest } from "@/modules/purchases/schemas";
import type { ProcessView } from "@/modules/processes/service";

export type StockEntryItem = {
  itemId: string;
  materialId: string;
  materialLabel: string;
  ataQuantity: number;
  contractQuantity: number;
  pending: number;
  suggested?: number;
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
  contractId: string;
  contractLabel: string;
  ataLabel: string;
  items: StockEntryItem[];
};

const RECEIVABLE = new Set(["aprovada", "em_atendimento", "parcialmente_atendida"]);

/**
 * Monta as entradas possíveis: órgão + processo → itens, quantidades pendentes e valores.
 * Registro de preços: só aparece depois do contrato↔ata, limitado às quantidades contratadas.
 */
export function buildStockEntrySources(input: {
  requests: PurchaseRequest[];
  processes: ProcessView[];
  atas: AtaView[];
  materialLabel: Record<string, string>;
  contracts?: ContractForReceiveGate[];
}): StockEntrySource[] {
  const processById = new Map(input.processes.map((view) => [view.process.id, view]));
  const ataUnitByItemId = new Map<string, number>();
  const ataQuantityByItemId = new Map<string, number>();
  const ataLabelById = new Map<string, string>();
  for (const ata of input.atas) {
    ataLabelById.set(ata.ata.id, ata.ata.number);
    for (const item of ata.ata.items) {
      ataUnitByItemId.set(item.id, item.unitPrice);
      ataQuantityByItemId.set(item.id, item.registeredQuantity);
    }
  }
  const allContracts = input.contracts ?? [];
  const receivedByProcess = receivedQuantitiesByProcess(input.requests);
  const latestAtaByMaterial = new Map<string, AtaView>();
  for (const ata of input.atas) {
    const processId = ata.ata.processId;
    if (!processId) continue;
    for (const item of ata.ata.items) {
      if (!item.materialId) continue;
      const key = `${processId}:${item.materialId}`;
      const current = latestAtaByMaterial.get(key);
      if (!current || ata.ata.createdAt > current.ata.createdAt ||
        (ata.ata.createdAt.getTime() === current.ata.createdAt.getTime() && ata.ata.id > current.ata.id)) {
        latestAtaByMaterial.set(key, ata);
      }
    }
  }

  const sources: StockEntrySource[] = [];
  for (const request of input.requests) {
    if (!request.processId || !RECEIVABLE.has(request.status)) continue;
    const process = processById.get(request.processId);
    if (!process) continue;

    const processContracts = allContracts.filter((contract) =>
      contract.processId === request.processId,
    );
    for (const selectedContract of processContracts) {
      if (!selectedContract.id) continue;
      const contractAta = input.atas.find((ata) => ata.ata.id === selectedContract.ataId);
      const currentItems = request.items
        .filter((item) => !selectedContract.ataId ||
          latestAtaByMaterial.get(`${request.processId}:${item.materialId}`)?.ata.id === selectedContract.ataId)
        .map((item) => ({ ...item,
          ataItemId: contractAta?.ata.items.find((ataItem) => ataItem.materialId === item.materialId)?.id ?? item.ataItemId,
        }));
      if (currentItems.length === 0) continue;
      const gate = assertContractAllowsReceive({
        processId: request.processId,
        contractingMode: process.process.contractingMode ?? null,
        requestItems: currentItems,
        contracts: [selectedContract],
      });
      if (!gate.ok) continue;
      const contractedByAtaItem = contractedQuantityByAtaItem([selectedContract], request.processId);
      const receivedByAtaItem = receivedByProcess.get(request.processId);
      const defaults = receiptDefaults(currentItems, contractedByAtaItem, receivedByAtaItem);
      const pendingItems = currentItems
      .map((item) => {
        const pending = maxReceivableAgainstContract(item, contractedByAtaItem, receivedByAtaItem);
        if (pending <= 0) return null;
        const unitFromAta = item.ataItemId ? (ataUnitByItemId.get(item.ataItemId) ?? null) : null;
        return { item, pending, unitFromAta };
      })
      .filter((row): row is NonNullable<typeof row> => row != null);
      if (pendingItems.length === 0) continue;

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
      contractId: selectedContract.id,
      contractLabel: selectedContract.number ? `Contrato ${selectedContract.number}` : "Contrato",
      ataLabel: selectedContract.ataId
        ? `Ata ${ataLabelById.get(selectedContract.ataId) ?? "vinculada"}`
        : "Solicitação",
      items: pendingItems.map(({ item, pending, unitFromAta }) => {
        const unitPrice = unitFromAta ?? fallbackUnit;
        return {
          itemId: item.id,
          materialId: item.materialId,
          materialLabel: input.materialLabel[item.materialId] ?? "Material",
          ataQuantity: item.ataItemId
            ? (ataQuantityByItemId.get(item.ataItemId) ?? item.quantity)
            : item.quantity,
          contractQuantity: item.ataItemId
            ? (contractedByAtaItem.get(item.ataItemId) ?? pending)
            : pending,
          pending,
          suggested: defaults.get(item.id),
          unitPrice,
          lineTotal: unitPrice != null ? unitPrice * pending : null,
        };
      }),
      });
    }
  }

  return sources.sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
}
