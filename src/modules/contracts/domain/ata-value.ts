import { roundTo } from "@/shared/lib/decimal";

export function calculateContractAtaValue(
  items: readonly { quantity: number; unitPrice?: number }[],
): number {
  const total = items.reduce((sum, item) => sum + item.quantity * (item.unitPrice ?? 0), 0);
  return roundTo(total, 2);
}
