import type { Result } from "@/shared/lib/result";
import type { Council, MembershipRecord } from "./schemas";

export interface CouncilRepository {
  /** CONFLICT quando a sigla já existe. */
  insert(council: Council): Promise<Result<Council>>;
  update(council: Council): Promise<Result<Council>>;
  findById(id: string): Promise<Council | null>;
  list(councilIds: readonly string[] | "all"): Promise<Council[]>;
}

export interface MembershipRepository {
  listByCouncil(councilId: string): Promise<MembershipRecord[]>;
  /** Usuários gestores do conselho (destinatários de alertas). */
  managerIds(councilId: string): Promise<string[]>;
}
