/** Numeração cronológica de contratos do órgão, independente da ata ou do processo. */
export function suggestContractNumber(year: number, existingNumbers: readonly string[]): string {
  const used = new Set(existingNumbers.map((number) => number.trim().toLocaleLowerCase("pt-BR")));
  const sequence = existingNumbers.reduce((maximum, number) => {
    const match = /^(?:contrato|ctr|ct)?\s*0*(\d+)(?:\s*\/\s*(\d{4}))?(?:\s*\(\d+\))?$/i.exec(number.trim());
    if (!match || (match[2] && Number(match[2]) !== year)) return maximum;
    return Math.max(maximum, Number(match[1]));
  }, 0);
  for (let next = sequence + 1; ; next += 1) {
    const candidate = `CTR ${String(next).padStart(3, "0")}/${year}`;
    if (!used.has(candidate.toLocaleLowerCase("pt-BR"))) return candidate;
  }
}
