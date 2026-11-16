import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CircleCheck, FileClock, FolderKanban } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { loadLookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { canInAnyCouncil } from "@/shared/lib/authz/policy";
import { ok } from "@/shared/lib/result";
import { PROCESS_FLOW_STEPS } from "@/shared/ui/flow-copy";
import { FlowGuide } from "@/shared/ui/flow-guide";
import { LoadingState } from "@/shared/ui/feedback-states";
import { KpiCard } from "@/shared/ui/kpi-card";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { ModuleInsight, ModuleInsightFallback } from "@/shared/ui/module-insight";
import { ProcessAttachmentSheet } from "./process-attachment-sheet";
import { ProcessesTable } from "./processes-table";

export const metadata: Metadata = { title: "Processos" };

async function Content() {
  const result = await loadScreen(async (ctx) => {
    const [processes, lookups] = await Promise.all([
      ctx.services.processes.list(ctx.actor),
      loadLookups(ctx),
    ]);
    if (!processes.ok) return processes;
    if (!lookups.ok) return lookups;
    return ok({
      processes: processes.data,
      lookups: lookups.data,
      canCreate: canInAnyCouncil(ctx.actor, "process.create"),
    });
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
          <Suspense fallback={<ModuleInsightFallback />}>
            <ModuleInsight moduleName="Processos" sourceHref="/processos" facts={[
              { label: "Total", value: processes.length },
              { label: "Documentação completa", value: processes.filter((p) => p.displayPercent === 100).length },
              { label: "Documentação pendente", value: processes.filter((p) => p.displayPercent < 100).length },
            ]} />
          </Suspense>
          <div className="mb-6 grid gap-3 sm:grid-cols-3" aria-label="Resumo dos processos">
            <KpiCard icon={<FolderKanban className="size-4" aria-hidden />} label="Processos" value={processes.length} />
            <KpiCard icon={<CircleCheck className="size-4" aria-hidden />} label="Documentação completa" value={processes.filter((p) => p.displayPercent === 100).length} />
            <KpiCard icon={<FileClock className="size-4" aria-hidden />} label="Documentação pendente" value={processes.filter((p) => p.displayPercent < 100).length} accent={processes.some((p) => p.displayPercent < 100)} />
          </div>
          <FlowGuide title="Fluxo em 4 passos" steps={PROCESS_FLOW_STEPS} />
          <ProcessesTable
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
          <ProcessAttachmentSheet />
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
