import type { InventoryService } from "@/modules/inventory/service";
import type { ProcessService } from "@/modules/processes/service";
import type { ContractService } from "@/modules/contracts/service";
import type { AtaService } from "@/modules/atas/service";
import { can, type Actor } from "@/shared/lib/authz/policy";
import { fail, ok, type Result } from "@/shared/lib/result";
import { roundPercent } from "@/shared/lib/decimal";

export interface OperationalSummary {
  processes: { total: number; completed: number; pending: number; averageProgress: number | null; byStatus: Record<string, number> };
  stock: { items: number; critical: number; withoutAvailability: number };
  contracts: { total: number; expired: number; expiring30: number };
  atas: { total: number; expired: number };
}

/**
 * Relatórios agregam apenas dados reais já filtrados pelos serviços (respeitam o escopo do ator, R14).
 * Média de progresso é `null` quando não há processos (nunca inventa 0%).
 */
export class ReportService {
  constructor(
    private readonly processes: ProcessService,
    private readonly inventory: InventoryService,
    private readonly contracts: ContractService,
    private readonly atas: AtaService,
  ) {}

  async operationalSummary(actor: Actor): Promise<Result<OperationalSummary>> {
    const allowedSomewhere = actor.isCentralAdmin || actor.memberships.some((m) => can(actor, "report.view", m.councilId));
    if (!allowedSomewhere) return fail("FORBIDDEN", "Você não tem permissão para ver relatórios.");

    const [processes, levels, contracts, atas] = await Promise.all([
      this.processes.list(actor), this.inventory.listLevels(actor), this.contracts.list(actor), this.atas.list(actor),
    ]);
    if (!processes.ok) return processes;
    if (!levels.ok) return levels;
    if (!contracts.ok) return contracts;
    if (!atas.ok) return atas;

    const byStatus: Record<string, number> = {};
    for (const p of processes.data) byStatus[p.process.status] = (byStatus[p.process.status] ?? 0) + 1;
    const completed = processes.data.filter((p) => p.completion === "completa").length;

    return ok({
      processes: {
        total: processes.data.length, completed, pending: processes.data.length - completed, byStatus,
        averageProgress: processes.data.length ? roundPercent(processes.data.reduce((s, p) => s + p.displayPercent, 0) / processes.data.length) : null,
      },
      stock: { items: levels.data.length, critical: levels.data.filter((l) => l.level === "critico").length, withoutAvailability: levels.data.filter((l) => l.level === "sem_disponibilidade").length },
      contracts: {
        total: contracts.data.length,
        expired: contracts.data.filter((c) => c.status === "vencido").length,
        expiring30: contracts.data.filter((c) => c.remainingDays >= 0 && c.remainingDays <= 30).length,
      },
      atas: { total: atas.data.length, expired: atas.data.filter((a) => a.validity === "vencida").length },
    });
  }
}
