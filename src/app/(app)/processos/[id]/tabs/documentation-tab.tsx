"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, FileText, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  confirmDocumentUploadAction,
  downloadUrlAction,
  manualDeleteFormAction,
  prepareDocumentUploadAction,
  unlinkDocumentFormAction,
} from "@/modules/documents/actions";
import type { ProcessAttachment } from "@/modules/processes/domain/progress";
import { sha256Hex, uploadToSignedUrl } from "@/shared/lib/browser-upload";
import { formatBytes } from "@/shared/lib/format";
import { formatDateTimeFortaleza } from "@/shared/lib/time";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { toast } from "@/shared/ui/toast-store";
import { CompactDocumentRow } from "../compact-document-row";

/** Os 7 documentos obrigatórios na ordem legal da Lei 14.133 / PNCP. */
export const MANDATORY_DOCUMENTS = [
  { code: "DFD", label: "Documento de Formalização da Demanda" },
  { code: "ETP", label: "Estudo Técnico Preliminar" },
  { code: "MR", label: "Matriz de Riscos" },
  { code: "TR", label: "Termo de Referência" },
  { code: "PP", label: "Pesquisa de Preços" },
  { code: "PJ", label: "Parecer Jurídico" },
  { code: "ED", label: "Edital de Licitação / Aviso" },
] as const;

export const MANDATORY_DOCUMENT_CODES = MANDATORY_DOCUMENTS.map((d) => d.code);

export interface DocumentationTabDocument {
  id?: string;
  typeCode: string;
  fileName?: string;
  name?: string;
  size?: number | null;
  createdAt?: Date | string | null;
  linkStatus?: ProcessAttachment["linkStatus"];
  uploadStatus?: ProcessAttachment["uploadStatus"];
  retentionState?: ProcessAttachment["retentionState"];
}

export interface DocumentationTabProps {
  processId: string;
  validTypes: string[];
  documents: (ProcessAttachment | DocumentationTabDocument)[];
  canManage: boolean;
  canUnlink: boolean;
  isSpecialDeleter: boolean;
}

/** Aba 1 — Pasta Documental: 7 obrigatórios compactos + artefatos adicionais. */
export function DocumentationTab({
  processId,
  validTypes,
  documents,
  canManage,
  canUnlink,
  isSpecialDeleter,
}: DocumentationTabProps) {
  const router = useRouter();
  const additionalFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAdditional, setUploadingAdditional] = useState(false);

  async function handleDownload(attachmentId: string) {
    const result = await downloadUrlAction(attachmentId);
    if (result.ok) {
      window.open(result.data, "_blank", "noopener");
    } else {
      toast.error(result.message);
    }
  }

  function handleUploadAdditionalTrigger() {
    additionalFileInputRef.current?.click();
  }

  async function handleAdditionalFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAdditional(true);
    try {
      const sha256 = await sha256Hex(file);
      const prepared = await prepareDocumentUploadAction(processId, "OUTRO", {
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
      setUploadingAdditional(false);
      if (e.target) e.target.value = "";
    }
  }

  const additionalDocs = documents.filter((doc) => {
    const isMandatory = MANDATORY_DOCUMENT_CODES.includes(doc.typeCode as (typeof MANDATORY_DOCUMENTS)[number]["code"]);
    const isActive = !("linkStatus" in doc) || doc.linkStatus === "active";
    const notDisposed = !("retentionState" in doc) || doc.retentionState !== "disposed";
    return !isMandatory && isActive && notDisposed;
  });

  return (
    <div className="space-y-6">
      {/* Seção 1: Documentos Obrigatórios (Lei 14.133 / PNCP) */}
      <section
        aria-label="Documentos Obrigatórios (Lei 14.133 / PNCP)"
        className="surface-card space-y-4 p-5 sm:p-6"
      >
        <header className="border-b border-border/60 pb-3">
          <h2 className="font-heading text-base font-semibold text-foreground sm:text-lg">
            Documentos Obrigatórios (Lei 14.133 / PNCP)
          </h2>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Itens necessários para alcançar 100% de conformidade e habilitar a contratação.
          </p>
        </header>

        <div className="space-y-2.5">
          {MANDATORY_DOCUMENTS.map((doc, index) => {
            const filesForType = documents
              .filter((d) => {
                const isSameType = d.typeCode === doc.code;
                const isActive = !("linkStatus" in d) || d.linkStatus === "active";
                const notDisposed = !("retentionState" in d) || d.retentionState !== "disposed";
                return isSameType && isActive && notDisposed;
              })
              .map((d) => {
                const anyDoc = d as DocumentationTabDocument;
                return {
                  id: anyDoc.id ?? `doc-${d.typeCode}`,
                  name: anyDoc.fileName ?? anyDoc.name ?? `${doc.code}.pdf`,
                  size: anyDoc.size ?? null,
                  createdAt: anyDoc.createdAt ?? null,
                };
              });

            return (
              <CompactDocumentRow
                key={doc.code}
                processId={processId}
                typeCode={doc.code}
                label={`${index + 1}. ${doc.label}`}
                valid={validTypes.includes(doc.code)}
                files={filesForType}
                canUpload={canManage}
                canUnlink={canUnlink}
                canManualDelete={isSpecialDeleter}
              />
            );
          })}
        </div>
      </section>

      {/* Seção 2: Artefatos Adicionais & Complementares */}
      <section
        aria-label="Artefatos Adicionais & Complementares"
        className="surface-card space-y-4 p-5 sm:p-6"
      >
        {/* Input oculto para upload de arquivo complementar */}
        <input
          ref={additionalFileInputRef}
          type="file"
          className="sr-only"
          onChange={handleAdditionalFileSelected}
          aria-hidden="true"
          tabIndex={-1}
        />

        <header className="flex flex-col gap-3 border-b border-border/60 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-muted px-1.5 py-0.5 text-[0.68rem] font-semibold tracking-wider text-muted-foreground uppercase">
                OUTRO
              </span>
              <h2 className="font-heading text-base font-semibold text-foreground sm:text-lg">
                Artefatos Adicionais & Complementares
              </h2>
              <span className="inline-flex shrink-0 items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                {additionalDocs.length} {additionalDocs.length === 1 ? "documento" : "documentos"}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Documentos complementares, minutas ou laudos que não alteram a régua dos 7 obrigatórios.
            </p>
          </div>

          {canManage ? (
            <div className="shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleUploadAdditionalTrigger}
                disabled={uploadingAdditional}
                className="h-8 text-xs font-medium"
              >
                {uploadingAdditional ? (
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <Plus className="mr-1.5 size-3.5" aria-hidden="true" />
                )}
                {uploadingAdditional ? "Enviando..." : "+ Adicionar anexo complementar"}
              </Button>
            </div>
          ) : null}
        </header>

        {additionalDocs.length > 0 ? (
          <ul className="space-y-2 text-sm" aria-label="Lista de artefatos adicionais">
            {additionalDocs.map((doc) => {
              const anyDoc = doc as DocumentationTabDocument;
              const docId = anyDoc.id ?? "doc-outro";
              const docName = anyDoc.fileName ?? anyDoc.name ?? "documento_complementar.pdf";
              const docSize = anyDoc.size;
              const docCreatedAt = anyDoc.createdAt;

              return (
                <li
                  key={docId}
                  className="flex flex-col gap-2 rounded-lg border border-border/60 bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <button
                        type="button"
                        onClick={() => handleDownload(docId)}
                        className="truncate text-left font-medium text-primary underline-offset-4 hover:underline"
                        title={`Baixar ${docName}`}
                      >
                        {docName}
                      </button>
                    </div>
                    {(docSize != null || docCreatedAt) && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {docSize != null && <span>{formatBytes(docSize)}</span>}
                        {docSize != null && docCreatedAt && <span>•</span>}
                        {docCreatedAt && (
                          <span>Enviado em {formatDateTimeFortaleza(docCreatedAt)}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() => handleDownload(docId)}
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
                        hiddenFields={{ attachmentId: docId, processId }}
                      >
                        {() => null}
                      </ActionForm>
                    ) : null}
                    {isSpecialDeleter ? (
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
                          body.set("attachmentId", docId);
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
              );
            })}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            Nenhum artefato adicional ou complementar anexado.
          </p>
        )}
      </section>
    </div>
  );
}
