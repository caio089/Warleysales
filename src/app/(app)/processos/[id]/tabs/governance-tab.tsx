"use client";

import { ShieldCheck } from "lucide-react";
import type { ProcessStatus } from "@/modules/processes/domain/process-status";
import { ProcessActions } from "../process-actions";

export interface GovernanceTabProps {
  processId: string;
  status: ProcessStatus;
  canChangeStatus: boolean;
  canRegisterClosing: boolean;
  closingReportRegistered: boolean;
  documentalComplete: boolean;
}

/** Aba 3 — Governança e Histórico: Ciclo de vida, situação administrativa, relatório de encerramento e rastreabilidade. */
export function GovernanceTab({
  processId,
  status,
  canChangeStatus,
  canRegisterClosing,
  closingReportRegistered,
  documentalComplete,
}: GovernanceTabProps) {
  return (
    <div className="space-y-6">
      {/* Cabeçalho da Aba */}
      <section
        aria-labelledby="governanca-heading"
        className="surface-card p-5 sm:p-6"
      >
        <div className="flex flex-col gap-1">
          <h2
            id="governanca-heading"
            className="font-heading text-base font-semibold text-foreground sm:text-lg"
          >
            Governança & Situação Administrativa
          </h2>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Controle do ciclo de vida, transições de status e encerramento formal do processo.
          </p>
        </div>
      </section>

      {/* Ações Administrativas (Transição de status e Encerramento formal) */}
      <ProcessActions
        processId={processId}
        status={status}
        canChangeStatus={canChangeStatus}
        canRegisterClosing={canRegisterClosing}
        closingReportRegistered={closingReportRegistered}
        documentalComplete={documentalComplete}
      />

      {/* Card Informativo de Governança e Trilha de Auditoria */}
      <section
        aria-labelledby="trilha-auditoria-heading"
        className="surface-card flex items-start gap-4 p-5 sm:p-6"
      >
        <div className="rounded-xl border border-primary/20 bg-primary/10 p-2.5 text-primary">
          <ShieldCheck className="size-5 shrink-0" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h3
            id="trilha-auditoria-heading"
            className="text-sm font-semibold text-foreground"
          >
            Trilha de Auditoria & Conformidade
          </h3>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Todas as alterações de status, uploads de arquivos e homologações de compras são registradas de forma imutável na Trilha de Auditoria.
          </p>
        </div>
      </section>
    </div>
  );
}
