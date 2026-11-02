import type { Metadata } from "next";
import { Suspense } from "react";
import { loadScreen } from "@/server/screen";
import { ok } from "@/shared/lib/result";
import { KpiCard } from "@/shared/ui/kpi-card";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";

export const metadata: Metadata = { title: "Conselho" };

async function CouncilContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await loadScreen(async ({ services, actor }) => {
    const council = await services.councils.get(actor, id);
    if (!council.ok) return council;
    const processes = await services.processes.list(actor);
    const mine = processes.ok ? processes.data.filter((p) => p.process.councilId === id) : [];
    return ok({ council: council.data, processTotal: mine.length, processCompleted: mine.filter((p) => p.completion === "completa").length });
  });
  return (
    <Screen result={result}>
      {({ council, processTotal, processCompleted }) => (
        <>
          <PageHeader title={`${council.acronym} — ${council.name}`} description={council.institutionalInfo ?? undefined} />
          <div className="grid gap-4 sm:grid-cols-3">
            <KpiCard label="Processos do conselho" value={processTotal} />
            <KpiCard label="Documentação completa" value={processCompleted} />
            <KpiCard label="Situação" value={council.active ? "Ativo" : "Inativo"} />
          </div>
        </>
      )}
    </Screen>
  );
}

export default function CouncilPage({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense fallback={<LoadingState />}><CouncilContent params={params} /></Suspense>;
}
