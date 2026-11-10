"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { confirmDocumentUploadAction, downloadUrlAction, manualDeleteFormAction, prepareDocumentUploadAction, unlinkDocumentFormAction } from "@/modules/documents/actions";
import { sha256Hex, uploadToSignedUrl } from "@/shared/lib/browser-upload";
import { formatBytes } from "@/shared/lib/format";
import { formatDateTimeFortaleza } from "@/shared/lib/time";
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
    <article className="surface-card space-y-3 p-5" aria-label={label}>
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
            // Upload direto: (1) servidor autoriza e emite token, (2) navegador envia ao Storage, (3) servidor valida e confirma.
            report(5);
            const sha256 = await sha256Hex(file);
            const prepared = await prepareDocumentUploadAction(processId, typeCode, { fileName: file.name, size: file.size, sha256 });
            if (!prepared.ok) return prepared;
            report(20);
            const sent = await uploadToSignedUrl(prepared.data.storagePath, prepared.data.token, file, prepared.data.mime);
            if (!sent.ok) return sent;
            report(85);
            const confirmed = await confirmDocumentUploadAction(processId, prepared.data.attachmentId);
            report(100);
            return confirmed;
          }}
        />
      ) : null}
    </article>
  );
}

export interface AdditionalDocItem {
  id: string;
  name: string;
  size: number;
  createdAt: Date | string;
}

export interface AdditionalDocumentsCardProps {
  processId: string;
  docs: AdditionalDocItem[];
  canUpload: boolean;
  canUnlink: boolean;
  canManualDelete: boolean;
}

/** Card para listagem, download e upload de artefatos complementares/adicionais (OUTRO). */
export function AdditionalDocumentsCard({
  processId,
  docs,
  canUpload,
  canUnlink,
  canManualDelete,
}: AdditionalDocumentsCardProps) {
  const router = useRouter();

  async function download(attachmentId: string) {
    const result = await downloadUrlAction(attachmentId);
    if (result.ok) window.open(result.data, "_blank", "noopener");
    else toast.error(result.message);
  }

  return (
    <article className="surface-card space-y-4 p-5" aria-label="Artefatos Adicionais & Complementares">
      <header className="flex items-start justify-between gap-2 border-b border-border/50 pb-3">
        <div>
          <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">OUTRO</p>
          <h3 className="text-base font-semibold text-foreground">Artefatos Adicionais & Complementares</h3>
          <p className="text-xs text-muted-foreground">
            Documentos complementares, minutas ou laudos. Documentos adicionais anexados: {docs.length}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
          {docs.length} {docs.length === 1 ? "documento" : "documentos"}
        </span>
      </header>

      {docs.length > 0 ? (
        <ul className="space-y-2 text-sm">
          {docs.map((doc) => (
            <li
              key={doc.id}
              className="flex flex-col gap-2 rounded-lg border border-border/50 bg-card/40 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 shrink-0 text-muted-foreground" />
                  <button
                    type="button"
                    onClick={() => download(doc.id)}
                    className="truncate text-left font-medium text-primary underline-offset-4 hover:underline"
                    title={`Baixar ${doc.name}`}
                  >
                    {doc.name}
                  </button>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatBytes(doc.size)}</span>
                  <span>•</span>
                  <span>Enviado em {formatDateTimeFortaleza(doc.createdAt)}</span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => download(doc.id)}
                  className="h-8 text-xs"
                >
                  <Download className="mr-1 size-3.5" />
                  Baixar
                </Button>
                {canUnlink ? (
                  <ActionForm
                    action={unlinkDocumentFormAction}
                    submitLabel="Desvincular"
                    submitVariant="outline"
                    hiddenFields={{ attachmentId: doc.id, processId }}
                  >
                    {() => null}
                  </ActionForm>
                ) : null}
                {canManualDelete ? (
                  <ConfirmDialog
                    trigger={
                      <Button variant="destructive" size="xs" className="h-8">
                        Excluir
                      </Button>
                    }
                    title="Excluir definitivamente?"
                    description="Esta ação remove o arquivo do armazenamento e não pode ser desfeita. Ficará registrada na auditoria."
                    confirmLabel="Excluir definitivamente"
                    destructive
                    onConfirm={async () => {
                      const body = new FormData();
                      body.set("attachmentId", doc.id);
                      body.set("processId", processId);
                      const state = await manualDeleteFormAction({ status: "idle" }, body);
                      if (state.status === "error") toast.error(state.message);
                      else {
                        toast.success("Documento excluído.");
                        router.refresh();
                      }
                    }}
                  />
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground italic">Nenhum artefato adicional anexado.</p>
      )}

      {canUpload ? (
        <div className="border-t border-border/50 pt-3">
          <FileUpload
            label="Anexar artefato complementar"
            onUpload={async (file, report) => {
              report(5);
              const sha256 = await sha256Hex(file);
              const prepared = await prepareDocumentUploadAction(processId, "OUTRO", {
                fileName: file.name,
                size: file.size,
                sha256,
              });
              if (!prepared.ok) return prepared;
              report(20);
              const sent = await uploadToSignedUrl(
                prepared.data.storagePath,
                prepared.data.token,
                file,
                prepared.data.mime,
              );
              if (!sent.ok) return sent;
              report(85);
              const confirmed = await confirmDocumentUploadAction(
                processId,
                prepared.data.attachmentId,
              );
              report(100);
              if (confirmed.ok) {
                toast.success(`${file.name} anexado com sucesso!`);
                router.refresh();
              }
              return confirmed;
            }}
          />
        </div>
      ) : null}
    </article>
  );
}
