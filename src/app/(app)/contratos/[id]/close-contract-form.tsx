"use client";

import { closeContractFormAction } from "@/modules/contracts/actions";
import { ActionForm } from "@/shared/ui/forms/action-form";

export function CloseContractForm({ contractId }: { contractId: string }) {
  return <ActionForm action={closeContractFormAction} submitLabel="Registrar encerramento administrativo" hiddenFields={{ contractId }}>
    {() => <p className="text-sm text-muted-foreground">A vigência e os compromissos da ata permanecem registrados.</p>}
  </ActionForm>;
}
