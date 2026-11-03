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

async function Content() {
  const result = await loadScreen(async (ctx) => {
    const [lookups, atas] = await Promise.all([loadLookups(ctx), ctx.services.atas.list(ctx.actor)]);
    if (!lookups.ok) return lookups;
    if (!atas.ok) return atas;
    const ataItems = atas.data
      .filter((a) => a.ata.status === "vigente" && a.validity === "vigente")
      .flatMap((a) => a.items
        .filter((i) => i.balance.balance > 0)
        .map((i) => ({
          value: i.itemId,
          label: `${a.ata.number} — ${i.description} (saldo ${i.balance.balance})`,
        })));
    return ok({ lookups: lookups.data, ataItems });
  });
  return (
    <Screen result={result}>
      {({ lookups: l, ataItems }) => (
        <NewRequestForm
          councils={l.councils.map((c) => ({ value: c.id, label: c.label }))}
          materials={l.materials.map((m) => ({ value: m.id, label: m.label }))}
          ataItems={ataItems}
        />
      )}
    </Screen>
  );
}

export default function NewRequestPage() {
  return (
    <>
      <PageHeader
        eyebrow="Solicitações"
        title="Nova solicitação"
        description="1) Preencha e salve o rascunho · 2) Na tela seguinte, clique em Enviar · 3) O gestor aprova · 4) No recebimento o estoque sobe."
      />
      <Suspense fallback={<LoadingState />}><Content /></Suspense>
    </>
  );
}
