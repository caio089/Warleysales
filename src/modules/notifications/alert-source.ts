import type { AtaRepository } from "@/modules/atas/repository";
import { currentEndDate } from "@/modules/atas/domain/validity";
import type { ContractRepository } from "@/modules/contracts/repository";
import { currentTerms } from "@/modules/contracts/domain/terms";
import type { MembershipRepository } from "@/modules/identity/repository";
import type { AlertSource } from "./repository";
import type { ExpiringItem } from "./schemas";

/** Compõe os repositórios de atas e contratos como fonte de alertas (sem duplicar regra de vigência). */
export class RepositoryAlertSource implements AlertSource {
  constructor(
    private readonly atas: AtaRepository,
    private readonly contracts: ContractRepository,
    private readonly memberships: MembershipRepository,
  ) {}

  async listExpiring(): Promise<ExpiringItem[]> {
    const [atas, contracts] = await Promise.all([this.atas.listByCouncils("all"), this.contracts.listByCouncils("all")]);
    const fromAtas: ExpiringItem[] = atas
      .filter((a) => a.status === "vigente")
      .map((a) => ({ entityType: "ata", entityId: a.id, councilId: a.councilId, label: `Ata ${a.number}`, endDate: currentEndDate(a.startDate, a.extensions) }));
    const fromContracts: ExpiringItem[] = contracts.map((c) => ({
      entityType: "contract", entityId: c.id, councilId: c.councilId, label: `Contrato ${c.number}`, endDate: currentTerms(c.original, c.amendments).endDate,
    }));
    return [...fromAtas, ...fromContracts];
  }

  recipientsFor(councilId: string) { return this.memberships.managerIds(councilId); }
}
