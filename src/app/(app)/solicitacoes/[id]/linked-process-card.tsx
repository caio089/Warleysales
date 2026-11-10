import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { DOCUMENT_TYPES } from "@/modules/processes/domain/document-types";
import type { ProcessView } from "@/modules/processes/service";
import { ProgressBar } from "@/shared/ui/progress-bar";
import { StatusBadge } from "@/shared/ui/status-badge";
import { COMPLETION_STATUS, PROCESS_STATUS, presentationOf } from "@/shared/ui/status-presentation";
import { FolderArchive } from "lucide-react";

export interface LinkedProcessCardProps {
  processView: ProcessView;
}

export function LinkedProcessCard({ processView }: LinkedProcessCardProps) {
  const proc = processView.process;
  const procStatus = presentationOf(PROCESS_STATUS, proc.status);
  const procCompletion = presentationOf(COMPLETION_STATUS, processView.completion);
  const typesCount = proc.snapshot ? DOCUMENT_TYPES.length : processView.progress.validTypes.length;

  return (
    <section aria-label="Processo Administrativo Vinculado" className="surface-card p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <FolderArchive className="h-4 w-4 text-primary" />
            <span>Processo Administrativo Vinculado</span>
          </div>
          <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground">
            Processo {proc.number}
          </h2>
          {proc.title ? <p className="text-sm text-muted-foreground">{proc.title}</p> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge label={procStatus.label} tone={procStatus.tone} />
          <StatusBadge label={procCompletion.label} tone={procCompletion.tone} />
          <StatusBadge
            label={`${typesCount}/${DOCUMENT_TYPES.length} documentos anexados`}
            tone={processView.completion === "completa" ? "success" : "warning"}
          />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Progresso documental ({typesCount} de {DOCUMENT_TYPES.length} documentos)</span>
        </div>
        <ProgressBar value={processView.displayPercent} label="Progresso documental" />
      </div>

      <div className="mt-4 flex items-center justify-end border-t border-border/40 pt-4">
        <Link
          href={`/processos?abrir=${proc.id}`}
          className={buttonVariants({ size: "sm" })}
        >
          Anexar documentos do processo →
        </Link>
      </div>
    </section>
  );
}
