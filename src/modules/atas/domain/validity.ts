import { addDays, addYears, diffInDays, type DateOnly } from "@/shared/lib/time";
import { fail, ok, type Result } from "@/shared/lib/result";

/** R10: art. 84 da Lei 14.133/2021 — 1 ano, prorrogável uma vez por igual período. */
export const ATA_INITIAL_YEARS = 1;
export const ATA_MAX_EXTENSIONS = 1;
export const ATA_LEGAL_BASIS = "Art. 84, Lei 14.133/2021";

export interface AtaExtension {
  /** Quem solicitou explicitamente (nunca automática). */
  requestedBy: string;
  previousEndDate: DateOnly;
  newEndDate: DateOnly;
  legalBasis: string;
}

/** Vigência inicial: 1 ano contado da data de início, inclusive (termina um dia antes do aniversário). */
export function computeInitialEndDate(startDate: DateOnly): DateOnly {
  return addDays(addYears(startDate, ATA_INITIAL_YEARS), -1);
}

export function currentEndDate(startDate: DateOnly, extensions: readonly AtaExtension[]): DateOnly {
  return extensions.length > 0 ? extensions[extensions.length - 1]!.newEndDate : computeInitialEndDate(startDate);
}

export interface ExtensionRequest {
  startDate: DateOnly;
  extensions: readonly AtaExtension[];
  requestedBy: string | null;
  today: DateOnly;
}

/**
 * Prorroga por mais 1 ano, no máximo uma vez, somente por solicitação explícita
 * e antes do vencimento. Retorna o registro de prorrogação a ser anexado ao histórico.
 */
export function requestExtension(request: ExtensionRequest): Result<AtaExtension> {
  if (!request.requestedBy) {
    return fail("VALIDATION", "Prorrogação exige solicitante identificado; não existe prorrogação automática.");
  }
  if (request.extensions.length >= ATA_MAX_EXTENSIONS) {
    return fail("INVALID_STATE", "A ata já foi prorrogada; o limite legal é de uma prorrogação por igual período.");
  }
  const previousEndDate = currentEndDate(request.startDate, request.extensions);
  if (diffInDays(request.today, previousEndDate) < 0) {
    return fail("INVALID_STATE", "A ata já está vencida e não pode mais ser prorrogada.");
  }
  return ok({
    requestedBy: request.requestedBy,
    previousEndDate,
    newEndDate: addYears(previousEndDate, 1),
    legalBasis: ATA_LEGAL_BASIS,
  });
}

export type AtaValidityStatus = "vigente" | "vencida";

export function ataValidityStatus(endDate: DateOnly, today: DateOnly): AtaValidityStatus {
  return diffInDays(today, endDate) >= 0 ? "vigente" : "vencida";
}
