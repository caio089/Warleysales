import { log } from "@/shared/lib/logger";

/** Forma mínima de erro do PostgREST (evita acoplar os adapters ao tipo interno da biblioteca). */
export interface DbErrorShape {
  message: string;
  code?: string;
}
export interface DbResponse<T> {
  data: T | null;
  error: DbErrorShape | null;
}

const PAGE_SIZE = 1000; // limite padrão do PostgREST por requisição
const UNIQUE_VIOLATION = "23505";

export const isUniqueViolation = (error: DbErrorShape | null): boolean => error?.code === UNIQUE_VIOLATION;

/** Erro técnico: detalhes vão para o log; o serviço o converte em mensagem genérica ao usuário. */
export class DatabaseError extends Error {
  constructor(operation: string, cause: DbErrorShape) {
    super(`Falha de banco em ${operation}`);
    log("error", "db.erro", { operation, code: cause.code, message: cause.message });
  }
}

/** Extrai `data` ou lança DatabaseError. */
export function unwrap<T>(operation: string, response: DbResponse<T>): T {
  if (response.error) throw new DatabaseError(operation, response.error);
  return response.data as T;
}

/** Percorre todas as páginas (evita truncar em 1000 linhas). */
export async function selectAll<T>(
  operation: string,
  fetchPage: (from: number, to: number) => PromiseLike<DbResponse<T[]>>,
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const page = unwrap(operation, await fetchPage(from, from + PAGE_SIZE - 1));
    rows.push(...page);
    if (page.length < PAGE_SIZE) return rows;
  }
}

export const toDate = (value: string): Date => new Date(value);
export const toDateOrNull = (value: string | null): Date | null => (value ? new Date(value) : null);
export const toIso = (value: Date): string => value.toISOString();
export const toIsoOrNull = (value: Date | null): string | null => (value ? value.toISOString() : null);

/** Número devolvido pelo PostgREST (numeric pode vir como string em alguns clientes). */
export const toNumber = (value: number | string): number => (typeof value === "number" ? value : Number(value));

/** Máximo de tentativas do controle otimista (CAS) das RPCs de estoque/ata. */
export const MAX_CAS_ATTEMPTS = 6;

/** Chama uma função SQL (RPC) e devolve o resultado; erros viram DatabaseError. */
export async function callRpc<T>(
  db: { rpc: (fn: string, args: Record<string, unknown>) => PromiseLike<DbResponse<T>> },
  functionName: string,
  args: Record<string, unknown>,
): Promise<T> {
  return unwrap(`rpc.${functionName}`, await db.rpc(functionName, args));
}
