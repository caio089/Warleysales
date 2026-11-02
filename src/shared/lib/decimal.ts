/**
 * Aritmética decimal segura para quantidades (3 casas) e percentuais (2 casas).
 * Evita erros de ponto flutuante (0.1 + 0.2) arredondando após cada operação.
 */
export const QUANTITY_SCALE = 3;
export const PERCENT_SCALE = 2;

export function roundTo(value: number, places: number): number {
  const factor = 10 ** places;
  // Number.EPSILON corrige casos como 1.005 => 1.01
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export const roundQuantity = (value: number): number => roundTo(value, QUANTITY_SCALE);
export const roundPercent = (value: number): number => roundTo(value, PERCENT_SCALE);

export const addQuantity = (a: number, b: number): number => roundQuantity(a + b);
export const subtractQuantity = (a: number, b: number): number => roundQuantity(a - b);

/** Percentual limitado a 0–100 com 2 casas; divisor zero resulta em 0. */
export function percentage(part: number, total: number): number {
  if (total <= 0) return 0;
  return roundPercent(Math.min(100, Math.max(0, (part / total) * 100)));
}
