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

/** Botão sem campos, para ativar ou prorrogar a ata sem passar função pelo servidor. */
export function AtaStepButton({ ataId, step }: { ataId: string; step: "activate" | "extend" }) {
  const extend = step === "extend";
  return (
    <ActionForm
      action={ataStepFormAction}
      submitLabel={extend ? "Prorrogar por 1 ano" : "Ativar ata"}
      submitVariant={extend ? "outline" : "default"}
      hiddenFields={{ ataId, step }}
    >
      {() => null}
    </ActionForm>
  );
}

/** Na ata, escolhe um contrato e grava nele o processo já vinculado. */
export function LinkContractToProcessForm({ processId, contracts }: { processId: string; contracts: { value: string; label: string }[] }) {
  return (
    <ActionForm action={linkContractProcessFormAction} submitLabel="Vincular contrato" hiddenFields={{ processId }}>
      {(errors) => <SelectField name="contractId" label="Contrato" required options={contracts} placeholder="Selecione o contrato…" errors={errors.contractId} />}
    </ActionForm>
  );
}

/** No contrato, escolhe uma ata e grava nela o processo já vinculado. */
export function LinkAtaToProcessForm({ processId, atas }: { processId: string; atas: { value: string; label: string }[] }) {
  return (
    <ActionForm action={linkAtaProcessFormAction} submitLabel="Vincular ata" hiddenFields={{ processId }}>
      {(errors) => <SelectField name="ataId" label="Ata" required options={atas} placeholder="Selecione a ata…" errors={errors.ataId} />}
    </ActionForm>
  );
}
