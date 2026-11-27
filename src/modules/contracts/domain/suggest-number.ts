/** Sugere um número livre no órgão sem reaproveitar o número de um contrato anterior. */
export function suggestContractNumber(processNumber: string, existingNumbers: readonly string[]): string {
  const base = `CTR ${processNumber}`.slice(0, 40);
  const used = new Set(existingNumbers.map((number) => number.trim().toLocaleLowerCase("pt-BR")));
  if (!used.has(base.toLocaleLowerCase("pt-BR"))) return base;
  for (let sequence = 2; ; sequence += 1) {
    const suffix = ` (${sequence})`;
    const candidate = `${base.slice(0, 40 - suffix.length)}${suffix}`;
    if (!used.has(candidate.toLocaleLowerCase("pt-BR"))) return candidate;
  }
}
