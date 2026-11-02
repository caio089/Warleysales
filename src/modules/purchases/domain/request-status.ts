import { checkTransition, type TransitionMap } from "@/shared/lib/state-machine";
import { fail, ok, type Result } from "@/shared/lib/result";

export type PurchaseRequestStatus =
  | "rascunho"
  | "enviada"
  | "em_analise"
  | "aguardando_correcao"
  | "aprovada"
  | "rejeitada"
  | "em_atendimento"
  | "parcialmente_atendida"
  | "atendida"
  | "cancelada";

/** §7. A reabertura de rejeitada NÃO está aqui: exige ação explícita autorizada (reopenRejected). */
export const REQUEST_TRANSITIONS: TransitionMap<PurchaseRequestStatus> = {
  rascunho: ["enviada", "cancelada"],
  enviada: ["em_analise", "cancelada"],
  em_analise: ["aguardando_correcao", "aprovada", "rejeitada", "cancelada"],
  aguardando_correcao: ["em_analise"],
  aprovada: ["em_atendimento", "cancelada"],
  rejeitada: [],
  em_atendimento: ["parcialmente_atendida", "atendida"],
  parcialmente_atendida: ["parcialmente_atendida", "atendida"],
  atendida: [],
  cancelada: [],
};

export const changeRequestStatus = (from: PurchaseRequestStatus, to: PurchaseRequestStatus) =>
  checkTransition(REQUEST_TRANSITIONS, from, to, "solicitação");

/** Reabertura excepcional de solicitação rejeitada, só com autorização e justificativa. */
export function reopenRejected(
  from: PurchaseRequestStatus,
  actor: { canReopen: boolean },
  justification: string,
): Result<PurchaseRequestStatus> {
  if (from !== "rejeitada") return fail("INVALID_STATE", "Somente solicitações rejeitadas podem ser reabertas.");
  if (!actor.canReopen) return fail("FORBIDDEN", "Sem permissão para reabrir solicitações rejeitadas.");
  if (!justification.trim()) return fail("VALIDATION", "Informe a justificativa da reabertura.");
  return ok("em_analise");
}
