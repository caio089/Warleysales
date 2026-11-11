import type { Metadata } from "next";
import { Suspense } from "react";
import { loadLookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { ok } from "@/shared/lib/result";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { NewAtaForm } from "./new-ata-form";

export const metadata: Metadata = { title: "Nova ata" };

async function Content() {
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
          <NewAtaForm
            councils={data.lookups.councils.map((c) => ({ value: c.id, label: c.label }))}
            materials={data.lookups.materials.map((m) => ({ value: m.id, label: m.label }))}
            processes={data.processes}
          />
        </div>
      )}
    </Screen>
  );
}

export default function NewAtaPage() {
  return (<><PageHeader title="Nova ata" description="Nasce como rascunho: rascunho não consome saldo. Ative para permitir comprometimentos." /><Suspense fallback={<LoadingState />}><Content /></Suspense></>);
}
