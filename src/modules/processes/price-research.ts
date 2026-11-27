export interface PriceResearchItemInput {
  materialId: string;
  name: string;
  quantity: number;
}

export interface PriceResearchLine {
  materialId: string;
  name: string;
  quantity: number;
  /** Valor unitário informado na pesquisa; linhas antigas podem conter apenas lineTotal. */
  unitPrice?: number;
  /** Valor total de referência do item: valor unitário × quantidade. */
  lineTotal: number;
}

export function priceResearchLineTotal(unitPrice: number, quantity: number): number {
  return Math.round((unitPrice * quantity + Number.EPSILON) * 100) / 100;
}

export function sumPriceResearchLines(lines: readonly { lineTotal: number }[]): number {
  const total = lines.reduce((sum, line) => sum + (Number.isFinite(line.lineTotal) ? line.lineTotal : 0), 0);
  return Math.round(total * 100) / 100;
}
