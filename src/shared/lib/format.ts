/** Formatadores de exibição em pt-BR. */
const numberFormat = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 3 });
const currencyFormat = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export const formatNumber = (value: number): string => numberFormat.format(value);
export const formatCurrency = (value: number): string => currencyFormat.format(value);
export const formatPercent = (value: number): string => `${value.toFixed(2).replace(".", ",")}%`;

/** Tamanho de arquivo legível (1024 base). */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(1).replace(".", ",")} ${units[unit]}`;
}
