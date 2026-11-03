import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { buttonVariants } from "@/components/ui/button";
import { loadLookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { canInAnyCouncil } from "@/shared/lib/authz/policy";
import { ok } from "@/shared/lib/result";
import { PROCESS_FLOW_STEPS } from "@/shared/ui/flow-copy";
import { FlowGuide } from "@/shared/ui/flow-guide";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { SimpleTable } from "@/shared/ui/simple-table";

export const metadata: Metadata = { title: "Processos" };

async function Content() {
  const result = await loadScreen(async (ctx) => {
    const [processes, lookups] = await Promise.all([ctx.services.processes.list(ctx.actor), loadLookups(ctx)]);
    if (!processes.ok) return processes;
    if (!lookups.ok) return lookups;
    return ok({ processes: processes.data, lookups: lookups.data, canCreate: canInAnyCouncil(ctx.actor, "process.create") });
  });
  return (
    <Screen result={result}>
      {({ processes, lookups, canCreate }) => (
        <>
          <PageHeader
            eyebrow="Documentação"
            title="Processos"
            description="Abra o processo, anexe os 7 documentos e acompanhe o progresso. Completar a pasta não encerra o processo sozinho."
            actions={
              canCreate ? (
                <Link href="/processos/novo" className={buttonVariants()}>
                  Novo processo
                </Link>
              ) : undefined
            }
          />
          <FlowGuide title="Fluxo em 4 passos" steps={PROCESS_FLOW_STEPS} />
          <SimpleTable
            caption="Processos administrativos"
            rows={processes.map((p) => ({
              id: p.process.id,
              number: p.process.number,
              title: p.process.title,
              council: lookups.councilLabel[p.process.councilId] ?? "—",
              status: p.process.status,
              completion: p.completion,
              progress: p.displayPercent,
              href: `/processos/${p.process.id}`,
            }))}
            columns={[
              { key: "number", header: "Número", kind: "link", hrefKey: "href" },
              { key: "title", header: "Objeto" },
              { key: "council", header: "Conselho" },
              { key: "status", header: "Situação", kind: "status", dictionary: "process" },
              { key: "completion", header: "Documentação", kind: "status", dictionary: "completion" },
              { key: "progress", header: "Progresso", kind: "progress" },
            ]}
            filterKeys={[
              { key: "status", label: "Situação", dictionary: "process" },
              { key: "council", label: "Conselho" },
            ]}
            emptyTitle="Nenhum processo ainda"
            emptyDescription="Crie o primeiro processo e anexe DFD, ETP, MR, TR, PP, PJ e ED — o progresso sobe sozinho."
            emptyAction={
              canCreate ? (
                <Link href="/processos/novo" className={buttonVariants()}>
                  Criar primeiro processo
                </Link>
              ) : undefined
            }
          />
        </>
      )}
    </Screen>
  );
}

export default function ProcessesPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <Content />
    </Suspense>
  );
}
