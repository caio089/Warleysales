"use client";

import { updatePasswordAction } from "@/modules/identity/actions";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { TextField } from "@/shared/ui/forms/fields";

export function PasswordForm() {
  return (
    <ActionForm action={updatePasswordAction} submitLabel="Salvar senha">
      {(errors) => (
        <>
          <TextField name="password" label="Nova senha" type="password" required errors={errors.password} hint="Mínimo de 10 caracteres." />
          <TextField name="confirmation" label="Confirmar senha" type="password" required errors={errors.confirmation} />
        </>
      )}
    </ActionForm>
  );
}
