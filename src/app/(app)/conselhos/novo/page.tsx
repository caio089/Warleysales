import type { Metadata } from "next";
import { PageHeader } from "@/shared/ui/page-header";
import { NewCouncilForm } from "../new-council-form";

export const metadata: Metadata = { title: "Cadastrar conselho" };

export default function NewCouncilPage() {
  return (
    <>
      <PageHeader
        eyebrow="Administração"
        title="Cadastrar conselho / empresa"
        description="Cadastro institucional com sigla, WhatsApp e informações do órgão."
      />
      <div className="surface-card max-w-lg p-6">
        <NewCouncilForm />
      </div>
    </>
  );
}
