"use client";

import { changeProcessStatusFormAction, registerClosingReportFormAction } from "@/modules/processes/actions";
import { PROCESS_TRANSITIONS, type ProcessStatus } from "@/modules/processes/domain/process-status";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { SelectField } from "@/shared/ui/forms/fields";
import { PROCESS_STATUS } from "@/shared/ui/status-presentation";

interface ProcessActionsProps {
  processId: string;
  status: ProcessStatus;
  canChangeStatus: boolean;
  canRegisterClosing: boolean;
  closingReportRegistered: boolean;
  documentalComplete: boolean;
}

/** Situação administrativa (R4) e relatório de encerramento (R6), independentes do percentual. */
export function ProcessActions({ processId, status, canChangeStatus, canRegisterClosing, closingReportRegistered, documentalComplete }: ProcessActionsProps) {
  const next = PROCESS_TRANSITIONS[status] ?? [];
  const statusOptions = next.map((value) => ({ value, label: PROCESS_STATUS[value]?.label ?? value }));

  if (!canChangeStatus && !canRegisterClosing) return null;

  return (
    <div className="mb-6 grid gap-6 lg:grid-cols-2">
      {canChangeStatus && statusOptions.length > 0 ? (
        <section aria-labelledby="situacao" className="surface-card p-6">
          <h2 id="situacao" className="mb-1 font-heading text-lg font-medium tracking-tight text-primary">Situação administrativa</h2>
          <p className="mb-4 text-sm text-muted-foreground">Independe da documentação. 100% não conclui o processo.</p>
          <ActionForm action={changeProcessStatusFormAction} submitLabel="Atualizar situação" hiddenFields={{ processId }}>
            {(e) => <SelectField name="status" label="Nova situação" required options={statusOptions} errors={e.status} />}
          </ActionForm>
        </section>
      ) : null}
      {canRegisterClosing ? (
        <section aria-labelledby="encerramento" className="surface-card p-6">
          <h2 id="encerramento" className="mb-1 font-heading text-lg font-medium tracking-tight text-primary">Relatório de encerramento</h2>
          {closingReportRegistered ? (
            <p className="text-sm text-muted-foreground">Registrado. A limpeza pode ocorrer após 30 dias, sem bloqueio e com autorização.</p>
          ) : (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                {documentalComplete
                  ? "Obrigatório para a limpeza documental (R6). Sem este registro o job só examina e pula."
                  : "Pode ser registrado agora; a limpeza só avalia processos com documentação 100%."}
              </p>
              <ActionForm action={registerClosingReportFormAction} submitLabel="Registrar relatório" hiddenFields={{ processId }}>
                {() => null}
              </ActionForm>
            </>
          )}
        </section>
      ) : null}
    </div>
  );
}
