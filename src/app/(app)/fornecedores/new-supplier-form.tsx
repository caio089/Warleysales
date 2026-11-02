"use client";

import { createSupplierFormAction } from "@/modules/suppliers/actions";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { TextField } from "@/shared/ui/forms/fields";

export function NewSupplierForm() {
  return (
    <ActionForm action={createSupplierFormAction} submitLabel="Cadastrar fornecedor">
      {(e) => (<>
        <TextField name="name" label="Razão social" required errors={e.name} />
        <TextField name="cnpj" label="CNPJ" placeholder="00.000.000/0000-00" errors={e.cnpj} />
        <TextField name="email" label="E-mail" type="email" errors={e.email} />
        <TextField name="phone" label="Telefone" errors={e.phone} />
      </>)}
    </ActionForm>
  );
}
