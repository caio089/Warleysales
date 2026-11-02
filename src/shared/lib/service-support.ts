import { z } from "zod";
import { fail, ok, type Result } from "./result";

/** Relógio e gerador de ids injetáveis (determinismo em testes, R15: instantes em UTC). */
export interface ServiceClock {
  now: () => Date;
}
export interface IdGenerator {
  newId: () => string;
}
export interface RuntimeDeps extends ServiceClock, IdGenerator {}

export const systemRuntime: RuntimeDeps = {
  now: () => new Date(),
  newId: () => crypto.randomUUID(),
};

/** Valida entrada com Zod e converte em Result com erros por campo (sem vazar internals). */
export function parseInput<S extends z.ZodType>(schema: S, input: unknown): Result<z.output<S>> {
  const parsed = schema.safeParse(input);
  if (parsed.success) return ok(parsed.data);
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path.join(".") || "_";
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return fail("VALIDATION", "Dados inválidos. Verifique os campos informados.", fieldErrors);
}

export const idSchema = z.uuid({ error: "Identificador inválido." });
export const dateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use o formato AAAA-MM-DD.");
export const positiveQuantitySchema = z.number({ error: "Informe um número." }).positive("Deve ser maior que zero.").finite();

/** Mensagem genérica para falhas inesperadas: detalhes vão para o log, não para o cliente. */
export const internalError = (): Result<never> =>
  fail("INTERNAL", "Ocorreu um erro inesperado. Tente novamente em instantes.");
