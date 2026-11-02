import type { Metadata } from "next";
import { Suspense } from "react";
import { loadScreen } from "@/server/screen";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { SimpleTable } from "@/shared/ui/simple-table";
import { NewCouncilForm } from "./new-council-form";

export const metadata: Metadata = { title: "Conselhos" };

async function CouncilsContent() {
  const result = await loadScreen(({ services, actor }) => services.councils.list(actor));
  return (
    <Screen result={result}>
      {(councils) => (
        <div className="space-y-8">
          <SimpleTable
            caption="Conselhos cadastrados"
            rows={councils.map((c) => ({ id: c.id, acronym: c.acronym, name: c.name, status: c.active ? "Ativo" : "Inativo", href: `/conselhos/${c.id}` }))}
            columns={[{ key: "acronym", header: "Sigla", kind: "link", hrefKey: "href" }, { key: "name", header: "Nome" }, { key: "status", header: "Situação" }]}
            emptyTitle="Nenhum conselho cadastrado"
            emptyDescription="Cadastre o primeiro conselho para começar."
          />
          <section aria-labelledby="novo-conselho" className="max-w-lg rounded-lg border p-4">
            <h2 id="novo-conselho" className="mb-4 text-base font-semibold">Novo conselho</h2>
            <NewCouncilForm />
          </section>
        </div>
      )}
    </Screen>
  );
}

export default function CouncilsPage() {
  return (
    <>
      <PageHeader title="Conselhos" description="Cadastro e consulta de conselhos (administração central)." />
      <Suspense fallback={<LoadingState />}><CouncilsContent /></Suspense>
    </>
  );
}
