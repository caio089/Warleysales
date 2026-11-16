import type { ProcessFormalization } from "@/modules/formalizations/domain/formalization";
import type { Council } from "@/modules/identity/schemas";
import type { SavingsReportData } from "./pdf";
import type { OperationalSummary } from "./service";

const DEMO_DESCRIPTION = "Dados de demonstração para visualizar o painel.";

export function demoCouncilIds(councils: readonly Council[]): string[] {
  return councils.filter((council) => council.institutionalInfo?.trim() === DEMO_DESCRIPTION).map((council) => council.id);
}

export function hasOperationalData(summary: OperationalSummary, savingsCount: number): boolean {
  return summary.processes.total + summary.stock.items + summary.contracts.total + summary.atas.total + savingsCount > 0;
}

export function savingsForExport(formalizations: readonly ProcessFormalization[]): SavingsReportData {
  const totalEstimated = Math.round(formalizations.reduce((sum, item) => sum + item.estimatedValue, 0) * 100) / 100;
  const totalContracted = Math.round(formalizations.reduce((sum, item) => sum + item.contractedValue, 0) * 100) / 100;
  const totalSavings = Math.round((totalEstimated - totalContracted) * 100) / 100;
  return {
    totalEstimated,
    totalContracted,
    totalSavings,
    averageSavingsPercent: totalEstimated > 0 ? Math.round(totalSavings / totalEstimated * 10000) / 100 : 0,
    count: formalizations.length,
  };
}
