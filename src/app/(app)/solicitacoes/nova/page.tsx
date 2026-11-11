import type { Metadata } from "next";
import { Suspense } from "react";
import { loadLookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { ok } from "@/shared/lib/result";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { NewRequestForm } from "./new-request-form";

export const metadata: Metadata = { title: "Nova solicitação" };

async function Content() {
  const result = await loadScreen(async (ctx) => {
    const lookups = await loadLookups(ctx);
    if (!lookups.ok) return lookups;
    return ok({ lookups: lookups.data });
  });
  return (
    <Screen result={result}>
      {({ lookups: l }) => (
        <NewRequestForm councils={l.councils.map((c) => ({ value: c.id, label: c.label }))} />
      )}
    </Screen>
  );
}

export default function NewRequestPage() {
  return (
    <>
      <PageHeader
        eyebrow="Solicitações"
        title="Nova solicitação"
        description="1) Preencha e salve o rascunho · 2) Na tela seguinte, clique em Enviar · 3) O gestor aprova · 4) No recebimento o estoque sobe."
      />
      <Suspense fallback={<LoadingState />}><Content /></Suspense>
    </>
  );
}
