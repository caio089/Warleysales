/** Mantém apenas dígitos. */
export const onlyDigits = (value: string): string => value.replace(/\D/g, "");

function checkDigit(base: string, weights: readonly number[]): number {
  const sum = base.split("").reduce((acc, digit, index) => acc + Number(digit) * weights[index]!, 0);
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

/** Valida CNPJ numérico (14 dígitos + dígitos verificadores), rejeitando sequências repetidas. */
export function isValidCnpj(value: string): boolean {
  const cnpj = onlyDigits(value);
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
  const d1 = checkDigit(cnpj.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const d2 = checkDigit(cnpj.slice(0, 12) + d1, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return cnpj.endsWith(`${d1}${d2}`);
}

export function formatCnpj(value: string): string {
  const d = onlyDigits(value);
  return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}
