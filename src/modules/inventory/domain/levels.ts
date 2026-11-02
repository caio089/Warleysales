import { subtractQuantity } from "@/shared/lib/decimal";

export type StockLevel = "normal" | "atencao" | "critico" | "sem_disponibilidade";

/** Fração do mínimo abaixo da qual o nível é crítico. */
export const CRITICAL_RATIO = 0.5;

/**
 * Classifica pelo DISPONÍVEL (não pelo físico):
 * - sem_disponibilidade: ≤ 0
 * - crítico: ≤ 50% do mínimo
 * - atenção: ≤ mínimo
 * - normal: acima do mínimo
 */
export function classifyStockLevel(available: number, minimum: number): StockLevel {
  if (available <= 0) return "sem_disponibilidade";
  if (available <= minimum * CRITICAL_RATIO) return "critico";
  if (available <= minimum) return "atencao";
  return "normal";
}

export const stockLevelLabel: Record<StockLevel, string> = {
  normal: "Normal",
  atencao: "Atenção",
  critico: "Crítico",
  sem_disponibilidade: "Sem disponibilidade",
};

/** Divergência entre o saldo atual e o recalculado do ledger (reconciliação). */
export const reconciliationDifference = (stored: number, fromLedger: number): number =>
  subtractQuantity(stored, fromLedger);
