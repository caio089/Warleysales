"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadUrlAction, manualDeleteFormAction, unlinkDocumentFormAction, uploadDocumentAction } from "@/modules/documents/actions";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { FileUpload } from "@/shared/ui/file-upload";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { toast } from "@/shared/ui/toast-store";

interface DocumentCardProps {
  processId: string;
  typeCode: string;
  label: string;
  valid: boolean;
  files: { id: string; name: string }[];
  canUpload: boolean;
  canUnlink: boolean;
  canManualDelete: boolean;
}

/** Cartão de um dos 7 tipos documentais: situação, arquivos e envio. */
export function DocumentCard({ processId, typeCode, label, valid, files, canUpload, canUnlink, canManualDelete }: DocumentCardProps) {
  async function download(attachmentId: string) {
    const result = await downloadUrlAction(attachmentId);
    if (result.ok) window.open(result.data, "_blank", "noopener");
    else toast.error(result.message);
  }

  return (
    <article className="space-y-3 rounded-lg border p-4" aria-label={label}>
      <header className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{typeCode}</p>
          <h3 className="text-sm font-semibold">{label}</h3>
        </div>
        {valid ? <CheckCircle2 className="size-5 text-success-foreground" aria-label="Documento válido anexado" /> : <Circle className="size-5 text-muted-foreground" aria-label="Documento pendente" />}
      </header>

      {files.length > 0 ? (
        <ul className="space-y-1 text-sm">
          {files.map((f) => (
            <li key={f.id} className="flex items-center justify-between gap-2">
              <button type="button" onClick={() => download(f.id)} className="truncate text-left text-primary underline-offset-4 hover:underline">{f.name}</button>
              <span className="flex shrink-0 gap-1">
                {canUnlink ? (
                  <ActionForm action={unlinkDocumentFormAction} submitLabel="Desvincular" submitVariant="outline" hiddenFields={{ attachmentId: f.id, processId }}>{() => null}</ActionForm>
                ) : null}
                {canManualDelete ? (
                  <ConfirmDialog
                    trigger={<Button variant="destructive" size="sm">Excluir</Button>}
                    title="Excluir definitivamente?"
                    description="Esta ação remove o arquivo do armazenamento e não pode ser desfeita. Ficará registrada na auditoria."
                    confirmLabel="Excluir definitivamente"
                    destructive
                    onConfirm={async () => {
                      const body = new FormData();
                      body.set("attachmentId", f.id);
                      body.set("processId", processId);
                      const state = await manualDeleteFormAction({ status: "idle" }, body);
                      if (state.status === "error") toast.error(state.message); else toast.success("Documento excluído.");
                    }}
                  />
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      ) : <p className="text-sm text-muted-foreground">Nenhum arquivo anexado.</p>}

      {canUpload ? (
        <FileUpload
          label="Selecionar arquivo"
          onUpload={async (file, report) => {
            report(10);
            const body = new FormData();
            body.set("file", file);
            const result = await uploadDocumentAction(processId, typeCode, body);
            report(100);
            return result;
          }}
        />
      ) : null}
    </article>
  );
}
