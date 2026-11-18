export interface ProductOption {
  value: string;
  label: string;
}

/** Compara nome e código sem acento e sem diferença de maiúsculas. */
export function normalizeProductQuery(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
}

/** Filtra a lista pelo que foi digitado. Sem texto, devolve o começo da lista. */
export function filterProducts(options: readonly ProductOption[], query: string, limit = 20): ProductOption[] {
  const needle = normalizeProductQuery(query);
  const matches = needle
    ? options.filter((option) => normalizeProductQuery(option.label).includes(needle))
    : [...options];
  return matches.slice(0, limit);
}

/** Um único produto cujo nome é exatamente o texto digitado. */
export function exactProduct(options: readonly ProductOption[], query: string): ProductOption | null {
  const needle = normalizeProductQuery(query);
  if (!needle) return null;
  const hits = options.filter((option) => normalizeProductQuery(option.label) === needle);
  return hits.length === 1 ? hits[0]! : null;
}
