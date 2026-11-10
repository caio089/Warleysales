import { fail, ok, type Result } from "../result";
import type { CouncilRole } from "./navigation";

/**
 * Matriz de permissões (docs/00-fase1-arquitetura.md §6) — fonte única no código.
 * A mesma matriz é reaplicada no banco via RLS; aqui é a camada de serviço (R14).
 */
export type PermissionAction =
  | "council.read"
  | "council.manage"
  | "user.manage"
  | "process.create"
  | "document.attach"
  | "document.unlink"
  | "request.create"
  | "request.decide"
  | "transfer.request"
  | "transfer.decide"
  | "stock.move"
  | "stock.adjust"
  | "material.manage"
  | "supplier.manage"
  | "ata.manage"
  | "contract.manage"
  | "meeting.manage"
  | "report.view"
  | "audit.view"
  | "retention.manage"
  | "formalization.submit"
  | "formalization.homologate"
  | "formalization.reject"
  | "data.delete_manual";

export interface Membership {
  councilId: string;
  role: CouncilRole;
}

/** Identidade autenticada, derivada no servidor (nunca do cliente). */
export interface Actor {
  userId: string;
  isCentralAdmin: boolean;
  /** R13: somente o usuário vinculado (Warley) possui esta flag. */
  isSpecialDeleter: boolean;
  memberships: readonly Membership[];
}

type RoleSet = readonly CouncilRole[];
const MANAGER: RoleSet = ["council_manager"];
const MANAGER_OPERATOR: RoleSet = ["council_manager", "council_operator"];
const ANY_MEMBER: RoleSet = ["council_manager", "council_operator", "viewer"];

/** Papéis de conselho que executam cada ação; `null` = ação restrita a admin central. */
const ROLES_BY_ACTION: Record<Exclude<PermissionAction, "data.delete_manual">, RoleSet | null> = {
  "council.read": ANY_MEMBER,
  "council.manage": null,
  "user.manage": null,
  "process.create": MANAGER_OPERATOR,
  "document.attach": MANAGER_OPERATOR,
  "document.unlink": MANAGER,
  "request.create": MANAGER_OPERATOR,
  "request.decide": MANAGER,
  "transfer.request": MANAGER_OPERATOR,
  "transfer.decide": MANAGER,
  "stock.move": MANAGER_OPERATOR,
  "stock.adjust": MANAGER,
  "material.manage": MANAGER,
  "supplier.manage": MANAGER,
  "ata.manage": MANAGER,
  "contract.manage": MANAGER,
  "meeting.manage": MANAGER_OPERATOR,
  "report.view": ["council_manager", "viewer"],
  "audit.view": MANAGER,
  "retention.manage": null,
  "formalization.submit": MANAGER_OPERATOR,
  "formalization.homologate": null,
  "formalization.reject": null,
};

/**
 * Decide se o ator pode executar a ação.
 * - `data.delete_manual`: exclusivamente `isSpecialDeleter` (nem admin central, R13).
 * - Admin central tem acesso global às demais ações.
 * - Demais: exige vínculo com o conselho alvo e papel suficiente.
 */
export function can(actor: Actor, action: PermissionAction, councilId?: string): boolean {
  if (action === "data.delete_manual") return actor.isSpecialDeleter;
  if (actor.isCentralAdmin) return true;

  const allowedRoles = ROLES_BY_ACTION[action];
  if (!allowedRoles || !councilId) return false;
  return actor.memberships.some((m) => m.councilId === councilId && allowedRoles.includes(m.role));
}

export function authorize(actor: Actor, action: PermissionAction, councilId?: string): Result<true> {
  if (can(actor, action, councilId)) return ok(true);
  return fail("FORBIDDEN", "Você não tem permissão para executar esta ação.");
}

/** Conselhos que o ator pode consultar; `"all"` para admin central. */
export function readableCouncilIds(actor: Actor): readonly string[] | "all" {
  return actor.isCentralAdmin ? "all" : actor.memberships.map((m) => m.councilId);
}

/**
 * Para recursos globais (catálogo de materiais, fornecedores) sem conselho dono:
 * vale se o ator tem o papel exigido em ao menos um conselho (ou é admin central).
 */
export function canInAnyCouncil(actor: Actor, action: PermissionAction): boolean {
  if (action === "data.delete_manual") return actor.isSpecialDeleter;
  if (actor.isCentralAdmin) return true;
  return actor.memberships.some((m) => can(actor, action, m.councilId));
}
