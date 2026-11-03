import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { buttonVariants } from "@/components/ui/button";
import { formatWhatsapp } from "@/modules/identity/domain/whatsapp";
import { loadScreen } from "@/server/screen";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { SimpleTable } from "@/shared/ui/simple-table";

export const metadata: Metadata = { title: "Conselhos" };

async function CouncilsContent() {
  const result = await loadScreen(({ services, actor }) => services.councils.list(actor));
  return (
    <Screen result={result}>
      {(councils) => (
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
          emptyDescription="Cadastre o primeiro conselho ou empresa para começar."
          emptyAction={
            <Link href="/conselhos/novo" className={buttonVariants()}>
              Cadastrar novo conselho / empresa
            </Link>
          }
        />
      )}
    </Screen>
  );
}

export default function CouncilsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Administração"
        title="Conselhos"
        description="Cadastro e consulta de conselhos e empresas (administração central)."
        actions={
          <Link href="/conselhos/novo" className={buttonVariants()}>
            Cadastrar novo conselho / empresa
          </Link>
        }
      />
      <Suspense fallback={<LoadingState />}>
        <CouncilsContent />
      </Suspense>
    </>
  );
}
