export interface PriceResearchItemInput {
  materialId: string;
  name: string;
  quantity: number;
}

export interface PriceResearchLine {
  materialId: string;
  name: string;
  quantity: number;
  /** Valor total de referência do item (já considerando a quantidade). */
  lineTotal: number;
}

export function sumPriceResearchLines(lines: readonly { lineTotal: number }[]): number {
  const total = lines.reduce((sum, line) => sum + (Number.isFinite(line.lineTotal) ? line.lineTotal : 0), 0);
  return Math.round(total * 100) / 100;
}
