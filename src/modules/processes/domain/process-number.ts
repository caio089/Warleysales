import { fail, ok, type Result } from "@/shared/lib/result";

/** Formato padrão NNN/AAAA, único por conselho (P4). */
export function formatProcessNumber(sequence: number, year: number): string {
  return `${String(sequence).padStart(3, "0")}/${year}`;
}

export function parseProcessNumber(value: string): Result<{ sequence: number; year: number }> {
  const match = /^(\d{1,6})\/(\d{4})$/.exec(value.trim());
  if (!match) return fail("VALIDATION", "Número de processo inválido. Use o formato NNN/AAAA.");
  return ok({ sequence: Number(match[1]), year: Number(match[2]) });
}
