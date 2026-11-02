import type { Metadata } from "next";
import { Suspense } from "react";
import { loadLookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { NewAtaForm } from "./new-ata-form";

export const metadata: Metadata = { title: "Nova ata" };

async function Content() {
  const result = await loadScreen(loadLookups);
  return <Screen result={result}>{(l) => <div className="max-w-lg"><NewAtaForm councils={l.councils.map((c) => ({ value: c.id, label: c.label }))} /></div>}</Screen>;
}

export default function NewAtaPage() {
  return (<><PageHeader title="Nova ata" description="Nasce como rascunho: rascunho não consome saldo. Ative para permitir comprometimentos." /><Suspense fallback={<LoadingState />}><Content /></Suspense></>);
}
