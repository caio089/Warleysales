import type { Metadata } from "next";
import { Suspense } from "react";
import { loadLookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { NewProcessForm } from "./new-process-form";

export const metadata: Metadata = { title: "Novo processo" };

async function Content() {
  const result = await loadScreen(loadLookups);
  return <Screen result={result}>{(l) => <div className="max-w-lg"><NewProcessForm councils={l.councils.map((c) => ({ value: c.id, label: c.label }))} /></div>}</Screen>;
}

export default function NewProcessPage() {
  return (
    <>
      <PageHeader title="Novo processo" description="O número segue o formato NNN/AAAA e é único por conselho." />
      <Suspense fallback={<LoadingState />}><Content /></Suspense>
    </>
  );
}
