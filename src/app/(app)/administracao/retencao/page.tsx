import type { Metadata } from "next";
import { Suspense } from "react";
import { loadLookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { ok } from "@/shared/lib/result";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { SimpleTable } from "@/shared/ui/simple-table";
import { RetentionForms } from "./retention-forms";

export const metadata: Metadata = { title: "Retenção documental" };

const ACTION_LABEL = { not_eligible: "Ainda não elegível", blocked: "Bloqueado", archive_only: "Somente arquivar (sem autorização)", eligible_for_disposal: "Elegível à eliminação" } as const;

async function Content() {
  const result = await loadScreen(async (ctx) => {
    const [overview, lookups] = await Promise.all([ctx.services.retention.overview(ctx.actor), loadLookups(ctx)]);
    if (!overview.ok) return overview;
    if (!lookups.ok) return lookups;
    return ok({ overview: overview.data, lookups: lookups.data });
  });
  return (
    <Screen result={result}>
      {({ overview, lookups }) => (
        <div className="space-y-8">
          <p className="rounded-lg border bg-info p-3 text-sm text-info-foreground">Sem autorização formal de retenção, o job apenas arquiva: nenhum arquivo é eliminado fisicamente (padrão seguro P2).</p>
          <SimpleTable
            caption="Elegibilidade de limpeza documental"
            rows={overview.map((o) => ({ id: o.processId, number: o.number, council: lookups.councilLabel[o.councilId] ?? "—", completedAt: o.documentalCompletedAt.toISOString(), decision: ACTION_LABEL[o.action], reasons: o.reasons.join(" ") || null }))}
            columns={[{ key: "number", header: "Processo" }, { key: "council", header: "Conselho" }, { key: "completedAt", header: "100% desde", kind: "datetime" }, { key: "decision", header: "Situação" }, { key: "reasons", header: "Observações" }]}
            filterKeys={[{ key: "decision", label: "Situação" }]}
            emptyTitle="Nenhum processo com documentação completa"
          />
          <RetentionForms processes={overview.map((o) => ({ value: o.processId, label: o.number }))} />
        </div>
      )}
    </Screen>
  );
}

export default function RetentionPage() {
  return (<><PageHeader title="Retenção documental" description="Janela de 30 dias, relatório de encerramento, bloqueios e autorização." /><Suspense fallback={<LoadingState />}><Content /></Suspense></>);
}
