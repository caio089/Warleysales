import type { Metadata } from "next";
import { Suspense } from "react";
import { loadScreen } from "@/server/screen";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { SimpleTable } from "@/shared/ui/simple-table";
import { formatWhatsapp } from "@/modules/identity/domain/whatsapp";
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
            rows={councils.map((c) => ({
              id: c.id,
              acronym: c.acronym,
              name: c.name,
              whatsapp: c.whatsappE164 ? formatWhatsapp(c.whatsappE164) : null,
              status: c.active ? "Ativo" : "Inativo",
              href: `/conselhos/${c.id}`,
            }))}
            columns={[
              { key: "acronym", header: "Sigla", kind: "link", hrefKey: "href" },
              { key: "name", header: "Nome" },
              { key: "whatsapp", header: "WhatsApp" },
              { key: "status", header: "Situação" },
            ]}
            emptyTitle="Nenhum conselho cadastrado"
            emptyDescription="Cadastre o primeiro conselho para começar."
          />
          <section aria-labelledby="novo-conselho" className="surface-card max-w-lg p-6">
            <h2 id="novo-conselho" className="mb-4 font-heading text-lg font-medium tracking-tight text-primary">Novo conselho</h2>
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
