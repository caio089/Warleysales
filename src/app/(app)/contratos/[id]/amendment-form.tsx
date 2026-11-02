"use client";

import { addAmendmentFormAction } from "@/modules/contracts/actions";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { TextField } from "@/shared/ui/forms/fields";

export function AmendmentForm({ contractId }: { contractId: string }) {
  return (
    <ActionForm action={addAmendmentFormAction} submitLabel="Registrar aditivo" hiddenFields={{ contractId }}>
      {(e) => (<>
        <TextField name="reason" label="Justificativa" required errors={e.reason} />
        <TextField name="signedAt" label="Data de assinatura" type="date" required errors={e.signedAt} />
        <TextField name="endDate" label="Nova data final (opcional)" type="date" errors={e.endDate} />
        <TextField name="value" label="Novo valor (opcional)" type="number" step="0.01" min="0" errors={e.value} />
      </>)}
    </ActionForm>
  );
}
