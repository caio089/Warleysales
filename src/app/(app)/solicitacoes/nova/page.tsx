import type { Metadata } from "next";
import { Suspense } from "react";
import { loadLookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { ok } from "@/shared/lib/result";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { NewRequestForm } from "./new-request-form";

export const metadata: Metadata = { title: "Nova solicitação" };

async function Content({
  searchParams,
}: {
  searchParams: Promise<{ councilId?: string }>;
}) {
  const { councilId: requestedCouncilId } = await searchParams;
  const result = await loadScreen(async (ctx) => {
    const lookups = await loadLookups(ctx);
    if (!lookups.ok) return lookups;
    return ok({ lookups: lookups.data });
  });
  return (
    <Screen result={result}>
      {({ lookups: l }) => {
        const councils = l.councils.map((c) => ({ value: c.id, label: c.label }));
        const fromQuery =
          requestedCouncilId && councils.some((council) => council.value === requestedCouncilId)
            ? requestedCouncilId
            : undefined;
        /** Painel do órgão ou usuário com um único vínculo: órgão já está definido. */
        const defaultCouncilId = fromQuery ?? (councils.length === 1 ? councils[0]!.value : undefined);
        const lockCouncil = Boolean(defaultCouncilId);

        return (
          <NewRequestForm
            councils={councils}
            defaultCouncilId={defaultCouncilId}
            lockCouncil={lockCouncil}
          />
        );
      }}
    </Screen>
  );
}

export default function NewRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ councilId?: string }>;
}) {
  return (
    <>
      <PageHeader
        eyebrow="Solicitações"
        backHref="/solicitacoes"
        backLabel="Todas as solicitações"
        title="Nova solicitação"
        description="Importe Excel/Word com IA ou preencha à mão · ao salvar, a solicitação já vai para aprovação de Warley e Maria Luiza."
      />
      <Suspense fallback={<LoadingState />}>
        <Content searchParams={searchParams} />
      </Suspense>
    </>
  );
}
