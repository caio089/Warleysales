"use client";

import { authorizeDisposalFormAction, placeHoldFormAction } from "@/modules/retention/actions";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { SelectField, TextField } from "@/shared/ui/forms/fields";

export function RetentionForms({ processes }: { processes: { value: string; label: string }[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section aria-labelledby="aut" className="rounded-lg border p-4"><h2 id="aut" className="mb-4 text-base font-semibold">Autorizar eliminação</h2>
        <ActionForm action={authorizeDisposalFormAction} submitLabel="Registrar autorização">
          {(e) => (<><SelectField name="processId" label="Processo" required options={processes} errors={e.processId} /><TextField name="reference" label="Ato/tabela de temporalidade" required errors={e.reference} /></>)}
        </ActionForm>
      </section>
      <section aria-labelledby="hold" className="rounded-lg border p-4"><h2 id="hold" className="mb-4 text-base font-semibold">Bloquear eliminação</h2>
        <ActionForm action={placeHoldFormAction} submitLabel="Registrar bloqueio" submitVariant="outline">
          {(e) => (<><SelectField name="processId" label="Processo" required options={processes} errors={e.processId} /><TextField name="reason" label="Motivo" required errors={e.reason} /></>)}
        </ActionForm>
      </section>
    </div>
  );
}
