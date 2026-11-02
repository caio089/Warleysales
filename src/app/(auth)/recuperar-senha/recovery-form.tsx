"use client";

import { Input } from "@/components/ui/input";
import { requestPasswordRecoveryAction } from "@/modules/identity/actions";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { FormField } from "@/shared/ui/form-field";

export function RecoveryForm() {
  return (
    <ActionForm action={requestPasswordRecoveryAction} submitLabel="Enviar instruções">
      {(errors) => (
        <FormField label="E-mail" required errors={errors.email} hint="Enviaremos um link para redefinir a senha.">
          {(p) => <Input {...p} name="email" type="email" autoComplete="email" required />}
        </FormField>
      )}
    </ActionForm>
  );
}
