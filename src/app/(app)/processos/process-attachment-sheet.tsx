"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Download,
  FileText,
  FolderArchive,
  Loader2,
  Paperclip,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DOCUMENT_TYPE_CODES,
  DOCUMENT_TYPES,
} from "@/modules/processes/domain/document-types";
import type { AdministrativeProcess } from "@/modules/processes/schemas";
import type { Attachment } from "@/modules/documents/schemas";
import {
  confirmDocumentUploadAction,
  downloadUrlAction,
  loadProcessDocumentsAction,
  prepareDocumentUploadAction,
} from "@/modules/documents/actions";
import { sha256Hex, uploadToSignedUrl } from "@/shared/lib/browser-upload";
import { formatBytes } from "@/shared/lib/format";
import { formatDateTimeFortaleza } from "@/shared/lib/time";
import { fail, type Result } from "@/shared/lib/result";
import { FileUpload } from "@/shared/ui/file-upload";
import { ProgressBar } from "@/shared/ui/progress-bar";
import { toast } from "@/shared/ui/toast-store";
import { cn } from "@/lib/utils";

// Re-exporta a tabela de processos para retrocompatibilidade
export {
  ProcessesTable,
  type ProcessTableRow,
  type ProcessesTableProps,
} from "./processes-table";

/** Abre a gaveta lateral de anexagem para um processo administrativo específico. */
export function openProcessAttachment(processId: string) {
  if (typeof window !== "undefined") {
    const url = new URL(window.location.href);
    url.searchParams.set("abrir", processId);
    window.history.pushState(null, "", url.toString());
    window.dispatchEvent(
      new CustomEvent("process:open-attachment", { detail: { processId } }),
    );
  }
}

export interface ProcessAttachmentSheetProps {
  processId?: string | null;
  onClose?: () => void;
}

function ProcessAttachmentSheetInner({
  processId: propProcessId,
  onClose,
}: ProcessAttachmentSheetProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamId = searchParams?.get("abrir") ?? null;

  const [internalId, setInternalId] = useState<string | null>(null);
  const [dismissedId, setDismissedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    process: AdministrativeProcess;
    documents: Attachment[];
    validTypes: string[];
  } | null>(null);
  const [uploadingType, setUploadingType] = useState<string | null>(null);

  // Evento customizado para abertura síncrona sem latência
  useEffect(() => {
    const handleOpen = (e: Event) => {
      const detail = (e as CustomEvent<{ processId: string }>).detail;
      if (detail?.processId) {
        setDismissedId(null);
        setInternalId(detail.processId);
      }
    };
    window.addEventListener("process:open-attachment", handleOpen);
    return () => window.removeEventListener("process:open-attachment", handleOpen);
  }, []);

  // Histórico de navegação (voltar/avançar no navegador)
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setDismissedId(null);
      setInternalId(params.get("abrir"));
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Quando o propProcessId é alterado explicitamente, limpa o dismissedId
  useEffect(() => {
    if (propProcessId) {
      setDismissedId(null);
    }
  }, [propProcessId]);

  // Quando searchParamId é limpo pela navegação ou muda para outro id, reseta dismissedId
  useEffect(() => {
    if (!searchParamId || (dismissedId && searchParamId !== dismissedId)) {
      setDismissedId(null);
    }
  }, [searchParamId, dismissedId]);

  const candidateId =
    propProcessId !== undefined ? propProcessId : (internalId ?? searchParamId);
  const activeProcessId =
    candidateId && candidateId !== dismissedId ? candidateId : null;
  const isOpen = Boolean(activeProcessId);

  const loadData = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await loadProcessDocumentsAction(id);
      if (result.ok) {
        setData(result.data);
      } else {
        setError(result.message);
      }
    } catch {
      setError("Falha ao carregar documentos do processo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!activeProcessId) return;
    const timer = setTimeout(() => {
      void loadData(activeProcessId);
    }, 0);
    return () => clearTimeout(timer);
  }, [activeProcessId, loadData]);

  const handleClose = () => {
    const currentId = activeProcessId;
    if (currentId) {
      setDismissedId(currentId);
    }
    setInternalId(null);
    setData(null);
    setUploadingType(null);

    if (onClose) {
      onClose();
    } else {
      const currentQuery = searchParams ? searchParams.toString() : "";
      const params = new URLSearchParams(currentQuery);
      const hadSearchParam = params.has("abrir");

      if (hadSearchParam) {
        params.delete("abrir");
        const qs = params.toString();
        const base = pathname || "/processos";
        const nextUrl = qs ? `${base}?${qs}` : base;
        router.replace(nextUrl, { scroll: false });
      } else if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        if (url.searchParams.has("abrir")) {
          url.searchParams.delete("abrir");
          const nextUrl = url.pathname + (url.search ? url.search : "");
          router.replace(nextUrl, { scroll: false });
        }
      }
    }
  };

  const handleDownload = async (attachmentId: string) => {
    const res = await downloadUrlAction(attachmentId);
    if (res.ok) {
      window.open(res.data, "_blank", "noopener");
    } else {
      toast.error(res.message);
    }
  };

  const handleUpload = async (
    typeCode: string,
    file: File,
    report: (percent: number) => void,
  ): Promise<Result<unknown>> => {
    if (!activeProcessId) return fail("VALIDATION", "Processo não selecionado.");
    report(5);
    const sha256 = await sha256Hex(file);
    const prepared = await prepareDocumentUploadAction(activeProcessId, typeCode, {
      fileName: file.name,
      size: file.size,
      sha256,
    });
    if (!prepared.ok) return prepared;
    report(25);
    const sent = await uploadToSignedUrl(
      prepared.data.storagePath,
      prepared.data.token,
      file,
      prepared.data.mime,
    );
    if (!sent.ok) return sent;
    report(85);
    const confirmed = await confirmDocumentUploadAction(
      activeProcessId,
      prepared.data.attachmentId,
    );
    report(100);

    if (confirmed.ok) {
      toast.success(`${file.name} anexado com sucesso!`);
      // Atualiza o estado da gaveta
      const refreshed = await loadProcessDocumentsAction(activeProcessId);
      if (refreshed.ok) {
        setData(refreshed.data);
      }
      // Atualiza os dados de fundo da página
      router.refresh();
    }
    return confirmed;
  };

  const validCount = data
    ? data.process.snapshot
      ? DOCUMENT_TYPES.length
      : data.validTypes.length
    : 0;
  const percent = data
    ? Math.round((validCount / DOCUMENT_TYPES.length) * 100)
    : 0;
  const additionalDocs = data
    ? data.documents.filter(
        (doc) =>
          !DOCUMENT_TYPE_CODES.includes(doc.typeCode as any) &&
          doc.linkStatus === "active",
      )
    : [];

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col overflow-hidden p-0 data-[side=right]:sm:max-w-lg data-[side=right]:md:max-w-xl"
      >
        {loading && !data ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center text-muted-foreground">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm">Carregando documentos do processo...</p>
          </div>
        ) : error && !data ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <p className="text-sm font-medium text-destructive">{error}</p>
            {activeProcessId ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => void loadData(activeProcessId)}
              >
                Tentar novamente
              </Button>
            ) : null}
          </div>
        ) : data ? (
          <>
            <SheetHeader className="space-y-3 border-b border-border/70 bg-card/60 p-5">
              <div className="flex items-start justify-between gap-3 pr-8">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FolderArchive className="size-4 text-primary" />
                    <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      Anexagem Rápida
                    </span>
                  </div>
                  <SheetTitle className="font-heading text-xl font-bold tracking-tight text-foreground">
                    Processo {data.process.number}
                  </SheetTitle>
                  {data.process.title ? (
                    <SheetDescription className="line-clamp-2 text-xs text-muted-foreground">
                      {data.process.title}
                    </SheetDescription>
                  ) : null}
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Progresso documental ({validCount} de {DOCUMENT_TYPES.length} tipos)
                  </span>
                  <span className="font-medium text-foreground">{percent}%</span>
                </div>
                <ProgressBar
                  value={percent}
                  label="Progresso documental"
                  showValue={false}
                />
              </div>

              <div className="pt-1">
                <Link
                  href={`/processos/${data.process.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-primary underline-offset-4 transition-colors hover:text-highlight hover:underline"
                >
                  <span>Ver página completa do processo</span>
                  <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              </div>
            </SheetHeader>

            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              <div className="space-y-1">
                <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Os 7 documentos obrigatórios
                </h3>
                <p className="text-xs text-muted-foreground">
                  Ordem sugerida: DFD → ETP → MR → TR → PP → PJ → ED. O envio atualiza o
                  progresso automaticamente.
                </p>
              </div>

              <div className="space-y-3">
                {DOCUMENT_TYPES.map((type, index) => {
                  const activeFiles = data.documents.filter(
                    (doc) => doc.typeCode === type.code && doc.linkStatus === "active",
                  );
                  const isValid =
                    data.process.snapshot ||
                    data.validTypes.includes(type.code) ||
                    activeFiles.length > 0;

                  return (
                    <article
                      key={type.code}
                      aria-label={type.label}
                      className={cn(
                        "rounded-xl border p-4 transition-all",
                        isValid
                          ? "border-success/30 bg-success/5 dark:bg-success/10"
                          : "border-border/70 bg-card/50",
                      )}
                    >
                      <header className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-muted-foreground">
                              {index + 1}. {type.code}
                            </span>
                            <h4 className="truncate text-sm font-semibold text-foreground">
                              {type.label}
                            </h4>
                          </div>
                        </div>
                        {isValid ? (
                          <div className="flex shrink-0 items-center gap-1 text-xs font-medium text-success-foreground">
                            <CheckCircle2
                              className="size-4 text-success-foreground"
                              aria-label="Documento válido anexado"
                            />
                            <span>Anexado</span>
                          </div>
                        ) : (
                          <div className="flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground">
                            <Circle
                              className="size-4 text-muted-foreground"
                              aria-label="Documento pendente"
                            />
                            <span>Pendente</span>
                          </div>
                        )}
                      </header>

                      {activeFiles.length > 0 ? (
                        <div className="mt-3 space-y-1.5 border-t border-border/40 pt-2.5">
                          <p className="text-[0.7rem] font-semibold tracking-wider text-muted-foreground uppercase">
                            Arquivo(s) anexado(s):
                          </p>
                          <ul className="space-y-1 text-xs">
                            {activeFiles.map((file) => (
                              <li
                                key={file.id}
                                className="flex items-center justify-between gap-2"
                              >
                                <button
                                  type="button"
                                  onClick={() => void handleDownload(file.id)}
                                  className="truncate text-left text-primary underline-offset-4 hover:underline"
                                  title={`Baixar ${file.fileName}`}
                                >
                                  {file.fileName}
                                </button>
                                <span className="shrink-0 text-[0.7rem] text-muted-foreground">
                                  {formatBytes(file.size)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      <div className="mt-3">
                        {isValid ? (
                          uploadingType === type.code ? (
                            <div className="space-y-2">
                              <FileUpload
                                label="Substituir arquivo"
                                onUpload={async (file, report) => {
                                  const res = await handleUpload(type.code, file, report);
                                  if (res.ok) setUploadingType(null);
                                  return res;
                                }}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="xs"
                                onClick={() => setUploadingType(null)}
                                className="text-xs"
                              >
                                Cancelar substituição
                              </Button>
                            </div>
                          ) : (
                            <Button
                              type="button"
                              variant="outline"
                              size="xs"
                              onClick={() => setUploadingType(type.code)}
                              className="text-xs"
                            >
                              Substituir arquivo
                            </Button>
                          )
                        ) : (
                          <FileUpload
                            label="Selecionar arquivo"
                            onUpload={async (file, report) => {
                              return handleUpload(type.code, file, report);
                            }}
                          />
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="space-y-3 border-t border-border/70 pt-5">
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Paperclip className="size-4 text-primary" />
                      <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        Artefatos Adicionais & Complementares
                      </h3>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                      Documentos adicionais anexados: {additionalDocs.length}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Anexe documentos complementares, laudos ou minutas. Não afetam a régua dos 7 documentos obrigatórios.
                  </p>
                </div>

                <div className="rounded-xl border border-dashed border-border/80 bg-card/40 p-3.5 space-y-2">
                  <FileUpload
                    label="Anexar artefato complementar"
                    onUpload={async (file, report) => {
                      return handleUpload("OUTRO", file, report);
                    }}
                  />
                </div>

                {additionalDocs.length > 0 ? (
                  <div className="space-y-2">
                    <ul className="space-y-2 text-xs">
                      {additionalDocs.map((file) => (
                        <li
                          key={file.id}
                          className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-card/60 p-2.5 transition-colors hover:bg-card"
                        >
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <FileText className="size-3.5 shrink-0 text-muted-foreground" />
                              <button
                                type="button"
                                onClick={() => void handleDownload(file.id)}
                                className="truncate text-left font-medium text-primary underline-offset-4 hover:underline"
                                title={`Baixar ${file.fileName}`}
                              >
                                {file.fileName}
                              </button>
                            </div>
                            <div className="flex items-center gap-2 text-[0.7rem] text-muted-foreground">
                              <span>{formatBytes(file.size)}</span>
                              <span>•</span>
                              <span>Enviado em {formatDateTimeFortaleza(file.createdAt)}</span>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            onClick={() => void handleDownload(file.id)}
                            className="shrink-0 h-7 text-xs text-primary"
                          >
                            <Download className="mr-1 size-3.5" />
                            Baixar
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    Nenhum artefato adicional anexado até o momento.
                  </p>
                )}
              </div>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

/** Painel lateral (Sheet) de anexagem rápida de processos administrativos. */
export function ProcessAttachmentSheet(props: ProcessAttachmentSheetProps) {
  return (
    <Suspense fallback={null}>
      <ProcessAttachmentSheetInner {...props} />
    </Suspense>
  );
}
