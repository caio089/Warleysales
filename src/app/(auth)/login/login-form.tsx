"use client";

import { Input } from "@/components/ui/input";
import { signInAction } from "@/modules/identity/actions";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { FormField } from "@/shared/ui/form-field";

export function LoginForm() {
  return (
    <ActionForm action={signInAction} submitLabel="Entrar" submitClassName="h-10 w-full">
      {(errors) => (
        <>
          <FormField label="E-mail" required errors={errors.email}>
            {(p) => <Input {...p} name="email" type="email" autoComplete="email" required />}
          </FormField>
          <FormField label="Senha" required errors={errors.password}>
            {(p) => <Input {...p} name="password" type="password" autoComplete="current-password" required />}
          </FormField>
        </>
      )}
    </ActionForm>
  );
}
