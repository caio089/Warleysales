"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, Download, FileText, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  confirmDocumentUploadAction,
  downloadUrlAction,
  manualDeleteFormAction,
  prepareDocumentUploadAction,
  unlinkDocumentFormAction,
} from "@/modules/documents/actions";
import { sha256Hex, uploadToSignedUrl } from "@/shared/lib/browser-upload";
import { formatBytes } from "@/shared/lib/format";
import { formatDateTimeFortaleza } from "@/shared/lib/time";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { toast } from "@/shared/ui/toast-store";

export interface CompactDocumentFile {
  id: string;
  name: string;
  size?: number | null;
  createdAt?: string | Date | null;
}

export interface CompactDocumentRowProps {
  processId: string;
  typeCode: string;
  label: string;
  valid: boolean;
  files: CompactDocumentFile[];
  canUpload: boolean;
  canUnlink: boolean;
  canManualDelete: boolean;
  onUploadClick?: () => void;
}

/** Linha compacta e moderna para exibição e gestão de um tipo documental do processo. */
export function CompactDocumentRow({
  processId,
  typeCode,
  label,
  valid,
  files,
  canUpload,
  canUnlink,
  canManualDelete,
  onUploadClick,
}: CompactDocumentRowProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleDownload(attachmentId: string) {
    const result = await downloadUrlAction(attachmentId);
    if (result.ok) {
      window.open(result.data, "_blank", "noopener");
    } else {
      toast.error(result.message);
    }
  }

  function handleUploadTrigger() {
    if (onUploadClick) {
      onUploadClick();
    } else {
      fileInputRef.current?.click();
    }
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const sha256 = await sha256Hex(file);
      const prepared = await prepareDocumentUploadAction(processId, typeCode, {
        fileName: file.name,
        size: file.size,
        sha256,
      });
      if (!prepared.ok) {
        toast.error(prepared.message);
        return;
      }
      const sent = await uploadToSignedUrl(
        prepared.data.storagePath,
        prepared.data.token,
        file,
        prepared.data.mime,
      );
      if (!sent.ok) {
        toast.error(sent.message);
        return;
      }
      const confirmed = await confirmDocumentUploadAction(processId, prepared.data.attachmentId);
      if (confirmed.ok) {
        toast.success(`${file.name} anexado com sucesso!`);
        router.refresh();
      } else {
        toast.error(confirmed.message);
      }
    } catch {
      toast.error("Falha ao enviar arquivo. Tente novamente.");
    } finally {
      setUploading(false);
      if (e.target) e.target.value = "";
    }
  }

  const hasFiles = files.length > 0;
  const isPending = !valid && !hasFiles;

  return (
    <article
      className="surface-card flex flex-col justify-between gap-3 rounded-xl border border-border/80 p-3.5 transition-colors sm:p-4 md:flex-row md:items-center"
      aria-label={label}
    >
      {/* Input oculto de upload quando onUploadClick não for fornecido */}
      <input
        ref={fileInputRef}
        type="file"
        className="sr-only"
        onChange={handleFileSelected}
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Lado Esquerdo: Identificação do documento, status e metadados de arquivos */}
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {/* Indicador de Status Visual */}
        {valid ? (
          <span
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            aria-label="Documento válido anexado"
          >
            <CheckCircle2 className="size-4" aria-hidden="true" />
          </span>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[0.68rem] font-semibold tracking-wide text-amber-700 uppercase dark:text-amber-400">
            <Clock className="size-3 shrink-0" aria-hidden="true" />
            Pendente
          </span>
        )}

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-muted px-1.5 py-0.5 text-[0.68rem] font-semibold tracking-wider text-muted-foreground uppercase">
              {typeCode}
            </span>
            <h3 className="text-sm font-semibold text-foreground">{label}</h3>
          </div>

          {/* Mensagem quando não há nenhum arquivo anexado */}
          {isPending ? (
            <p className="text-xs text-muted-foreground">
              Nenhum arquivo anexado para esta etapa legal.
            </p>
          ) : null}

          {/* Listagem de arquivos anexados quando files.length === 1 */}
          {files.length === 1 ? (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-0.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                <FileText className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <button
                  type="button"
                  onClick={() => handleDownload(files[0].id)}
                  className="truncate text-left text-primary underline-offset-4 hover:underline"
                  title={`Baixar ${files[0].name}`}
                >
                  {files[0].name}
                </button>
              </div>
              {(files[0].size != null || files[0].createdAt) && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  {files[0].size != null && <span>•</span>}
                  {files[0].size != null && <span>{formatBytes(files[0].size)}</span>}
                  {files[0].createdAt && <span>•</span>}
                  {files[0].createdAt && (
                    <span>Enviado em {formatDateTimeFortaleza(files[0].createdAt)}</span>
                  )}
                </div>
              )}
            </div>
          ) : null}

          {/* Listagem de arquivos quando houver múltiplos arquivos (files.length > 1) */}
          {files.length > 1 ? (
            <ul className="mt-2 space-y-2 border-t border-border/40 pt-2 text-xs">
              {files.map((file) => (
                <li
                  key={file.id}
                  className="flex flex-col gap-1.5 rounded-lg bg-muted/30 p-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                      <FileText className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <button
                        type="button"
                        onClick={() => handleDownload(file.id)}
                        className="truncate text-left text-primary underline-offset-4 hover:underline"
                        title={`Baixar ${file.name}`}
                      >
                        {file.name}
                      </button>
                    </div>
                    {(file.size != null || file.createdAt) && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        {file.size != null && <span>{formatBytes(file.size)}</span>}
                        {file.size != null && file.createdAt && <span>•</span>}
                        {file.createdAt && (
                          <span>Enviado em {formatDateTimeFortaleza(file.createdAt)}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() => handleDownload(file.id)}
                      className="h-7 px-2 text-xs font-medium"
                    >
                      <Download className="mr-1 size-3" aria-hidden="true" />
                      Baixar
                    </Button>
                    {canUnlink ? (
                      <ActionForm
                        action={unlinkDocumentFormAction}
                        submitLabel="Desvincular"
                        submitVariant="outline"
                        submitClassName="h-7 px-2 text-xs font-medium min-w-0"
                        hiddenFields={{ attachmentId: file.id, processId }}
                      >
                        {() => null}
                      </ActionForm>
                    ) : null}
                    {canManualDelete ? (
                      <ConfirmDialog
                        trigger={
                          <Button variant="destructive" size="xs" className="h-7 px-2 text-xs font-medium">
                            Excluir
                          </Button>
                        }
                        title="Excluir definitivamente?"
                        description="Esta ação remove o arquivo do armazenamento e não pode ser desfeita. Ficará registrada na auditoria."
                        confirmLabel="Excluir definitivamente"
                        destructive
                        onConfirm={async () => {
                          const body = new FormData();
                          body.set("attachmentId", file.id);
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
          ) : null}
        </div>
      </div>

      {/* Lado Direito: Ações quando houver 1 arquivo ou quando estiver pendente */}
      {files.length === 1 ? (
        <div className="flex shrink-0 items-center gap-1.5 md:self-center">
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => handleDownload(files[0].id)}
            className="h-8 px-2.5 text-xs font-medium"
          >
            <Download className="mr-1 size-3.5" aria-hidden="true" />
            Baixar
          </Button>
          {canUnlink ? (
            <ActionForm
              action={unlinkDocumentFormAction}
              submitLabel="Desvincular"
              submitVariant="outline"
              submitClassName="h-8 px-2.5 text-xs font-medium min-w-0"
              hiddenFields={{ attachmentId: files[0].id, processId }}
            >
              {() => null}
            </ActionForm>
          ) : null}
          {canManualDelete ? (
            <ConfirmDialog
              trigger={
                <Button variant="destructive" size="xs" className="h-8 px-2.5 text-xs font-medium">
                  Excluir
                </Button>
              }
              title="Excluir definitivamente?"
              description="Esta ação remove o arquivo do armazenamento e não pode ser desfeita. Ficará registrada na auditoria."
              confirmLabel="Excluir definitivamente"
              destructive
              onConfirm={async () => {
                const body = new FormData();
                body.set("attachmentId", files[0].id);
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
      ) : null}

      {/* Botão + Anexar arquivo quando pendente */}
      {isPending && canUpload ? (
        <div className="flex shrink-0 items-center gap-1.5 md:self-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUploadTrigger}
            disabled={uploading}
            className="h-8 text-xs font-medium"
          >
            {uploading ? (
              <Loader2 className="mr-1.5 size-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Plus className="mr-1.5 size-3.5" aria-hidden="true" />
            )}
            {uploading ? "Enviando..." : "+ Anexar arquivo"}
          </Button>
        </div>
      ) : null}
    </article>
  );
}
