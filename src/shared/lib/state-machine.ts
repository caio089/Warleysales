import { fail, ok, type Result } from "./result";

/** Mapa estado atual -> estados de destino permitidos. */
export type TransitionMap<S extends string> = Readonly<Record<S, readonly S[]>>;

export function canTransition<S extends string>(map: TransitionMap<S>, from: S, to: S): boolean {
  return map[from]?.includes(to) ?? false;
}

/** Valida a transição; transições inválidas retornam INVALID_STATE (nunca lançam). */
export function checkTransition<S extends string>(
  map: TransitionMap<S>,
  from: S,
  to: S,
  entityLabel: string,
): Result<{ from: S; to: S }> {
  if (!canTransition(map, from, to)) {
    return fail("INVALID_STATE", `Transição inválida de ${entityLabel}: "${from}" → "${to}".`);
  }
  return ok({ from, to });
}

/** Estados alcançáveis a partir do atual (útil para exibir ações disponíveis na UI). */
export function nextStates<S extends string>(map: TransitionMap<S>, from: S): readonly S[] {
  return map[from] ?? [];
}
