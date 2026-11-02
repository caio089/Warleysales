/**
 * Padrão único de resposta dos serviços de domínio.
 * Nunca expõe mensagens internas de banco ao cliente.
 */
export type ErrorCode =
  | "VALIDATION"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INVALID_STATE"
  | "INSUFFICIENT_BALANCE"
  | "INTERNAL";

export type Result<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      code: ErrorCode;
      message: string;
      fieldErrors?: Record<string, string[]>;
    };

export const ok = <T>(data: T): Result<T> => ({ ok: true, data });

export const fail = (
  code: ErrorCode,
  message: string,
  fieldErrors?: Record<string, string[]>,
): Result<never> => ({ ok: false, code, message, fieldErrors });
