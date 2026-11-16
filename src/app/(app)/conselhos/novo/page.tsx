import type { Metadata } from "next";
import { PageHeader } from "@/shared/ui/page-header";
import { NewCouncilForm } from "../new-council-form";

export const metadata: Metadata = { title: "Cadastrar organização" };

export default function NewCouncilPage() {
  return (
    <>
      <PageHeader
        eyebrow="Administração"
        title="Cadastrar órgão ou empresa"
        description="Cadastre órgãos públicos e empresas privadas atendidas pela assessoria."
      />
      <div className="surface-card max-w-lg p-6">
        <NewCouncilForm />
      </div>
    </>
  );
}
