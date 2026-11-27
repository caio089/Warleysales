"use client";

import { ataStepFormAction, linkAtaProcessFormAction } from "@/modules/atas/actions";
import { linkContractProcessFormAction } from "@/modules/contracts/actions";
import type { ActionState } from "@/shared/ui/forms/action-state";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { SelectField } from "@/shared/ui/forms/fields";

/** Escolhe o processo que passa a ligar ata, contrato e a pasta do processo. */
export function LinkProcessForm({
  action,
  entityIdName,
  entityId,
  processes,
  current,
}: {
  action: (previous: ActionState, formData: FormData) => Promise<ActionState>;
  entityIdName: "ataId" | "contractId";
  entityId: string;
  processes: { value: string; label: string }[];
  current: string | null;
}) {
  return (
    <ActionForm
      action={action}
      submitLabel={current ? "Atualizar processo" : "Vincular processo"}
      hiddenFields={{ [entityIdName]: entityId }}
      resetOnSuccess={false}
    >
      {(errors) => (
        <SelectField
          name="processId"
          label="Processo"
          options={processes}
          optional
          placeholder="Sem processo"
          defaultValue={current ?? ""}
          errors={errors.processId}
          hint="Ata e contrato com o mesmo processo ficam ligados entre si e aparecem na pasta do processo."
        />
      )}
    </ActionForm>
  );
}

/** Prorrogação da ata sem campos adicionais. */
export function AtaStepButton({ ataId }: { ataId: string }) {
  return (
    <ActionForm
      action={ataStepFormAction}
      submitLabel="Prorrogar por 1 ano"
      submitVariant="outline"
      hiddenFields={{ ataId, step: "extend" }}
    >
      {() => null}
    </ActionForm>
  );
}

/** Na ata, escolhe um contrato e grava nele o processo já vinculado. */
export function LinkContractToProcessForm({ processId, contracts, submitLabel = "Vincular contrato" }: { processId: string; contracts: { value: string; label: string }[]; submitLabel?: string }) {
  return (
    <ActionForm action={linkContractProcessFormAction} submitLabel={submitLabel} hiddenFields={{ processId }}>
      {(errors) => <SelectField name="contractId" label="Contrato" required options={contracts} placeholder="Selecione o contrato…" errors={errors.contractId} />}
    </ActionForm>
  );
}

/** No contrato, escolhe uma ata e grava nela o processo já vinculado. */
export function LinkAtaToProcessForm({ processId, atas, submitLabel = "Vincular ata" }: { processId: string; atas: { value: string; label: string }[]; submitLabel?: string }) {
  return (
    <ActionForm action={linkAtaProcessFormAction} submitLabel={submitLabel} hiddenFields={{ processId }}>
      {(errors) => <SelectField name="ataId" label="Ata" required options={atas} placeholder="Selecione a ata…" errors={errors.ataId} />}
    </ActionForm>
  );
}
