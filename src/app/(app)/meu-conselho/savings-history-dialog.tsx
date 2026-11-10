"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Dialog } from "@base-ui/react/dialog";
import {
  ExternalLink,
  ReceiptText,
  TrendingDown,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPercent } from "@/shared/lib/format";
import { formatDateTimeFortaleza } from "@/shared/lib/time";

export interface SavingsHistoryItem {
  id: string;
  processId: string;
  processNumber: string;
  supplierName: string;
  instrumentType: string;
  instrumentNumber: string;
  estimatedValue: number;
  contractedValue: number;
  savingsValue: number;
  savingsPercent: number;
  homologatedAt: Date | string | null;
}

export interface SavingsSummaryProps {
  totalEstimated: number;
  totalContracted: number;
  totalSavings: number;
  averageSavingsPercent: number;
  count: number;
}

export interface SavingsHistoryDialogProps {
  councilName: string;
  summary: SavingsSummaryProps;
  items: SavingsHistoryItem[];
  trigger?: ReactNode;
}

const INSTRUMENT_LABELS: Record<string, string> = {
  ata: "Ata",
  contrato: "Contrato",
  empenho: "Empenho",
};

export function SavingsHistoryDialog({
  councilName,
  summary,
  items,
  trigger,
}: SavingsHistoryDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger render={<span className="inline-flex" />}>
        {trigger ?? (
          <Button variant="outline" size="sm" className="gap-2">
            <TrendingDown className="size-4 text-emerald-600 dark:text-emerald-400" />
            Ver Histórico de Contratações
          </Button>
        )}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-primary/25 backdrop-blur-[2px] transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 flex max-h-[88vh] w-[min(60rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-border/80 bg-popover p-6 text-popover-foreground shadow-[0_24px_60px_-24px_oklch(0.23_0.05_250_/_0.45)] outline-none">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-border/70 pb-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <TrendingDown className="size-5" aria-hidden />
              </span>
              <div>
                <Dialog.Title className="font-heading text-lg font-semibold tracking-tight text-primary">
                  Histórico de Economia e Contratações
                </Dialog.Title>
                <Dialog.Description className="text-xs text-muted-foreground">
                  {councilName} — Registro consolidado de processos homologados com redução de custos.
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-lg text-muted-foreground hover:text-foreground"
                />
              }
            >
              <XIcon className="size-4" />
              <span className="sr-only">Fechar</span>
            </Dialog.Close>
          </div>

          {/* Resumo de Indicadores */}
          <div className="my-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-border/70 bg-card p-3">
              <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                Total Economizado
              </span>
              <p className="font-heading text-lg font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                {formatCurrency(summary.totalSavings)}
              </p>
            </div>
            <div className="rounded-xl border border-border/70 bg-card p-3">
              <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                Desconto Médio
              </span>
              <p className="font-heading text-lg font-semibold tabular-nums text-primary">
                {formatPercent(summary.averageSavingsPercent)}
              </p>
            </div>
            <div className="rounded-xl border border-border/70 bg-card p-3">
              <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                Total Contratado
              </span>
              <p className="font-heading text-lg font-semibold tabular-nums text-muted-foreground">
                {formatCurrency(summary.totalContracted)}
              </p>
            </div>
            <div className="rounded-xl border border-border/70 bg-card p-3">
              <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                Contratações Homologadas
              </span>
              <p className="font-heading text-lg font-semibold tabular-nums text-primary">
                {summary.count}
              </p>
            </div>
          </div>

          {/* Tabela ou Vazio */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/80 bg-secondary/30 px-4 py-12 text-center">
                <ReceiptText className="size-8 text-muted-foreground" />
                <p className="text-sm font-medium text-primary">Nenhuma contratação homologada ainda</p>
                <p className="max-w-md text-xs text-muted-foreground">
                  Quando as formalizações forem concluídas e homologadas por Warley, o demonstrativo detalhado de cada processo aparecerá aqui.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <caption className="sr-only">Histórico de contratações homologadas</caption>
                  <thead>
                    <tr className="border-b border-border/80 text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                      <th scope="col" className="pb-2.5 pr-3">Processo</th>
                      <th scope="col" className="pb-2.5 pr-3">Instrumento</th>
                      <th scope="col" className="pb-2.5 pr-3">Fornecedor</th>
                      <th scope="col" className="pb-2.5 pr-3">Homologado Em</th>
                      <th scope="col" className="pb-2.5 pr-3 text-right">Valor Estimado</th>
                      <th scope="col" className="pb-2.5 pr-3 text-right">Valor Contratado</th>
                      <th scope="col" className="pb-2.5 text-right">Economia Gerada</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {items.map((item) => {
                      const dateDisplay = item.homologatedAt
                        ? formatDateTimeFortaleza(item.homologatedAt)
                        : "—";
                      const instrumentDisplay = `${INSTRUMENT_LABELS[item.instrumentType] ?? item.instrumentType} nº ${item.instrumentNumber}`;

                      return (
                        <tr key={item.id} className="transition-colors hover:bg-secondary/30">
                          <td className="py-2.5 pr-3 font-medium text-primary">
                            <Link
                              href={`/processos/${item.processId}`}
                              className="group inline-flex items-center gap-1 hover:text-highlight"
                            >
                              <span>{item.processNumber}</span>
                              <ExternalLink className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                            </Link>
                          </td>
                          <td className="py-2.5 pr-3 text-muted-foreground">
                            {instrumentDisplay}
                          </td>
                          <td className="py-2.5 pr-3 text-muted-foreground max-w-[160px] truncate" title={item.supplierName}>
                            {item.supplierName}
                          </td>
                          <td className="py-2.5 pr-3 text-muted-foreground whitespace-nowrap">
                            {dateDisplay}
                          </td>
                          <td className="py-2.5 pr-3 text-right tabular-nums text-muted-foreground whitespace-nowrap">
                            {formatCurrency(item.estimatedValue)}
                          </td>
                          <td className="py-2.5 pr-3 text-right tabular-nums font-medium text-primary whitespace-nowrap">
                            {formatCurrency(item.contractedValue)}
                          </td>
                          <td className="py-2.5 text-right tabular-nums whitespace-nowrap">
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(item.savingsValue)}
                            </span>
                            <span className="block text-[0.65rem] text-emerald-600/80 dark:text-emerald-400/80">
                              -{formatPercent(item.savingsPercent)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-4 flex justify-end border-t border-border/70 pt-3">
            <Dialog.Close render={<Button variant="outline" size="sm" />}>
              Fechar
            </Dialog.Close>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
