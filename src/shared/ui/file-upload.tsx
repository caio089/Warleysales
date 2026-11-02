"use client";

import { FileUp, X } from "lucide-react";
import { useId, useRef, useState, type DragEvent } from "react";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/shared/lib/format";
import { ALLOWED_EXTENSIONS_LABEL, validateFileMeta } from "@/shared/lib/upload-rules";
import type { Result } from "@/shared/lib/result";

type ItemStatus = "uploading" | "done" | "error";

interface UploadItem {
  id: number;
  name: string;
  size: number;
  progress: number;
  status: ItemStatus;
  error?: string;
}

interface FileUploadProps {
  label: string;
  /**
   * Envia o arquivo (ex.: Server Action de 2 fases) e reporta progresso 0–100.
   * Deve retornar Result; erros viram mensagem no item.
   */
  onUpload: (file: File, reportProgress: (percent: number) => void) => Promise<Result<unknown>>;
  disabled?: boolean;
}

let itemSeq = 1;

/** Área de envio com drag & drop e alternativa por teclado (botão/Enter/Espaço). */
export function FileUpload({ label, onUpload, disabled }: FileUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [dragging, setDragging] = useState(false);

  const patch = (id: number, changes: Partial<UploadItem>) =>
    setItems((list) => list.map((i) => (i.id === id ? { ...i, ...changes } : i)));

  async function handleFile(file: File) {
    const id = itemSeq++;
    const metaError = validateFileMeta(file.name, file.size);
    setItems((list) => [...list, { id, name: file.name, size: file.size, progress: 0, status: metaError ? "error" : "uploading", error: metaError ?? undefined }]);
    if (metaError) return;
    try {
      const result = await onUpload(file, (progress) => patch(id, { progress }));
      patch(id, result.ok ? { status: "done", progress: 100 } : { status: "error", error: result.message });
    } catch {
      patch(id, { status: "error", error: "Falha inesperada no envio. Tente novamente." });
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files || disabled) return;
    Array.from(files).forEach((f) => void handleFile(f));
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    handleFiles(event.dataTransfer.files);
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn("flex flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 text-center", dragging && "border-primary bg-primary/5", disabled && "opacity-50")}
      >
        <FileUp className="size-6 text-muted-foreground" aria-hidden />
        <p className="text-sm">Arraste arquivos aqui ou</p>
        <label htmlFor={inputId} className={cn("cursor-pointer rounded-lg border bg-background px-3 py-1.5 text-sm font-medium focus-within:ring-2 focus-within:ring-ring", disabled && "pointer-events-none")}>
          {label}
          <input ref={inputRef} id={inputId} type="file" multiple disabled={disabled} className="sr-only" onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }} />
        </label>
        <p className="text-xs text-muted-foreground">Formatos: {ALLOWED_EXTENSIONS_LABEL} · até 25 MB</p>
      </div>

      {items.length > 0 ? (
        <ul className="space-y-2" aria-label="Arquivos enviados">
          {items.map((item) => (
            <li key={item.id} className="rounded-lg border p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-medium">{item.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{formatBytes(item.size)}</span>
                <button type="button" aria-label={`Remover ${item.name} da lista`} onClick={() => setItems((l) => l.filter((i) => i.id !== item.id))} className="rounded focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                  <X className="size-4" aria-hidden />
                </button>
              </div>
              {item.status === "uploading" ? (
                <progress className="mt-2 h-1.5 w-full" max={100} value={item.progress} aria-label={`Progresso do envio de ${item.name}`} />
              ) : null}
              {item.status === "done" ? <p className="mt-1 text-xs text-success-foreground">Enviado com sucesso.</p> : null}
              {item.status === "error" ? <p role="alert" className="mt-1 text-xs text-destructive">{item.error}</p> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
