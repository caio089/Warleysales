import type { ProcessContractingMode } from "@/modules/processes/contracting-mode";
import { fail, ok, type Result } from "@/shared/lib/result";

/** Forma mínima do contrato para o gate de entrada no estoque. */
export type ContractForReceiveGate = {
  processId?: string | null;
  ataId?: string | null;
  ataItems: { ataItemId: string; quantity: number }[];
};

export type RequestItemForReceiveGate = {
  id: string;
  ataItemId: string | null;
  quantity: number;
  receivedTotal: number;
};

/** Soma as quantidades contratadas por item de ata (vários contratos no mesmo processo). */
export function contractedQuantityByAtaItem(
  contracts: readonly ContractForReceiveGate[],
  processId: string | null | undefined,
): Map<string, number> {
  const map = new Map<string, number>();
  for (const contract of contracts) {
    if (processId && contract.processId && contract.processId !== processId) continue;
    for (const line of contract.ataItems ?? []) {
      if (line.quantity <= 0) continue;
      map.set(line.ataItemId, (map.get(line.ataItemId) ?? 0) + line.quantity);
    }
  }
  return map;
}

/**
 * Registro de preços: precisa de contrato ligado à ata.
 * Só contrato: precisa de qualquer contrato do processo.
 */
export function assertContractAllowsReceive(input: {
  processId: string | null | undefined;
  contractingMode: ProcessContractingMode | null | undefined;
  requestItems: readonly RequestItemForReceiveGate[];
  contracts: readonly ContractForReceiveGate[];
}): Result<true> {
  const processContracts = input.contracts.filter(
    (contract) => !input.processId || !contract.processId || contract.processId === input.processId,
  );
  const ataItemIds = input.requestItems.map((item) => item.ataItemId).filter((id): id is string => Boolean(id));
  const needsAtaContract =
    input.contractingMode === "registro_precos" || (input.contractingMode !== "contrato" && ataItemIds.length > 0);

  if (needsAtaContract) {
    if (processContracts.length === 0) {
      return fail(
        "INVALID_STATE",
        "Cadastre o contrato vinculado à ata antes de liberar entrada no estoque.",
      );
    }
    const withAta = processContracts.filter(
      (contract) => Boolean(contract.ataId) || (contract.ataItems?.length ?? 0) > 0,
    );
    if (withAta.length === 0) {
      return fail(
        "INVALID_STATE",
        "O contrato precisa estar vinculado à ata (com quantidades) para liberar o estoque.",
      );
    }
    if (ataItemIds.length > 0) {
      const allowance = contractedQuantityByAtaItem(withAta, input.processId);
      const uncovered = ataItemIds.filter((id) => (allowance.get(id) ?? 0) <= 0);
      if (uncovered.length > 0) {
        return fail(
          "INVALID_STATE",
          "Não há quantidade contratada na ata para os itens desta solicitação. Inclua as quantidades no contrato.",
        );
      }
    }
    return ok(true);
  }

  if (input.contractingMode === "contrato") {
    if (processContracts.length === 0) {
      return fail("INVALID_STATE", "Cadastre o contrato do processo antes de liberar entrada no estoque.");
    }
  }

  return ok(true);
}

/**
 * Teto por item: pendência da solicitação ∩ saldo contratado do item da ata.
 * Itens sem ataItemId não são limitados pelo contrato (só pelo pedido).
 */
export function maxReceivableAgainstContract(
  item: RequestItemForReceiveGate,
  contractedByAtaItem: Map<string, number>,
): number {
  const pending = Math.max(0, item.quantity - item.receivedTotal);
  if (!item.ataItemId) return pending;
  const contracted = contractedByAtaItem.get(item.ataItemId) ?? 0;
  const remainingOnContract = Math.max(0, contracted - item.receivedTotal);
  return Math.min(pending, remainingOnContract);
}

/** Valida as linhas do recebimento contra o teto contratual. */
export function assertReceiveLinesWithinContract(input: {
  items: readonly RequestItemForReceiveGate[];
  lines: readonly { itemId: string; received: number }[];
  contractedByAtaItem: Map<string, number>;
}): Result<true> {
  for (const line of input.lines) {
    if (line.received <= 0) continue;
    const item = input.items.find((row) => row.id === line.itemId);
    if (!item) continue;
    if (!item.ataItemId) continue;
    const max = maxReceivableAgainstContract(item, input.contractedByAtaItem);
    if (line.received > max) {
      return fail(
        "VALIDATION",
        `Quantidade acima do contratado para este item (máximo liberado: ${max}).`,
        { [`lines.${line.itemId}`]: [`Máximo liberado pelo contrato: ${max}.`] },
      );
    }
  }
  return ok(true);
}
