"use client";

import { createCouncilFormAction, updateCouncilFormAction } from "@/modules/identity/council-actions";
import { formatWhatsapp } from "@/modules/identity/domain/whatsapp";
import type { Council } from "@/modules/identity/schemas";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { SelectField, TextAreaField, TextField } from "@/shared/ui/forms/fields";

const WHATSAPP_HINT = "Celular com DDD. Fica gravado para você enviar mensagens pelo WhatsApp quando quiser.";

export function NewCouncilForm() {
  return (
    <ActionForm action={createCouncilFormAction} submitLabel="Cadastrar organização">
      {(e) => (
        <>
          <SelectField name="organizationType" label="Tipo" required defaultValue="public_body" options={[{ value: "public_body", label: "Órgão público" }, { value: "private_company", label: "Empresa privada" }]} errors={e.organizationType} />
          <TextField name="name" label="Nome da organização" required errors={e.name} />
          <TextField name="acronym" label="Sigla" required errors={e.acronym} />
          <TextField
            name="whatsapp"
            label="WhatsApp"
            type="tel"
            placeholder="(85) 99999-9999"
            hint={WHATSAPP_HINT}
            errors={e.whatsappE164}
          />
          <TextAreaField name="institutionalInfo" label="Informações institucionais" errors={e.institutionalInfo} />
        </>
      )}
    </ActionForm>
  );
}

/** Edição da organização (admin central): mesmo contrato do cadastro, incluindo o WhatsApp. */
export function EditCouncilForm({ council }: { council: Council }) {
  return (
    <ActionForm action={updateCouncilFormAction} submitLabel="Salvar alterações" hiddenFields={{ councilId: council.id }} resetOnSuccess={false}>
      {(e) => (
        <>
          <SelectField name="organizationType" label="Tipo" required defaultValue={council.organizationType} options={[{ value: "public_body", label: "Órgão público" }, { value: "private_company", label: "Empresa privada" }]} errors={e.organizationType} />
          <TextField name="name" label="Nome da organização" required defaultValue={council.name} errors={e.name} />
          <TextField name="acronym" label="Sigla" required defaultValue={council.acronym} errors={e.acronym} />
          <TextField
            name="whatsapp"
            label="WhatsApp"
            type="tel"
            placeholder="(85) 99999-9999"
            defaultValue={council.whatsappE164 ? formatWhatsapp(council.whatsappE164) : ""}
            hint={WHATSAPP_HINT}
            errors={e.whatsappE164}
          />
          <TextAreaField
            name="institutionalInfo"
            label="Informações institucionais"
            defaultValue={council.institutionalInfo ?? ""}
            errors={e.institutionalInfo}
          />
        </>
      )}
    </ActionForm>
  );
}
