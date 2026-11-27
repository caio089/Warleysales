import type { Metadata } from "next";
import { Suspense } from "react";
import { loadLookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { NewProcessForm } from "@/app/(app)/processos/novo/new-process-form";
import { can } from "@/shared/lib/authz/policy";
import { fail, ok } from "@/shared/lib/result";

export const metadata: Metadata = { title: "Novo processo" };

async function Content() {
  const result = await loadScreen(async (context) => {
    const lookups = await loadLookups(context);
    if (!lookups.ok) return lookups;
    const councils = lookups.data.councils.filter((council) => can(context.actor, "process.create", council.id));
    if (councils.length === 0) return fail("FORBIDDEN", "Você não tem permissão para cadastrar processos.");
    const people = (await Promise.all(councils.map(async (c) =>
      (await context.services.memberships.processAssignees(context.actor, c.id)).map((p) => ({ ...p, councilId: c.id }))))).flat();
    return ok({ councils, people });
  });
  return <Screen result={result}>{({ councils, people }) => <div className="surface-card w-full max-w-3xl p-4 sm:p-6"><NewProcessForm councils={councils.map((c) => ({ value: c.id, label: c.label }))} people={people.map((p) => ({ value: p.id, label: p.fullName || p.id, councilId: p.councilId }))} /></div>}</Screen>;
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
