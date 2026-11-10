"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ExternalLink, Scale, ShieldCheck, TrendingDown } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { homologateFormalizationAction } from "@/modules/formalizations/actions";
import { formatCurrency, formatPercent } from "@/shared/lib/format";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { toast } from "@/shared/ui/toast-store";
import { cn } from "@/lib/utils";

export interface PendingFormalizationItem {
  id: string;
  processId: string;
  processNumber: string;
  councilId: string;
  councilName: string;
  supplierId: string;
  supplierName: string;
  instrumentType: string;
  instrumentNumber: string;
  estimatedValue: number;
  contractedValue: number;
  savingsValue: number;
  savingsPercent: number;
  createdAt?: Date | string;
}

export interface FormalizationQueueProps {
  items: PendingFormalizationItem[];
}

const INSTRUMENT_LABELS: Record<string, string> = {
  ata: "Ata de Registro de Preços",
  contrato: "Contrato Administrativo",
  empenho: "Nota de Empenho",
};

export function FormalizationQueue({ items }: FormalizationQueueProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  if (items.length === 0) {
    return null;
  }

  async function handleQuickHomologate(processId: string) {
    setProcessingId(processId);
    try {
      const formData = new FormData();
      formData.set("processId", processId);
      const res = await homologateFormalizationAction({ status: "idle" }, formData);
      if (res.status === "error") {
        toast.error(res.message);
      } else if (res.status === "success") {
        toast.success(res.message);
      }
    } catch {
      toast.error("Erro ao homologar a formalização.");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <section
      aria-label="Fila de Veredito de Warley"
      className="surface-card relative overflow-hidden rounded-2xl border-2 border-highlight/40 bg-gradient-to-br from-highlight/5 via-card to-card p-5 sm:p-6 shadow-sm"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-highlight/15 text-highlight">
            <ShieldCheck className="size-5" aria-hidden />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading text-lg font-semibold tracking-tight text-primary">
                Fila de Veredito — Homologação de Contratações
              </h2>
              <span className="rounded-full bg-highlight/20 px-2 py-0.5 text-xs font-semibold text-highlight">
                {items.length} pendente{items.length > 1 ? "s" : ""}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Processos com 100% dos documentos concluídos aguardando veredito exclusivo de Warley para liberação do estoque físico.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <caption className="sr-only">Processos aguardando homologação de Warley</caption>
          <thead>
            <tr className="border-b border-border/80 text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">
              <th scope="col" className="pb-3 pr-4">Órgão / Conselho</th>
              <th scope="col" className="pb-3 pr-4">Processo</th>
              <th scope="col" className="pb-3 pr-4">Fornecedor</th>
              <th scope="col" className="pb-3 pr-4">Instrumento</th>
              <th scope="col" className="pb-3 pr-4 text-right">Valor Estimado</th>
              <th scope="col" className="pb-3 pr-4 text-right">Valor Contratado</th>
              <th scope="col" className="pb-3 pr-4 text-right">Economia Apurada</th>
              <th scope="col" className="pb-3 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {items.map((item) => {
              const isProcessing = processingId === item.processId;
              const instrumentDisplay = `${INSTRUMENT_LABELS[item.instrumentType] ?? item.instrumentType} nº ${item.instrumentNumber}`;

              return (
                <tr key={item.id} className="transition-colors hover:bg-secondary/30">
                  <td className="py-3.5 pr-4 font-semibold text-primary">
                    <span className="inline-block rounded-md bg-secondary px-2 py-1 text-xs">
                      {item.councilName}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4">
                    <Link
                      href={`/processos/${item.processId}`}
                      className="group font-medium text-primary hover:text-highlight inline-flex items-center gap-1"
                    >
                      <span>{item.processNumber}</span>
                      <ExternalLink className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  </td>
                  <td className="py-3.5 pr-4 text-muted-foreground max-w-[200px] truncate" title={item.supplierName}>
                    {item.supplierName}
                  </td>
                  <td className="py-3.5 pr-4 text-muted-foreground">
                    {instrumentDisplay}
                  </td>
                  <td className="py-3.5 pr-4 text-right tabular-nums text-muted-foreground">
                    {formatCurrency(item.estimatedValue)}
                  </td>
                  <td className="py-3.5 pr-4 text-right tabular-nums font-medium text-primary">
                    {formatCurrency(item.contractedValue)}
                  </td>
                  <td className="py-3.5 pr-4 text-right tabular-nums">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(item.savingsValue)}
                    </span>
                    <span className="block text-[0.65rem] text-emerald-600/80 dark:text-emerald-400/80">
                      -{formatPercent(item.savingsPercent)}
                    </span>
                  </td>
                  <td className="py-3.5 text-right whitespace-nowrap">
                    <div className="inline-flex items-center justify-end gap-2">
                      <ConfirmDialog
                        trigger={
                          <Button
                            size="sm"
                            disabled={isProcessing}
                            className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                          >
                            <CheckCircle2 className="size-3.5" />
                            {isProcessing ? "Homologando…" : "Homologar"}
                          </Button>
                        }
                        title={`Homologar Contratação — Processo ${item.processNumber}`}
                        description={`Confirma a homologação da contratação com ${item.supplierName} no valor de ${formatCurrency(item.contractedValue)}? Ao homologar, o veredito favorável de Warley será registrado e o estoque bloqueado será convertido imediatamente em saldo físico disponível no conselho ${item.councilName}.`}
                        confirmLabel="Homologar e Liberar Estoque"
                        onConfirm={() => handleQuickHomologate(item.processId)}
                      />
                      <Link
                        href={`/processos/${item.processId}`}
                        className={buttonVariants({ variant: "outline", size: "sm", className: "h-8 gap-1 text-xs" })}
                      >
                        <span>Ver Processo</span>
                        <ArrowRight className="size-3" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
