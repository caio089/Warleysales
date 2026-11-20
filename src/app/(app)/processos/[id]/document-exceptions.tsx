"use client";

import { documentExceptionAction } from "@/modules/processes/exception-action";
import { DOCUMENT_TYPES } from "@/modules/processes/domain/document-types";
import type { AdministrativeProcess } from "@/modules/processes/schemas";
import { ActionForm } from "@/shared/ui/forms/action-form";

export function DocumentExceptions({ process }: { process: AdministrativeProcess }) {
  return (
    <details className="surface-card p-4">
      <summary className="cursor-pointer font-medium">Marcar documento como Não se aplica</summary>
      <p className="my-3 text-sm">A etapa será considerada resolvida no percentual. A justificativa e o responsável ficam registrados.</p>
      <ActionForm action={documentExceptionAction} submitLabel="Salvar justificativa" hiddenFields={{ processId: process.id }}>
        {() => <div className="space-y-3">
          <label className="block text-sm">Etapa
            <select name="typeCode" required className="block w-full rounded border p-2">
              {DOCUMENT_TYPES.map((type) => <option key={type.code} value={type.code}>{type.label}</option>)}
            </select>
          </label>
          <label className="block text-sm">Justificativa
            <textarea name="justification" required minLength={10} maxLength={1000} className="block w-full rounded border p-2" />
          </label>
          <label className="flex gap-2 text-sm"><input type="checkbox" name="remove" value="true" />Reativar exigência da etapa selecionada</label>
        </div>}
      </ActionForm>
      {Object.entries(process.documentExceptions ?? {}).map(([code, exception]) => (
        <p key={code} className="mt-3 rounded border p-3 text-sm">
          {DOCUMENT_TYPES.find((type) => type.code === code)?.label} — Não se aplica. {exception.justification}
        </p>
      ))}
    </details>
  );
}
