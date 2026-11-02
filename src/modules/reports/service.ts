import type { AtaService, AtaView } from "@/modules/atas/service";
import type { ContractService, ContractView } from "@/modules/contracts/service";
import type { InventoryService, StockLevelView } from "@/modules/inventory/service";
import type { ProcessService, ProcessView } from "@/modules/processes/service";
import { can, type Actor } from "@/shared/lib/authz/policy";
import { fail, ok, type Result } from "@/shared/lib/result";
import { roundPercent } from "@/shared/lib/decimal";
import { diffInDays, toFortalezaDate } from "@/shared/lib/time";
import type { RuntimeDeps } from "@/shared/lib/service-support";

export interface OperationalSummary {
  processes: { total: number; completed: number; pending: number; averageProgress: number | null; byStatus: Record<string, number> };
  stock: { items: number; critical: number; withoutAvailability: number };
  contracts: { total: number; expired: number; expiring30: number };
  atas: { total: number; expired: number };
}

export interface DashboardAttention {
  id: string;
  title: string;
  detail: string;
  href: string;
  severity: "info" | "warning" | "danger";
}

export interface DashboardDeadline {
  id: string;
  kind: "contract" | "ata";
  label: string;
  days: number;
  href: string;
}

export interface DashboardSnapshot {
  summary: OperationalSummary;
  processStatuses: { status: string; count: number }[];
  attention: DashboardAttention[];
  deadlines: DashboardDeadline[];
}

export interface SummaryFilter {
  councilId?: string;
}

interface ScopedData {
  processes: ProcessView[];
  levels: StockLevelView[];
  contracts: ContractView[];
  atas: AtaView[];
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
    private readonly runtime: RuntimeDeps,
  ) {}

  async operationalSummary(actor: Actor, filter: SummaryFilter = {}): Promise<Result<OperationalSummary>> {
    const loaded = await this.loadScoped(actor, filter.councilId, "report.view");
    if (!loaded.ok) return loaded;
    return ok(this.toSummary(loaded.data));
  }

  /** Home operacional: qualquer membro do conselho enxerga o recorte autorizado (R14). Relatórios continuam em `report.view`. */
  async dashboard(actor: Actor, filter: SummaryFilter = {}): Promise<Result<DashboardSnapshot>> {
    const loaded = await this.loadScoped(actor, filter.councilId, "council.read");
    if (!loaded.ok) return loaded;
    const summary = this.toSummary(loaded.data);
    return ok({
      summary,
      processStatuses: Object.entries(summary.processes.byStatus)
        .map(([status, count]) => ({ status, count }))
        .sort((a, b) => b.count - a.count),
      attention: this.toAttention(summary),
      deadlines: this.toDeadlines(loaded.data),
    });
  }

  private async loadScoped(actor: Actor, councilId: string | undefined, permission: "report.view" | "council.read"): Promise<Result<ScopedData>> {
    const allowedSomewhere = actor.isCentralAdmin || actor.memberships.some((m) => can(actor, permission, m.councilId));
    if (!allowedSomewhere) return fail("FORBIDDEN", permission === "report.view" ? "Você não tem permissão para ver relatórios." : "Você não tem permissão para ver este painel.");
    if (councilId && !can(actor, permission, councilId)) {
      return fail("FORBIDDEN", permission === "report.view" ? "Você não tem permissão para ver relatórios deste conselho." : "Você não tem permissão para ver este conselho.");
    }

    const [processes, levels, contracts, atas] = await Promise.all([
      this.processes.list(actor),
      this.inventory.listLevels(actor, councilId),
      this.contracts.list(actor),
      this.atas.list(actor),
    ]);
    if (!processes.ok) return processes;
    if (!levels.ok) return levels;
    if (!contracts.ok) return contracts;
    if (!atas.ok) return atas;

    return ok({
      processes: councilId ? processes.data.filter((p) => p.process.councilId === councilId) : processes.data,
      levels: levels.data,
      contracts: councilId ? contracts.data.filter((c) => c.contract.councilId === councilId) : contracts.data,
      atas: councilId ? atas.data.filter((a) => a.ata.councilId === councilId) : atas.data,
    });
  }

  private toSummary(data: ScopedData): OperationalSummary {
    const byStatus: Record<string, number> = {};
    for (const p of data.processes) byStatus[p.process.status] = (byStatus[p.process.status] ?? 0) + 1;
    const completed = data.processes.filter((p) => p.completion === "completa").length;
    return {
      processes: {
        total: data.processes.length,
        completed,
        pending: data.processes.length - completed,
        byStatus,
        averageProgress: data.processes.length
          ? roundPercent(data.processes.reduce((s, p) => s + p.displayPercent, 0) / data.processes.length)
          : null,
      },
      stock: {
        items: data.levels.length,
        critical: data.levels.filter((l) => l.level === "critico").length,
        withoutAvailability: data.levels.filter((l) => l.level === "sem_disponibilidade").length,
      },
      contracts: {
        total: data.contracts.length,
        expired: data.contracts.filter((c) => c.status === "vencido").length,
        expiring30: data.contracts.filter((c) => c.remainingDays >= 0 && c.remainingDays <= 30).length,
      },
      atas: {
        total: data.atas.length,
        expired: data.atas.filter((a) => a.validity === "vencida").length,
      },
    };
  }

  private toAttention(summary: OperationalSummary): DashboardAttention[] {
    const items: DashboardAttention[] = [];
    if (summary.processes.pending > 0) {
      items.push({
        id: "docs",
        title: "Documentação pendente",
        detail: `${summary.processes.pending} processo(s) sem os 7 documentos obrigatórios.`,
        href: "/processos",
        severity: "warning",
      });
    }
    if (summary.stock.critical > 0) {
      items.push({
        id: "stock-critical",
        title: "Estoque crítico",
        detail: `${summary.stock.critical} item(ns) abaixo do mínimo.`,
        href: "/estoque",
        severity: "danger",
      });
    }
    if (summary.stock.withoutAvailability > 0) {
      items.push({
        id: "stock-empty",
        title: "Sem disponibilidade",
        detail: `${summary.stock.withoutAvailability} item(ns) sem saldo disponível.`,
        href: "/estoque",
        severity: "danger",
      });
    }
    if (summary.contracts.expiring30 > 0) {
      items.push({
        id: "contracts-30",
        title: "Contratos a vencer",
        detail: `${summary.contracts.expiring30} contrato(s) nos próximos 30 dias.`,
        href: "/contratos",
        severity: "warning",
      });
    }
    if (summary.contracts.expired > 0) {
      items.push({
        id: "contracts-expired",
        title: "Contratos vencidos",
        detail: `${summary.contracts.expired} contrato(s) fora da vigência.`,
        href: "/contratos",
        severity: "danger",
      });
    }
    if (summary.atas.expired > 0) {
      items.push({
        id: "atas-expired",
        title: "Atas vencidas",
        detail: `${summary.atas.expired} ata(s) de registro de preços vencida(s).`,
        href: "/atas",
        severity: "danger",
      });
    }
    return items;
  }

  private toDeadlines(data: ScopedData): DashboardDeadline[] {
    const today = toFortalezaDate(this.runtime.now());
    const contracts = data.contracts
      .filter((c) => c.remainingDays >= 0 && c.remainingDays <= 60)
      .map((c) => ({
        id: c.contract.id,
        kind: "contract" as const,
        label: c.contract.number,
        days: c.remainingDays,
        href: `/contratos/${c.contract.id}`,
      }));
    const atas = data.atas
      .map((a) => ({ view: a, days: diffInDays(today, a.endDate) }))
      .filter((a) => a.days >= 0 && a.days <= 60)
      .map((a) => ({
        id: a.view.ata.id,
        kind: "ata" as const,
        label: a.view.ata.number,
        days: a.days,
        href: `/atas/${a.view.ata.id}`,
      }));
    return [...contracts, ...atas].sort((a, b) => a.days - b.days).slice(0, 6);
  }
}
