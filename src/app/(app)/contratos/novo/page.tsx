import type { Metadata } from "next";
import { Suspense } from "react";
import { loadLookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { NewContractForm } from "./new-contract-form";

export const metadata: Metadata = { title: "Novo contrato" };

async function Content() {
  const result = await loadScreen(loadLookups);
  return <Screen result={result}>{(l) => <div className="surface-card max-w-lg p-6"><NewContractForm councils={l.councils.map((c) => ({ value: c.id, label: c.label }))} /></div>}</Screen>;
}

export default function NewContractPage() {
  return (<><PageHeader title="Novo contrato" /><Suspense fallback={<LoadingState />}><Content /></Suspense></>);
}
