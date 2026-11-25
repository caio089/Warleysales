/**
 * No pt-BR, ponto agrupa milhar e vírgula marca os centavos.
 * Teclado/numpad muitas vezes enviam "." no lugar da vírgula — normalizamos isso.
 */
export function normalizeCurrencyDecimal(text: string): string {
  const cleaned = text.trim();
  if (!cleaned || cleaned.includes(",")) return cleaned;
  // 1.000. | 1.000.5 | 1.000.50 → último ponto vira vírgula de centavos
  const grouped = cleaned.match(/^(-?(?:\d{1,3}(?:\.\d{3})+))\.(\d{0,2})$/);
  if (grouped) return `${grouped[1]},${grouped[2]}`;
  // 10. | 10.5 | 10.50 → único ponto (sem bloco de milhar) também é decimal
  const simple = cleaned.match(/^(-?\d+)\.(\d{0,2})$/);
  if (simple) return `${simple[1]},${simple[2]}`;
  return cleaned;
}

/** O formulário recebe um decimal canônico, sem símbolo nem separador de milhar. */
export function parseCurrencyInput(text: string): string | null {
  const cleaned = text.trim().replace(/^R\$\s*|\s*R\$$/g, "").trim();
  if (!cleaned) return "";
  const normalized = normalizeCurrencyDecimal(cleaned);
  const brazilian = /^-?(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{0,2})?$/;
  if (brazilian.test(normalized)) {
    return normalized.replaceAll(".", "").replace(",", ".");
  }
  return /^-?\d+(?:\.\d{1,2})?$/.test(normalized) ? normalized : null;
}

/** Preserva a vírgula incompleta e os zeros digitados sem converter para Number. */
export function formatCurrencyDraft(value: string): string {
  const [integer, fraction] = value.split(".");
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return fraction === undefined ? grouped : `${grouped},${fraction}`;
}

export function updateCurrencyDraft(previous: string, text: string, caret: number, inputType?: string) {
  const normalized = normalizeCurrencyDecimal(text);
  // Se normalizamos um "." em ",", o caret (após o ponto digitado) continua válido na vírgula.
  const logical = (value: string) => value.replaceAll(".", "").replace(",", ".");
  let value = logical(normalized);
  let position = logical(normalized.slice(0, caret)).length;
  // Backspace/Delete sobre um ponto de agrupamento deve atingir o dígito ao lado.
  if (value === previous && normalized !== formatCurrencyDraft(previous)) {
    const index = inputType === "deleteContentBackward" ? position - 1 : position;
    if (inputType?.startsWith("deleteContent") && /\d/.test(value[index] ?? "")) {
      value = value.slice(0, index) + value.slice(index + 1);
      position = index;
    }
  }
  if (value.startsWith(".")) {
    value = "0" + value;
    position++;
  }
  if (!/^-?\d*(?:\.\d{0,2})?$/.test(value)) return null;
  const display = formatCurrencyDraft(value);
  let nextCaret = 0;
  let remaining = position;
  while (nextCaret < display.length && remaining > 0) {
    if (display[nextCaret] !== ".") remaining--;
    nextCaret++;
  }
  return { value, display, caret: nextCaret };
}
