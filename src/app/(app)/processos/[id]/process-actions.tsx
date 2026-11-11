"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
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
  const [closingJustification, setClosingJustification] = useState("");
  const next = PROCESS_TRANSITIONS[status] ?? [];
  const statusOptions = next.map((value) => ({ value, label: PROCESS_STATUS[value]?.label ?? value }));

  if (!canChangeStatus && !canRegisterClosing) {
    return (
      <p className="mb-6 rounded-xl border border-dashed border-border/80 bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
        Você pode acompanhar e baixar documentos. Alterar a situação administrativa ou o relatório de encerramento
        exige permissão de gestão neste conselho.
      </p>
    );
  }

  return (
    <div className="mb-6 grid gap-6 lg:grid-cols-2">
      {canChangeStatus && statusOptions.length > 0 ? (
        <section aria-labelledby="situacao" className="surface-card p-6">
          <h2 id="situacao" className="mb-1 font-heading text-lg font-medium tracking-tight text-primary">Situação administrativa</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Atualize a etapa administrativa do processo conforme o andamento das deliberações e sessões.
          </p>
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
              {documentalComplete ? (
                <p className="mb-4 text-sm text-muted-foreground">
                  Emissão do relatório formal de encerramento do processo administrativo para fins de registro institucional e auditoria.
                </p>
              ) : (
                <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 text-sm text-amber-800 dark:text-amber-300">
                  <div className="flex items-center gap-2 font-medium">
                    <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span>Atenção: este processo não atingiu 100% dos documentos obrigatórios</span>
                  </div>
                  <p className="mt-1 text-xs text-amber-700/90 dark:text-amber-300/80">
                    Para registrar o encerramento com documentação incompleta, é obrigatório fornecer uma justificativa circunstanciada (mínimo de 20 caracteres).
                  </p>
                </div>
              )}
              <ActionForm action={registerClosingReportFormAction} submitLabel="Registrar relatório" hiddenFields={{ processId }}>
                {(errors) => (
                  <>
                    {!documentalComplete ? (
                      <div className="mb-4 space-y-1.5">
                        <label htmlFor="closingJustification" className="text-sm font-medium text-foreground">
                          Justificativa formal circunstanciada <span className="text-destructive">*</span>
                        </label>
                        <textarea
                          id="closingJustification"
                          name="closingJustification"
                          required
                          minLength={20}
                          value={closingJustification}
                          onChange={(e) => setClosingJustification(e.target.value)}
                          rows={3}
                          placeholder="Informe a justificativa formal para o encerramento do processo com documentação incompleta..."
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Mínimo 20 caracteres</span>
                          <span className={closingJustification.length < 20 ? "font-medium text-amber-600 dark:text-amber-400" : "font-medium text-emerald-600 dark:text-emerald-400"}>
                            {closingJustification.length} / 20 caracteres
                          </span>
                        </div>
                        {errors.closingJustification ? (
                          <p className="text-xs text-destructive">{errors.closingJustification.join(", ")}</p>
                        ) : null}
                      </div>
                    ) : null}
                  </>
                )}
              </ActionForm>
            </>
          )}
        </section>
      ) : null}
    </div>
  );
}
