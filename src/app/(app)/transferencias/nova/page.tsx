import type { Metadata } from "next";
import { Suspense } from "react";
import { loadLookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { NewTransferForm } from "./new-transfer-form";

export const metadata: Metadata = { title: "Nova transferência" };

async function Content() {
  const result = await loadScreen(loadLookups);
  return <Screen result={result}>{(l) => <div className="surface-card max-w-lg p-6"><NewTransferForm councils={l.councils.map((c) => ({ value: c.id, label: c.label }))} materials={l.materials.map((m) => ({ value: m.id, label: m.label }))} /></div>}</Screen>;
}

export default function NewTransferPage() {
  return (<><PageHeader title="Nova transferência" description="O conselho de destino solicita; o de origem aprova, separa e despacha." /><Suspense fallback={<LoadingState />}><Content /></Suspense></>);
}
