/** Só associa itens quando a descrição identifica uma única linha em ambos os lados. */
export function matchPdfItems(
  labels: readonly (readonly string[])[],
  descriptions: readonly (string | null)[],
): (number | null)[] {
  const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").replace(/[^a-z0-9]+/g, " ").trim();
  const normalized = descriptions.map((description) => description ? normalize(description) : "");
  return labels.map((aliases) => {
    const candidates = normalized.flatMap((description, index) =>
      description && aliases.some((alias) => normalize(alias) === description) ? [index] : [],
    );
    const candidate = candidates.length === 1 ? candidates[0]! : null;
    return candidate !== null && normalized.filter((description) => description === normalized[candidate]).length === 1
      ? candidate
      : null;
  });
}
