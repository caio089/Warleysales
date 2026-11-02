import type { Result } from "@/shared/lib/result";
import type { Council, MembershipRecord, ProfileSummary } from "./schemas";

export interface CouncilRepository {
  /** CONFLICT quando a sigla já existe. */
  insert(council: Council): Promise<Result<Council>>;
  update(council: Council): Promise<Result<Council>>;
  findById(id: string): Promise<Council | null>;
  list(councilIds: readonly string[] | "all"): Promise<Council[]>;
}

export interface MembershipRepository {
  listByCouncil(councilId: string): Promise<MembershipRecord[]>;
  listAll(): Promise<MembershipRecord[]>;
  listProfiles(): Promise<ProfileSummary[]>;
  upsert(record: MembershipRecord): Promise<void>;
  remove(userId: string, councilId: string): Promise<boolean>;
  /** Usuários gestores do conselho (destinatários de alertas). */
  managerIds(councilId: string): Promise<string[]>;
}
