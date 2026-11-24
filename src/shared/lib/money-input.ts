/** O formulário recebe um decimal canônico, sem símbolo nem separador de milhar. */
export function parseCurrencyInput(text: string): string | null {
  const cleaned = text.trim().replace(/^R\$\s*|\s*R\$$/g, "").trim();
  if (!cleaned) return "";
  const brazilian = /^-?(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{0,2})?$/;
  if (brazilian.test(cleaned)) {
    return cleaned.replaceAll(".", "").replace(",", ".");
  }
  return /^-?\d+(?:\.\d{1,2})?$/.test(cleaned) ? cleaned : null;
}

/** Preserva a vírgula incompleta e os zeros digitados sem converter para Number. */
export function formatCurrencyDraft(value: string): string {
  const [integer, fraction] = value.split(".");
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return fraction === undefined ? grouped : `${grouped},${fraction}`;
}

export function updateCurrencyDraft(previous: string, text: string, caret: number, inputType?: string) {
  const logical = (value: string) => value.replaceAll(".", "").replace(",", ".");
  let value = logical(text);
  let position = logical(text.slice(0, caret)).length;
  // Backspace/Delete sobre um ponto de agrupamento deve atingir o dígito ao lado.
  if (value === previous && text !== formatCurrencyDraft(previous)) {
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
