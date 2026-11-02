import { diffInDays, type DateOnly } from "@/shared/lib/time";
import { percentage, roundTo } from "@/shared/lib/decimal";
import { fail, ok, type Result } from "@/shared/lib/result";

/** Condições vigentes do contrato em um instante do histórico. */
export interface ContractTerms {
  startDate: DateOnly;
  endDate: DateOnly;
  /** Valor total em reais (numeric(15,2) no banco). */
  value: number;
}

/**
 * R16: cada aditivo guarda os valores anteriores e novos; nada é sobrescrito
 * e não existe regra fixa de prazo (ex.: "13+1 meses").
 */
export interface ContractAmendment {
  sequence: number;
  reason: string;
  previous: ContractTerms;
  next: ContractTerms;
  signedAt: DateOnly;
}

export interface AmendmentInput {
  reason: string;
  endDate?: DateOnly;
  value?: number;
  signedAt: DateOnly;
}

/** Termos vigentes = último aditivo; sem aditivos, os termos originais. */
export function currentTerms(original: ContractTerms, amendments: readonly ContractAmendment[]): ContractTerms {
  return amendments.length > 0 ? amendments[amendments.length - 1]!.next : original;
}

/** Cria o aditivo preservando o histórico (retorna novo array, não altera o recebido). */
export function addAmendment(
  original: ContractTerms,
  amendments: readonly ContractAmendment[],
  input: AmendmentInput,
): Result<ContractAmendment[]> {
  if (!input.reason.trim()) return fail("VALIDATION", "Informe a justificativa do aditivo.");
  const previous = currentTerms(original, amendments);
  const next: ContractTerms = {
    startDate: previous.startDate,
    endDate: input.endDate ?? previous.endDate,
    value: input.value === undefined ? previous.value : roundTo(input.value, 2),
  };
  if (next.endDate === previous.endDate && next.value === previous.value) {
    return fail("VALIDATION", "O aditivo deve alterar o prazo ou o valor.");
  }
  if (diffInDays(next.startDate, next.endDate) < 0) {
    return fail("VALIDATION", "A nova vigência não pode terminar antes do início.");
  }
  if (next.value < 0) return fail("VALIDATION", "O valor não pode ser negativo.");
  const amendment: ContractAmendment = { sequence: amendments.length + 1, reason: input.reason.trim(), previous, next, signedAt: input.signedAt };
  return ok([...amendments, amendment]);
}

/** Dias restantes (negativo = vencido). */
export const remainingDays = (terms: ContractTerms, today: DateOnly): number => diffInDays(today, terms.endDate);

/** Percentual da vigência já transcorrido, 0–100 com 2 casas. */
export function elapsedPercent(terms: ContractTerms, today: DateOnly): number {
  const total = diffInDays(terms.startDate, terms.endDate);
  return percentage(diffInDays(terms.startDate, today), total);
}
