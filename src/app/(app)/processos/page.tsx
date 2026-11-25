import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CircleCheck, FileClock, FolderKanban } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { planExpiryFromNotes } from "@/app/(app)/solicitacoes/request-facets";
import { ApprovalQueue, type PendingApprovalItem } from "@/app/(app)/dashboard/approval-queue";
import { loadScreen } from "@/server/screen";
import { canInAnyCouncil } from "@/shared/lib/authz/policy";
import { ok } from "@/shared/lib/result";
import { diffInDays, toFortalezaDate } from "@/shared/lib/time";
import { LoadingState } from "@/shared/ui/feedback-states";
import { KpiCard } from "@/shared/ui/kpi-card";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { ModuleInsight, ModuleInsightFallback } from "@/shared/ui/module-insight";
import { processDisplayStatus } from "@/shared/ui/status-presentation";
import { ProcessAttachmentSheet } from "./process-attachment-sheet";
import { ProcessesTable } from "./processes-table";

export const metadata: Metadata = { title: "Processos" };

async function Content({ openApprovals }: { openApprovals: boolean }) {
  const result = await loadScreen(async (ctx) => {
    const [processes, councils, requests, linkedNotes, atas, contracts] = await Promise.all([
      ctx.services.processes.list(ctx.actor),
      ctx.services.councils.list(ctx.actor),
      ctx.services.purchases.list(ctx.actor),
      ctx.services.purchases.listLinkedNotes(ctx.actor),
      ctx.services.atas.list(ctx.actor),
      ctx.services.contracts.list(ctx.actor),
    ]);
    if (!processes.ok) return processes;
    if (!councils.ok) return councils;
    if (!requests.ok) return requests;
    if (!linkedNotes.ok) return linkedNotes;
    if (!atas.ok) return atas;
    if (!contracts.ok) return contracts;
    const processIdsWithAta = new Set(
      atas.data.filter((item) => item.ata.processId).map((item) => item.ata.processId!),
    );
    const processIdsWithContract = new Set(
      contracts.data
        .filter((item) => item.contract.processId)
        .map((item) => item.contract.processId!),
    );
    const today = toFortalezaDate(new Date());
    const councilLabel = Object.fromEntries(councils.data.map((council) => [council.id, council.acronym]));
    const deadlines = new Map(linkedNotes.data.map(({ processId, notes }) =>
      [processId, planExpiryFromNotes(notes)?.day ?? null] as const,
    ));
    let complete = 0;
    let pending = 0;
    for (const { displayPercent } of processes.data) {
      if (displayPercent === 100) complete++;
      if (displayPercent < 100) pending++;
    }

    const canApproveRequests = ctx.actor.isSpecialDeleter;
    const requestStatusByProcess = new Map(
      requests.data
        .filter((request) => request.processId)
        .map((request) => [request.processId!, request.status] as const),
    );
    const approvalQueue: PendingApprovalItem[] = canApproveRequests
      ? requests.data
          .filter((request) => ["enviada", "em_analise", "aguardando_correcao"].includes(request.status))
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .map((request) => ({
            id: request.id,
            title: request.title,
            councilName: councilLabel[request.councilId] ?? "Órgão",
            status: request.status,
            processId: request.processId ?? null,
            estimatedValue: request.estimatedValue ?? null,
            itemsCount: request.items.length,
            createdAt: request.createdAt.toISOString(),
          }))
      : [];

    return ok({
      processes: processes.data,
      complete,
      pending,
      deadlines,
      today,
      councilLabel,
      canCreate: canInAnyCouncil(ctx.actor, "process.create"),
      canApproveRequests,
      approvalQueue,
      requestStatusByProcess: Object.fromEntries(requestStatusByProcess),
      processIdsWithAta: [...processIdsWithAta],
      processIdsWithContract: [...processIdsWithContract],
    });
  });

  return (
    <Screen result={result}>
      {({ processes, complete, pending, councilLabel, canCreate, deadlines, today, canApproveRequests, approvalQueue, requestStatusByProcess, processIdsWithAta, processIdsWithContract }) => {
        const withAta = new Set(processIdsWithAta);
        const withContract = new Set(processIdsWithContract);
        return (
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
              ...(canApproveRequests
                ? [{ label: "Aguardando aprovação", value: approvalQueue.length }]
                : []),
            ]} />
          </Suspense>
          <div className="mb-6 grid gap-3 sm:grid-cols-3" aria-label="Resumo dos processos">
            <KpiCard icon={<FolderKanban className="size-4" aria-hidden />} label="Processos" value={processes.length} />
            <KpiCard icon={<CircleCheck className="size-4" aria-hidden />} label="Documentação completa" value={complete} />
            <KpiCard icon={<FileClock className="size-4" aria-hidden />} label="Documentação pendente" value={pending} accent={pending > 0} />
          </div>

          {canApproveRequests ? (
            <div className="mb-6">
              <ApprovalQueue items={approvalQueue} showWhenEmpty defaultOpen={openApprovals} />
            </div>
          ) : null}

          <ProcessesTable
            rows={processes.map((p) => ({
              id: p.process.id,
              number: p.process.number,
              title: p.process.title,
              council: councilLabel[p.process.councilId] ?? "—",
              status: processDisplayStatus(p.process.status, requestStatusByProcess[p.process.id], {
                hasAta: withAta.has(p.process.id),
                hasContract: withContract.has(p.process.id),
              }),
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
        );
      }}
    </Screen>
  );
}

export default async function ProcessesPage({
  searchParams,
}: {
  searchParams: Promise<{ aprovacoes?: string }>;
}) {
  const { aprovacoes } = await searchParams;
  const openApprovals = aprovacoes === "1" || aprovacoes === "true";
  return (
    <Suspense fallback={<LoadingState />}>
      <Content openApprovals={openApprovals} />
    </Suspense>
  );
}
