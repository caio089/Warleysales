import type { Metadata } from "next";
import { Suspense } from "react";
import { loadLookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { ok } from "@/shared/lib/result";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { NewContractForm } from "./new-contract-form";

export const metadata: Metadata = { title: "Novo contrato" };

async function Content({ processId }: { processId?: string }) {
  const result = await loadScreen(async (ctx) => {
    const lookups = await loadLookups(ctx);
    if (!lookups.ok) return lookups;
    const processes = await ctx.services.processes.list(ctx.actor);
    if (!processes.ok) return processes;
    return ok({
      lookups: lookups.data,
      processes: processes.data.map((view) => ({
        value: view.process.id,
        label: `${view.process.number} — ${view.process.title}`,
        councilId: view.process.councilId,
      })),
    });
  });
  return (
    <Screen result={result}>
      {(data) => (
        <div className="surface-card max-w-lg p-6">
          <NewContractForm
            councils={data.lookups.councils.map((c) => ({ value: c.id, label: c.label }))}
            processes={data.processes}
            defaultProcessId={processId}
          />
        </div>
      )}
    </Screen>
  );
}

export default async function NewContractPage({ searchParams }: { searchParams: Promise<{ processId?: string }> }) {
  const { processId } = await searchParams;
  return (<><PageHeader title="Novo contrato" description="Vincule o mesmo processo da ata para os dois ficarem ligados." /><Suspense fallback={<LoadingState />}><Content processId={processId} /></Suspense></>);
}
