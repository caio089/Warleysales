"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  type DragEvent,
  type ReactNode,
  Suspense,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  CheckCircle2,
  Circle,
  FolderArchive,
  Loader2,
  Paperclip,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { DOCUMENT_TYPES } from "@/modules/processes/domain/document-types";
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
import { fail, type Result } from "@/shared/lib/result";
import {
  type FilterDefinition,
  type QueryColumn,
  type SortDirection,
  nextSort,
  runTableQuery,
} from "@/shared/ui/data-table-logic";
import { EmptyState } from "@/shared/ui/feedback-states";
import { FileUpload } from "@/shared/ui/file-upload";
import { ProgressBar } from "@/shared/ui/progress-bar";
import { StatusBadge } from "@/shared/ui/status-badge";
import {
  COMPLETION_STATUS,
  PROCESS_STATUS,
  presentationOf,
} from "@/shared/ui/status-presentation";
import { toast } from "@/shared/ui/toast-store";
import { cn } from "@/lib/utils";

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
  const searchParams = useSearchParams();
  const searchParamId = searchParams.get("abrir");

  const [internalId, setInternalId] = useState<string | null>(
    () => propProcessId ?? searchParamId,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    process: AdministrativeProcess;
    documents: Attachment[];
    validTypes: string[];
  } | null>(null);
  const [uploadingType, setUploadingType] = useState<string | null>(null);

  // Sincroniza com parâmetro de busca quando a rota muda
  useEffect(() => {
    if (searchParamId) {
      setInternalId(searchParamId);
    } else if (!propProcessId) {
      setInternalId(null);
    }
  }, [searchParamId, propProcessId]);

  // Sincroniza com a prop externa se fornecida
  useEffect(() => {
    if (propProcessId !== undefined) {
      setInternalId(propProcessId);
    }
  }, [propProcessId]);

  // Evento customizado para abertura síncrona sem latência
  useEffect(() => {
    const handleOpen = (e: Event) => {
      const detail = (e as CustomEvent<{ processId: string }>).detail;
      if (detail?.processId) {
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
      setInternalId(params.get("abrir"));
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const activeProcessId = internalId;
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
    if (activeProcessId) {
      void loadData(activeProcessId);
    } else {
      setData(null);
      setError(null);
      setUploadingType(null);
    }
  }, [activeProcessId, loadData]);

  const handleClose = () => {
    setInternalId(null);
    setUploadingType(null);
    if (onClose) {
      onClose();
    } else if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.has("abrir")) {
        url.searchParams.delete("abrir");
        const nextUrl = url.pathname + (url.search ? url.search : "");
        window.history.replaceState(null, "", nextUrl);
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

export interface ProcessTableRow {
  id: string;
  number: string;
  title: string;
  council: string;
  status: string;
  completion: string;
  progress: number;
  href: string;
}

export interface ProcessesTableProps {
  rows: ProcessTableRow[];
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
}

/** Tabela interativa de processos com ordenação, busca, filtros e ação rápida de anexar. */
export function ProcessesTable({
  rows,
  emptyTitle = "Nenhum processo ainda",
  emptyDescription = "Crie o primeiro processo e anexe DFD, ETP, MR, TR, PP, PJ e ED — o progresso sobe sozinho.",
  emptyAction,
}: ProcessesTableProps) {
  const searchId = useId();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{ key: string | null; direction: SortDirection }>({
    key: null,
    direction: "asc",
  });
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  const queryColumns: QueryColumn<ProcessTableRow>[] = useMemo(
    () => [
      { key: "number", accessor: (r) => r.number },
      { key: "title", accessor: (r) => r.title },
      { key: "council", accessor: (r) => r.council },
      { key: "status", accessor: (r) => r.status },
      { key: "completion", accessor: (r) => r.completion },
      { key: "progress", accessor: (r) => r.progress },
    ],
    [],
  );

  const statusValues = useMemo(
    () => [...new Set(rows.map((r) => r.status))].filter(Boolean).sort(),
    [rows],
  );
  const statusOptions = useMemo(
    () =>
      statusValues.map((v) => ({
        value: v,
        label: presentationOf(PROCESS_STATUS, v).label,
      })),
    [statusValues],
  );

  const councilValues = useMemo(
    () => [...new Set(rows.map((r) => r.council))].filter(Boolean).sort(),
    [rows],
  );
  const councilOptions = useMemo(
    () => councilValues.map((c) => ({ value: c, label: c })),
    [councilValues],
  );

  const filterDefs: FilterDefinition<ProcessTableRow>[] = useMemo(
    () => [
      { id: "status", label: "Situação", options: statusOptions, accessor: (r) => r.status },
      { id: "council", label: "Conselho", options: councilOptions, accessor: (r) => r.council },
    ],
    [statusOptions, councilOptions],
  );

  const result = useMemo(
    () =>
      runTableQuery(rows, queryColumns, filterDefs, {
        search,
        sortKey: sort.key,
        sortDirection: sort.direction,
        filters: activeFilters,
        page,
        pageSize: 10,
      }),
    [rows, queryColumns, filterDefs, search, sort, activeFilters, page],
  );

  const headers: { key: string; label: string; sortable: boolean }[] = [
    { key: "number", label: "Número", sortable: true },
    { key: "title", label: "Objeto", sortable: true },
    { key: "council", label: "Conselho", sortable: true },
    { key: "status", label: "Situação", sortable: true },
    { key: "completion", label: "Documentação", sortable: true },
    { key: "progress", label: "Progresso", sortable: true },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative w-full sm:w-72">
          <label htmlFor={searchId} className="sr-only">
            Buscar na tabela
          </label>
          <Search
            className="pointer-events-none absolute top-3 left-3 size-4 text-muted-foreground"
            aria-hidden
          />
          <Input
            id={searchId}
            type="text"
            placeholder="Buscar…"
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            autoComplete="off"
          />
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-[0.7rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            Situação
          </span>
          <select
            className="h-10 min-w-40 rounded-lg border border-input bg-card px-3 text-sm font-medium text-foreground focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 focus-visible:outline-none"
            value={activeFilters["status"] ?? ""}
            onChange={(e) => {
              setActiveFilters((f) => ({ ...f, status: e.target.value }));
              setPage(1);
            }}
          >
            <option value="">Todos</option>
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[0.7rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            Conselho
          </span>
          <select
            className="h-10 min-w-40 rounded-lg border border-input bg-card px-3 text-sm font-medium text-foreground focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 focus-visible:outline-none"
            value={activeFilters["council"] ?? ""}
            onChange={(e) => {
              setActiveFilters((f) => ({ ...f, council: e.target.value }));
              setPage(1);
            }}
          >
            <option value="">Todos</option>
            {councilOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {result.total === 0 ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      ) : (
        <div className="surface-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Processos administrativos</caption>
              <thead className="sticky top-0 bg-secondary/90 text-left backdrop-blur-sm">
                <tr>
                  {headers.map((h) => {
                    const active = sort.key === h.key;
                    const ariaSort = active
                      ? sort.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : "none";
                    const Icon = !active
                      ? ArrowUpDown
                      : sort.direction === "asc"
                        ? ArrowUp
                        : ArrowDown;

                    return (
                      <th
                        key={h.key}
                        scope="col"
                        aria-sort={h.sortable ? ariaSort : undefined}
                        className="px-4 py-3.5 text-[0.7rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase"
                      >
                        {h.sortable ? (
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-md tracking-[0.12em] uppercase transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            onClick={() => {
                              setSort((s) => nextSort(s, h.key));
                              setPage(1);
                            }}
                          >
                            {h.label}
                            <Icon className="size-3.5" aria-hidden />
                          </button>
                        ) : (
                          h.label
                        )}
                      </th>
                    );
                  })}
                  <th
                    scope="col"
                    className="px-4 py-3.5 text-right text-[0.7rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase"
                  >
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => {
                  const pStatus = presentationOf(PROCESS_STATUS, row.status);
                  const pCompletion = presentationOf(COMPLETION_STATUS, row.completion);

                  return (
                    <tr
                      key={row.id}
                      onClick={() => openProcessAttachment(row.id)}
                      className="cursor-pointer border-t border-border/70 transition-colors hover:bg-primary/[0.035]"
                    >
                      <td className="px-4 py-3.5">
                        <Link
                          href={row.href}
                          onClick={(e) => e.stopPropagation()}
                          className="font-medium text-primary underline-offset-4 transition-colors hover:text-highlight hover:underline"
                        >
                          {row.number}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="line-clamp-2">{row.title}</span>
                      </td>
                      <td className="px-4 py-3.5">{row.council}</td>
                      <td className="px-4 py-3.5">
                        <StatusBadge label={pStatus.label} tone={pStatus.tone} />
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge
                          label={pCompletion.label}
                          tone={pCompletion.tone}
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <ProgressBar
                          value={row.progress}
                          label="Progresso"
                          className="min-w-32"
                        />
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="inline-flex items-center gap-1.5"
                          onClick={(e) => {
                            e.stopPropagation();
                            openProcessAttachment(row.id);
                          }}
                          title={`Anexar documentos no processo ${row.number}`}
                        >
                          <Paperclip className="size-3.5" aria-hidden />
                          <span>Anexar</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {result.total > 0 ? (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span aria-live="polite">{result.total} registro(s) no banco</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={result.page <= 1}
              onClick={() => setPage(result.page - 1)}
            >
              Anterior
            </Button>
            <span>
              Página {result.page} de {result.pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={result.page >= result.pageCount}
              onClick={() => setPage(result.page + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
