import type { Metadata } from "next";
import { Suspense } from "react";
import { loadLookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { NewRequestForm } from "./new-request-form";

export const metadata: Metadata = { title: "Nova solicitação" };

async function Content() {
  const result = await loadScreen(loadLookups);
  return (
    <Screen result={result}>
      {(l) => <NewRequestForm councils={l.councils.map((c) => ({ value: c.id, label: c.label }))} materials={l.materials.map((m) => ({ value: m.id, label: m.label }))} />}
    </Screen>
  );
}

export default function NewRequestPage() {
  return (
    <>
      <PageHeader title="Nova solicitação" description="A solicitação nasce como rascunho. Aprovar não altera o estoque: ele só aumenta no recebimento." />
      <Suspense fallback={<LoadingState />}><Content /></Suspense>
    </>
  );
}
