import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CircleCheck, FileClock, FolderKanban } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { planExpiryFromNotes } from "@/app/(app)/solicitacoes/request-facets";
import { loadScreen } from "@/server/screen";
import { canInAnyCouncil } from "@/shared/lib/authz/policy";
import { ok } from "@/shared/lib/result";
import { diffInDays, toFortalezaDate } from "@/shared/lib/time";
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
    const [processes, councils, requests] = await Promise.all([
      ctx.services.processes.list(ctx.actor),
      ctx.services.councils.list(ctx.actor),
      ctx.services.purchases.listLinkedNotes(ctx.actor),
    ]);
    if (!processes.ok) return processes;
    if (!councils.ok) return councils;
    if (!requests.ok) return requests;
    const today = toFortalezaDate(new Date());
    const deadlines = new Map(requests.data.map(({ processId, notes }) =>
      [processId, planExpiryFromNotes(notes)?.day ?? null] as const,
    ));
    let complete = 0;
    let pending = 0;
    for (const { displayPercent } of processes.data) {
      if (displayPercent === 100) complete++;
      if (displayPercent < 100) pending++;
    }
    return ok({
      processes: processes.data,
      complete,
      pending,
      deadlines,
      today,
      councilLabel: Object.fromEntries(councils.data.map((council) => [council.id, council.acronym])),
      canCreate: canInAnyCouncil(ctx.actor, "process.create"),
    });
  });

  return (
    <Screen result={result}>
      {({ processes, complete, pending, councilLabel, canCreate, deadlines, today }) => (
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
              { label: "Documentação completa", value: complete },
              { label: "Documentação pendente", value: pending },
            ]} />
          </Suspense>
          <div className="mb-6 grid gap-3 sm:grid-cols-3" aria-label="Resumo dos processos">
            <KpiCard icon={<FolderKanban className="size-4" aria-hidden />} label="Processos" value={processes.length} />
            <KpiCard icon={<CircleCheck className="size-4" aria-hidden />} label="Documentação completa" value={complete} />
            <KpiCard icon={<FileClock className="size-4" aria-hidden />} label="Documentação pendente" value={pending} accent={pending > 0} />
          </div>
          <FlowGuide title="Fluxo em 4 passos" steps={PROCESS_FLOW_STEPS} />
          <ProcessesTable
            rows={processes.map((p) => ({
              id: p.process.id,
              number: p.process.number,
              title: p.process.title,
              council: councilLabel[p.process.councilId] ?? "—",
              status: p.process.status,
              completion: p.completion,
              progress: p.displayPercent,
              createdAt: p.process.createdAt.toISOString(),
              priority: (() => {
                if (["concluido", "cancelado", "arquivado"].includes(p.process.status)) return "";
                const due = deadlines.get(p.process.id);
                if (!due) return "";
                const days = diffInDays(today, due);
                if (days < 0) return "";
                return days <= 15 ? "Alta" : days <= 30 ? "Média" : "Baixa";
              })(),
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
