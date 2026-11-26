import type { Metadata } from "next";
import { Suspense } from "react";
import { loadLookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { NewProcessForm } from "@/app/(app)/processos/novo/new-process-form";

export const metadata: Metadata = { title: "Novo processo" };

async function Content() {
  const result = await loadScreen(async (context) => {
    const lookups = await loadLookups(context);
    if (!lookups.ok) return lookups;
    const people = (await Promise.all(lookups.data.councils.map(async (c) =>
      (await context.services.memberships.processAssignees(context.actor, c.id)).map((p) => ({ ...p, councilId: c.id }))))).flat();
    return { ok: true as const, data: { lookups: lookups.data, people } };
  });
  return <Screen result={result}>{({ lookups, people }) => <div className="surface-card max-w-lg p-6"><NewProcessForm councils={lookups.councils.map((c) => ({ value: c.id, label: c.label }))} people={people.map((p) => ({ value: p.id, label: p.fullName || p.id, councilId: p.councilId }))} /></div>}</Screen>;
}

export default function NewProcessPage() {
  return (
    <>
      <PageHeader
        eyebrow="Processos"
        backHref="/processos"
        backLabel="Todos os processos"
        title="Novo processo"
        description="Informe o órgão, número (NNN/AAAA) e objeto. Depois, anexe os sete documentos na tela do processo."
      />
      <Suspense fallback={<LoadingState />}><Content /></Suspense>
    </>
  );
}
