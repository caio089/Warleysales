import type { ContractAtaItem } from "../schemas";

export interface ContractReceiptLine {
  contractId: string;
  ataItemId: string | null;
  quantity: number;
}

export function contractReceiptBalance(contractId: string, items: readonly ContractAtaItem[], receipts: readonly ContractReceiptLine[]) {
  const rows = items.map((item) => {
    const received = receipts
      .filter((line) => line.contractId === contractId && line.ataItemId === item.ataItemId)
      .reduce((sum, line) => sum + line.quantity, 0);
    return { ataItemId: item.ataItemId, contracted: item.quantity, received, remaining: Math.max(0, item.quantity - received) };
  });
  return {
    registered: rows.length > 0,
    rows,
    contracted: rows.reduce((sum, row) => sum + row.contracted, 0),
    received: rows.reduce((sum, row) => sum + row.received, 0),
    remaining: rows.reduce((sum, row) => sum + row.remaining, 0),
  };
}
