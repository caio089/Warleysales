/**
 * Quantidade em pt-BR:
 * - "10" → 10
 * - "10,5" → 10.5
 * - "1.000" → 1000
 * - "1.000,5" → 1000.5
 */
export function parseQuantityInput(raw: unknown): number {
  const text = String(raw ?? "").trim().replace(/\s/g, "");
  if (!text) return NaN;
  if (text.includes(",") && text.includes(".")) {
    return Number(text.replace(/\./g, "").replace(",", "."));
  }
  if (text.includes(",")) return Number(text.replace(",", "."));
  // Só pontos: grupos de 3 dígitos = milhar (1.000 → 1000).
  if (/^\d{1,3}(\.\d{3})+$/.test(text)) return Number(text.replace(/\./g, ""));
  return Number(text);
}
