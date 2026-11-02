import type { Metadata } from "next";
import { Suspense } from "react";
import { loadScreen } from "@/server/screen";
import { ok } from "@/shared/lib/result";
import { DOCUMENT_TYPES } from "@/modules/processes/domain/document-types";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader } from "@/shared/ui/page-header";
import { ProgressBar } from "@/shared/ui/progress-bar";
import { Screen } from "@/shared/ui/screen";
import { StatusBadge } from "@/shared/ui/status-badge";
import { COMPLETION_STATUS, PROCESS_STATUS, presentationOf } from "@/shared/ui/status-presentation";
import { DocumentCard } from "./document-card";

export const metadata: Metadata = { title: "Processo" };

async function ProcessContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await loadScreen(async ({ services, actor }) => {
    const view = await services.processes.get(actor, id);
    if (!view.ok) return view;
    const documents = await services.documents.listByProcess(actor, id);
    return ok({ view: view.data, documents: documents.ok ? documents.data : [], canManage: actor.isCentralAdmin || actor.memberships.some((m) => m.councilId === view.data.process.councilId && m.role !== "viewer"), canUnlink: actor.isCentralAdmin || actor.memberships.some((m) => m.councilId === view.data.process.councilId && m.role === "council_manager"), isSpecialDeleter: actor.isSpecialDeleter });
  });
  return (
    <Screen result={result}>
      {({ view, documents, canManage, canUnlink, isSpecialDeleter }) => {
        const status = presentationOf(PROCESS_STATUS, view.process.status);
        const completion = presentationOf(COMPLETION_STATUS, view.completion);
        return (
          <>
            <PageHeader title={`Processo ${view.process.number}`} description={view.process.title} actions={<><StatusBadge label={status.label} tone={status.tone} /><StatusBadge label={completion.label} tone={completion.tone} /></>} />
            <section aria-label="Progresso documental" className="mb-6 rounded-lg border p-4">
              <p className="mb-2 text-sm font-medium">Progresso documental ({view.progress.validTypes.length}/{DOCUMENT_TYPES.length} tipos)</p>
              <ProgressBar value={view.displayPercent} label="Progresso documental" />
              <p className="mt-2 text-xs text-muted-foreground">Calculado automaticamente: tipos distintos com anexo válido ÷ 7. Não é editável. A conclusão documental não encerra o processo.</p>
            </section>
            <section aria-label="Documentos obrigatórios" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {DOCUMENT_TYPES.map((type) => (
                <DocumentCard
                  key={type.code}
                  processId={view.process.id}
                  typeCode={type.code}
                  label={type.label}
                  valid={view.progress.validTypes.includes(type.code)}
                  files={documents.filter((d) => d.typeCode === type.code && d.linkStatus === "active").map((d) => ({ id: d.id, name: d.fileName }))}
                  canUpload={canManage}
                  canUnlink={canUnlink}
                  canManualDelete={isSpecialDeleter}
                />
              ))}
            </section>
          </>
        );
      }}
    </Screen>
  );
}

export default function ProcessPage({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense fallback={<LoadingState />}><ProcessContent params={params} /></Suspense>;
}
