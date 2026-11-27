"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, CalendarClock, Download, FileText, Loader2, Plus, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { savePublicSessionDateFormAction } from "@/modules/processes/actions";
import {
  confirmDocumentUploadAction,
  downloadUrlAction,
  prepareDocumentUploadAction,
} from "@/modules/documents/actions";
import { ArchiveDocumentButton } from "../archive-document-button";
import type { ProcessAttachment } from "@/modules/processes/domain/progress";
import type { AdministrativeProcess } from "@/modules/processes/schemas";
import {
  PROCESS_CONTRACTING_MODES,
  type ProcessContractingMode,
} from "@/modules/processes/contracting-mode";
import { saveProcessContractingMode } from "@/modules/processes/contracting-mode-action";
import type { PriceResearchItemInput, PriceResearchLine } from "@/modules/processes/price-research";
import { saveProcessValidityStartDate } from "@/modules/processes/validity-start-action";
import { sha256Hex, uploadToSignedUrl } from "@/shared/lib/browser-upload";
import { formatBytes, formatCurrency } from "@/shared/lib/format";
import { CurrencyField } from "@/shared/ui/forms/fields";
import { formatDateOnly, formatDateTimeFortaleza } from "@/shared/lib/time";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { toast } from "@/shared/ui/toast-store";
import { AtaValidityField } from "@/app/(app)/atas/nova/ata-validity-field";
import { CompactDocumentRow } from "../compact-document-row";
import { PriceResearchForm, PriceResearchSummary } from "../price-research-form";
import { documentPlacementDates } from "../process-history";
import { cn } from "@/lib/utils";
import { saveProcessEstimatedValue } from "@/modules/processes/estimated-value-action";

/** Os 7 documentos obrigatórios na ordem legal da Lei 14.133 / PNCP. */
export const MANDATORY_DOCUMENTS = [
  { code: "DFD", label: "Documento de Formalização da Demanda" },
  { code: "ETP", label: "Estudo Técnico Preliminar" },
  { code: "MR", label: "Matriz de Riscos" },
  { code: "TR", label: "Termo de Referência" },
  { code: "PP", label: "Pesquisa de Preços" },
  { code: "PJ", label: "Parecer Jurídico / Técnico" },
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
  publicSessionDate?: string | null;
  canEditPublicSessionDate?: boolean;
  estimatedValue?: number | null;
  canEditEstimatedValue?: boolean;
  priceResearchItems?: PriceResearchItemInput[];
  priceResearchLines?: PriceResearchLine[] | null;
  /** Vigência informada no TR (AAAA-MM-DD). */
  validityStartDate?: string | null;
  canEditValidityStart?: boolean;
  contractingMode?: ProcessContractingMode | null;
  canEditContractingMode?: boolean;
  documentExceptions?: AdministrativeProcess["documentExceptions"];
  validTypes: string[];
  documents: (ProcessAttachment | DocumentationTabDocument)[];
  canManage: boolean;
  canUnlink: boolean;
}

function isActiveDoc(doc: DocumentationTabDocument | ProcessAttachment) {
  const isActive = !("linkStatus" in doc) || doc.linkStatus === "active";
  const notDisposed = !("retentionState" in doc) || doc.retentionState !== "disposed";
  return isActive && notDisposed;
}

function isArchivedDoc(doc: DocumentationTabDocument | ProcessAttachment) {
  return (
    "linkStatus" in doc &&
    doc.linkStatus === "archived" &&
    (!("retentionState" in doc) || doc.retentionState !== "disposed")
  );
}

/** Aba 1 — Pasta Documental: 7 obrigatórios compactos + complementares + arquivados. */
export function DocumentationTab({
  processId,
  publicSessionDate,
  canEditPublicSessionDate,
  estimatedValue,
  canEditEstimatedValue,
  priceResearchItems = [],
  priceResearchLines = null,
  validityStartDate,
  canEditValidityStart,
  contractingMode = null,
  canEditContractingMode,
  documentExceptions,
  validTypes,
  documents,
  canManage,
  canUnlink,
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
    return !isMandatory && isActiveDoc(doc);
  });

  const archivedDocs = documents.filter(isArchivedDoc);
  const placementDates = documentPlacementDates(
    documents.map((doc) => {
      const anyDoc = doc as DocumentationTabDocument;
      return {
        id: anyDoc.id,
        typeCode: doc.typeCode,
        fileName: anyDoc.fileName ?? anyDoc.name,
        createdAt: anyDoc.createdAt ? String(anyDoc.createdAt) : null,
        linkStatus: anyDoc.linkStatus,
      };
    }),
  );

  return (
    <div className="space-y-6">
      <section
        aria-label="Modo de contratação"
        className="surface-card space-y-4 p-5 sm:p-6"
      >
        <header className="flex items-start gap-3 border-b border-border/60 pb-3">
          <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <ScrollText className="size-5" aria-hidden />
          </span>
          <div>
            <h2 className="font-heading text-base font-semibold text-foreground sm:text-lg">
              É registro de preços?
            </h2>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Isso define o que aparece em Atas e contratos: com ata (registro de preços) ou só contrato.
            </p>
          </div>
        </header>

        {canEditContractingMode ? (
          <ActionForm
            action={saveProcessContractingMode}
            submitLabel="Salvar resposta"
            hiddenFields={{ processId }}
            resetOnSuccess={false}
            submitVariant="outline"
          >
            {(errors) => (
              <fieldset className="space-y-3">
                <legend className="sr-only">Modo de contratação</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {PROCESS_CONTRACTING_MODES.map((mode) => {
                    const selected = contractingMode === mode.value;
                    return (
                      <label
                        key={mode.value}
                        className={cn(
                          "flex cursor-pointer flex-col gap-1 rounded-xl border px-3.5 py-3 transition-colors",
                          selected
                            ? "border-primary bg-primary/5"
                            : "border-border/70 bg-muted/10 hover:border-primary/40",
                        )}
                      >
                        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <input
                            type="radio"
                            name="contractingMode"
                            value={mode.value}
                            defaultChecked={selected}
                            required
                            className="size-4 accent-primary"
                          />
                          {mode.label}
                        </span>
                        <span className="pl-6 text-xs text-muted-foreground">{mode.description}</span>
                      </label>
                    );
                  })}
                </div>
                {errors.contractingMode ? (
                  <p className="text-xs text-destructive" role="alert">
                    {errors.contractingMode.join(" ")}
                  </p>
                ) : null}
              </fieldset>
            )}
          </ActionForm>
        ) : (
          <p className="text-sm text-foreground">
            {contractingMode === "registro_precos"
              ? "Sim — registro de preços (ata + contrato)."
              : contractingMode === "contrato"
                ? "Não — somente contrato."
                : "Ainda não definido."}
          </p>
        )}
      </section>

      <section
        aria-label="Registro de datas dos documentos"
        className="surface-card space-y-4 p-5 sm:p-6"
      >
        <header className="flex items-start gap-3 border-b border-border/60 pb-3">
          <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <CalendarClock className="size-5" aria-hidden />
          </span>
          <div>
            <h2 className="font-heading text-base font-semibold text-foreground sm:text-lg">
              Registro: quando cada documento foi colocado
            </h2>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Data e horário em que DFD, ETP, MR, TR, PP, PJ, ED e complementares entraram na pasta.
            </p>
          </div>
        </header>
        {placementDates.length > 0 ? (
          <ul className="space-y-2" aria-label="Datas de colocação dos documentos">
            {placementDates.map((row) => (
              <li
                key={row.typeCode}
                className="flex flex-col gap-1 rounded-xl border border-border/70 bg-muted/15 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {row.typeCode} · {row.label}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{row.fileName}</p>
                </div>
                <time
                  dateTime={row.placedAt}
                  className="shrink-0 text-xs font-medium tabular-nums text-primary sm:text-sm"
                >
                  {formatDateTimeFortaleza(row.placedAt)}
                </time>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            Ainda não há documentos colocados neste processo.
          </p>
        )}
      </section>

      <section
        aria-label="Documentos Obrigatórios (Lei 14.133 / PNCP)"
        className="surface-card space-y-4 p-5 sm:p-6"
      >
        <header className="border-b border-border/60 pb-3">
          <h2 className="font-heading text-base font-semibold text-foreground sm:text-lg">
            Documentos Obrigatórios (Lei 14.133 / PNCP)
          </h2>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Cada etapa aceita mais de um arquivo. Um arquivo válido de cada tipo já conta para a conformidade.
          </p>
        </header>

        <div className="space-y-2.5">
          {MANDATORY_DOCUMENTS.map((doc, index) => {
            const filesForType = documents
              .filter((d) => d.typeCode === doc.code && isActiveDoc(d))
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
                exception={documentExceptions?.[doc.code]}
                files={filesForType}
                canUpload={canManage}
                canUnlink={canUnlink}
              >
                {doc.code === "TR" && validityStartDate !== undefined ? (
                  <div className="mt-3 border-t pt-3">
                    {canEditValidityStart ? (
                      <ActionForm
                        action={saveProcessValidityStartDate}
                        submitLabel="Salvar vigência"
                        hiddenFields={{ processId }}
                        resetOnSuccess={false}
                        submitVariant="outline"
                      >
                        {(errors) => (
                          <AtaValidityField
                            key={validityStartDate ?? "empty"}
                            defaultStartDate={validityStartDate ?? undefined}
                            errors={errors.startDate}
                            label="Vigência no Termo de Referência"
                            hint="Já vem no padrão de 1 ano. Salve para a ata e o contrato usarem a mesma vigência."
                          />
                        )}
                      </ActionForm>
                    ) : (
                      <p className="text-sm">
                        Vigência no TR:{" "}
                        {validityStartDate == null ? "A definir" : formatDateOnly(validityStartDate)}
                      </p>
                    )}
                  </div>
                ) : null}
                {doc.code === "PP" && estimatedValue !== undefined ? (
                  <div className="mt-3 border-t pt-3">
                    {priceResearchItems.length > 0 ? (
                      canEditEstimatedValue ? (
                        <PriceResearchForm
                          processId={processId}
                          items={priceResearchItems}
                          savedLines={priceResearchLines}
                          estimatedValue={estimatedValue}
                        />
                      ) : (
                        <PriceResearchSummary
                          items={priceResearchItems}
                          savedLines={priceResearchLines}
                          estimatedValue={estimatedValue}
                        />
                      )
                    ) : canEditEstimatedValue ? (
                      <ActionForm action={saveProcessEstimatedValue} submitLabel="Salvar valor"
                        hiddenFields={{ processId }} resetOnSuccess={false} submitVariant="outline">
                        {() => <CurrencyField key={estimatedValue} name="estimatedValue" label="Valor estimado (R$)"
                          required defaultValue={estimatedValue?.toFixed(2)} />}
                      </ActionForm>
                    ) : (
                      <p className="text-sm">Valor estimado: {estimatedValue == null ? "A definir" : formatCurrency(estimatedValue)}</p>
                    )}
                  </div>
                ) : null}
              </CompactDocumentRow>
            );
          })}
        </div>
        <section className="space-y-2 border-t border-border/60 pt-4" aria-labelledby="public-session-date">
          <h3 id="public-session-date" className="text-sm font-medium">Data da sessão pública</h3>
          <p className="text-sm">
            {publicSessionDate ? (
              <time dateTime={publicSessionDate}>{formatDateOnly(publicSessionDate)}</time>
            ) : "Não informada"}
          </p>
          {canEditPublicSessionDate && (
            <ActionForm key={publicSessionDate ?? ""} action={savePublicSessionDateFormAction} submitLabel="Salvar data">
              {() => <>
                <input type="hidden" name="processId" value={processId} />
                <Input type="date" name="publicSessionDate" aria-labelledby="public-session-date" defaultValue={publicSessionDate ?? ""} />
              </>}
            </ActionForm>
          )}
        </section>
      </section>

      <section
        aria-label="Artefatos Adicionais & Complementares"
        className="surface-card space-y-4 p-5 sm:p-6"
      >
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
                      className="h-8 px-2.5 text-xs font-medium"
                    >
                      <Download className="mr-1 size-3.5" aria-hidden="true" />
                      Baixar
                    </Button>
                    {canUnlink ? (
                      <ArchiveDocumentButton
                        attachmentId={docId}
                        processId={processId}
                        size="sm"
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

      <section
        id="arquivados"
        aria-label="Arquivados"
        className="surface-card space-y-4 p-5 sm:p-6"
      >
        <header className="border-b border-border/60 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <Archive className="size-4 text-muted-foreground" aria-hidden />
            <h2 className="font-heading text-base font-semibold text-foreground sm:text-lg">
              Arquivados
            </h2>
            <span className="inline-flex shrink-0 items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
              {archivedDocs.length}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Documentos arquivados saem da pasta ativa, mas permanecem disponíveis para consulta.
          </p>
        </header>

        {archivedDocs.length > 0 ? (
          <ul className="space-y-2 text-sm" aria-label="Lista de documentos arquivados">
            {archivedDocs.map((doc) => {
              const anyDoc = doc as DocumentationTabDocument;
              const docId = anyDoc.id ?? `archived-${doc.typeCode}`;
              const docName = anyDoc.fileName ?? anyDoc.name ?? `${doc.typeCode}.pdf`;
              const typeLabel =
                MANDATORY_DOCUMENTS.find((item) => item.code === doc.typeCode)?.label ??
                (doc.typeCode === "OUTRO" ? "Complementar" : doc.typeCode);

              return (
                <li
                  key={docId}
                  className="flex flex-col gap-2 rounded-lg border border-dashed border-border/70 bg-muted/10 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="truncate text-sm font-medium text-foreground">{docName}</p>
                    <p className="text-xs text-muted-foreground">
                      {typeLabel}
                      {anyDoc.createdAt ? ` · ${formatDateTimeFortaleza(anyDoc.createdAt)}` : null}
                    </p>
                  </div>
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
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground italic">Nenhum documento arquivado neste processo.</p>
        )}
      </section>
    </div>
  );
}
