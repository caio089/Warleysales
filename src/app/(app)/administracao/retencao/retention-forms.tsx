"use client";

import { registerClosingReportFormAction } from "@/modules/processes/actions";
import { authorizeDisposalFormAction, placeHoldFormAction, releaseHoldFormAction } from "@/modules/retention/actions";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { SelectField, TextField } from "@/shared/ui/forms/fields";

type Option = { value: string; label: string };

export function RetentionForms({
  processes,
  withoutClosing,
  holds,
}: {
  processes: Option[];
  withoutClosing: Option[];
  holds: Option[];
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section aria-labelledby="encerramento" className="surface-card p-6">
        <h2 id="encerramento" className="mb-4 font-heading text-lg font-medium tracking-tight text-primary">Relatório de encerramento</h2>
        {withoutClosing.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todos os processos 100% já têm relatório, ou ainda não há processo completo.</p>
        ) : (
          <ActionForm action={registerClosingReportFormAction} submitLabel="Registrar relatório">
            {(e) => <SelectField name="processId" label="Processo" required options={withoutClosing} errors={e.processId} />}
          </ActionForm>
        )}
      </section>
      <section aria-labelledby="aut" className="surface-card p-6">
        <h2 id="aut" className="mb-4 font-heading text-lg font-medium tracking-tight text-primary">Autorizar eliminação</h2>
        <ActionForm action={authorizeDisposalFormAction} submitLabel="Registrar autorização">
          {(e) => (<><SelectField name="processId" label="Processo" required options={processes} errors={e.processId} /><TextField name="reference" label="Ato/tabela de temporalidade" required errors={e.reference} /></>)}
        </ActionForm>
      </section>
      <section aria-labelledby="hold" className="surface-card p-6">
        <h2 id="hold" className="mb-4 font-heading text-lg font-medium tracking-tight text-primary">Bloquear eliminação</h2>
        <ActionForm action={placeHoldFormAction} submitLabel="Registrar bloqueio" submitVariant="outline">
          {(e) => (<><SelectField name="processId" label="Processo" required options={processes} errors={e.processId} /><TextField name="reason" label="Motivo" required errors={e.reason} /></>)}
        </ActionForm>
      </section>
      <section aria-labelledby="release" className="surface-card p-6">
        <h2 id="release" className="mb-4 font-heading text-lg font-medium tracking-tight text-primary">Liberar bloqueio</h2>
        {holds.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum bloqueio ativo.</p>
        ) : (
          <ActionForm action={releaseHoldFormAction} submitLabel="Liberar" submitVariant="outline">
            {(e) => <SelectField name="holdId" label="Bloqueio" required options={holds} errors={e.holdId} />}
          </ActionForm>
        )}
      </section>
    </div>
  );
}
