import type { Metadata } from "next";
import { Suspense } from "react";
import { Archive } from "lucide-react";
import { loadScreen } from "@/server/screen";
import { ok } from "@/shared/lib/result";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { KpiCard } from "@/shared/ui/kpi-card";
import { ProcessesTable } from "../processes-table";

export const metadata: Metadata = { title: "Licitações arquivadas" };

async function Content() {
  const result = await loadScreen(async ({ services, actor }) => {
    const [processes, councils] = await Promise.all([
      services.processes.list(actor),
      services.councils.list(actor),
    ]);
    if (!processes.ok) return processes;
    if (!councils.ok) return councils;
    const councilLabel = Object.fromEntries(councils.data.map((council) => [council.id, council.acronym]));
    return ok(processes.data
      .filter(({ process }) => process.status === "arquivado")
      .map(({ process, completion, displayPercent }) => ({
        id: process.id,
        number: process.number,
        title: process.title,
        council: councilLabel[process.councilId] ?? "—",
        status: "arquivado",
        completion,
        progress: displayPercent,
        createdAt: process.createdAt.toISOString(),
        href: `/solicitacoes/processos/${process.id}`,
      })));
  });
  return (
    <Screen result={result}>
      {(rows) => (
        <>
          <PageHeader eyebrow="Arquivo de licitações" title="Arquivados"
            description="Consulte as licitações encerradas sem perder documentos, contratos e histórico."
            backHref="/processos" backLabel="Voltar aos processos" />
          <div className="mb-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
            <KpiCard icon={<Archive className="size-4" aria-hidden />} label="Licitações arquivadas" value={rows.length} />
            <div className="flex items-center rounded-2xl border border-border bg-muted/30 px-5 py-4 text-sm text-muted-foreground">
              Os processos permanecem disponíveis para consulta e auditoria.
            </div>
          </div>
          <ProcessesTable rows={rows} emptyTitle="Nenhuma licitação arquivada"
            emptyDescription="Quando você arquivar uma licitação, ela aparecerá aqui para consulta." />
        </>
      )}
    </Screen>
  );
}

export default function ArchivedProcessesPage() {
  return <Suspense fallback={<LoadingState />}><Content /></Suspense>;
}
