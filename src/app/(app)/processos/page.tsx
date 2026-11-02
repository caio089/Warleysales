import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { buttonVariants } from "@/components/ui/button";
import { loadLookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { ok } from "@/shared/lib/result";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { SimpleTable } from "@/shared/ui/simple-table";

export const metadata: Metadata = { title: "Processos" };

async function ProcessesContent() {
  const result = await loadScreen(async (ctx) => {
    const [processes, lookups] = await Promise.all([ctx.services.processes.list(ctx.actor), loadLookups(ctx)]);
    if (!processes.ok) return processes;
    if (!lookups.ok) return lookups;
    return ok({ processes: processes.data, lookups: lookups.data });
  });
  return (
    <Screen result={result}>
      {({ processes, lookups }) => (
        <SimpleTable
          caption="Processos administrativos"
          rows={processes.map((p) => ({
            id: p.process.id, number: p.process.number, title: p.process.title, council: lookups.councilLabel[p.process.councilId] ?? "—",
            status: p.process.status, completion: p.completion, progress: p.displayPercent, href: `/processos/${p.process.id}`,
          }))}
          columns={[
            { key: "number", header: "Número", kind: "link", hrefKey: "href" },
            { key: "title", header: "Objeto" },
            { key: "council", header: "Conselho" },
            { key: "status", header: "Situação", kind: "status", dictionary: "process" },
            { key: "completion", header: "Documentação", kind: "status", dictionary: "completion" },
            { key: "progress", header: "Progresso", kind: "progress" },
          ]}
          filterKeys={[{ key: "status", label: "Situação", dictionary: "process" }, { key: "council", label: "Conselho" }]}
          emptyTitle="Nenhum processo encontrado"
          emptyDescription="Crie um processo para acompanhar os 7 documentos obrigatórios."
        />
      )}
    </Screen>
  );
}

export default function ProcessesPage() {
  return (
    <>
      <PageHeader title="Processos" description="Processos administrativos e progresso documental." actions={<Link href="/processos/novo" className={buttonVariants()}>Novo processo</Link>} />
      <Suspense fallback={<LoadingState />}><ProcessesContent /></Suspense>
    </>
  );
}
