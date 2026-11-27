"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Archive, ArrowUpRight } from "lucide-react";
import { changeProcessStatusFormAction } from "@/modules/processes/actions";
import type { ProcessStatus } from "@/modules/processes/domain/process-status";
import { ActionForm } from "@/shared/ui/forms/action-form";

export function ArchiveProcessAction({ processId, status, canArchive }: {
  processId: string;
  status: ProcessStatus;
  canArchive: boolean;
}) {
  const router = useRouter();
  if (status === "arquivado") {
    return (
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-muted/35 px-4 py-3 text-sm">
        <span className="inline-flex items-center gap-2 font-medium text-foreground"><Archive className="size-4" aria-hidden /> Licitação arquivada</span>
        <Link href="/processos/arquivados" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">Ver arquivados <ArrowUpRight className="size-4" aria-hidden /></Link>
      </div>
    );
  }
  if (!canArchive) return null;
  if (status !== "concluido" && status !== "cancelado") {
    return (
      <div className="mb-6 rounded-2xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        Para arquivar esta licitação, conclua ou cancele primeiro na aba Governança.
      </div>
    );
  }
  return (
    <section aria-label="Arquivar licitação" className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card px-4 py-4 shadow-xs sm:px-5">
      <div className="flex items-start gap-3">
        <span className="rounded-xl bg-muted p-2.5 text-primary"><Archive className="size-5" aria-hidden /></span>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Arquivar esta licitação</h2>
          <p className="mt-0.5 max-w-xl text-xs leading-relaxed text-muted-foreground">Retira da lista de processos ativos e mantém os documentos e o histórico disponíveis em Arquivados.</p>
        </div>
      </div>
      <ActionForm action={changeProcessStatusFormAction} submitLabel="Arquivar licitação"
        submitVariant="outline" submitLeading={<Archive className="size-4" aria-hidden />}
        hiddenFields={{ processId, status: "arquivado" }} formClassName="shrink-0"
        onSuccess={() => router.push("/processos/arquivados")}>
        {() => null}
      </ActionForm>
    </section>
  );
}
