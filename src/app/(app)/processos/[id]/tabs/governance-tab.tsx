"use client";

import { History, ShieldCheck } from "lucide-react";
import type { ProcessStatus } from "@/modules/processes/domain/process-status";
import { ActivityTimeline, type TimelineEntry } from "@/shared/ui/activity-timeline";
import { ProcessActions } from "../process-actions";

export interface GovernanceTabProps {
  processId: string;
  status: ProcessStatus;
  canChangeStatus: boolean;
  canRegisterClosing: boolean;
  closingReportRegistered: boolean;
  documentalComplete: boolean;
  history: TimelineEntry[];
}

/** Aba 3 — Governança e Histórico: ciclo de vida, datas/horários e rastreabilidade. */
export function GovernanceTab({
  processId,
  status,
  canChangeStatus,
  canRegisterClosing,
  closingReportRegistered,
  documentalComplete,
  history,
}: GovernanceTabProps) {
  return (
    <div className="space-y-6">
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

      <ProcessActions
        processId={processId}
        status={status}
        canChangeStatus={canChangeStatus}
        canRegisterClosing={canRegisterClosing}
        closingReportRegistered={closingReportRegistered}
        documentalComplete={documentalComplete}
      />

      <section
        aria-labelledby="historico-processo-heading"
        className="surface-card space-y-4 p-5 sm:p-6"
      >
        <div className="flex items-start gap-3">
          <div className="rounded-xl border border-primary/20 bg-primary/10 p-2.5 text-primary">
            <History className="size-5 shrink-0" aria-hidden="true" />
          </div>
          <div className="min-w-0 space-y-1">
            <h3
              id="historico-processo-heading"
              className="font-heading text-base font-semibold text-foreground"
            >
              Histórico com data e horário
            </h3>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Solicitação, aprovações, documentos e formalização — tudo com data e hora (Fortaleza).
            </p>
          </div>
        </div>
        <ActivityTimeline
          entries={history}
          emptyLabel="Nenhum evento registrado neste processo ainda."
        />
      </section>

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
            As ações acima também ficam registradas na trilha de auditoria do sistema.
          </p>
        </div>
      </section>
    </div>
  );
}
