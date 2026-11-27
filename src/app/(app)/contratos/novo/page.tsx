import type { Metadata } from "next";
import { Suspense } from "react";
import { loadLookups } from "@/server/lookups";
import { loadScreen } from "@/server/screen";
import { ok } from "@/shared/lib/result";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { NewContractForm } from "./new-contract-form";

export const metadata: Metadata = { title: "Novo contrato" };

async function Content({ processId }: { processId?: string }) {
  const result = await loadScreen(async (ctx) => {
    const lookups = await loadLookups(ctx);
    if (!lookups.ok) return lookups;
    const processes = await ctx.services.processes.list(ctx.actor);
    if (!processes.ok) return processes;
    const suppliers = await ctx.services.suppliers.list(ctx.actor);
    if (!suppliers.ok) return suppliers;
    return ok({
      lookups: lookups.data,
      suppliers: suppliers.data.filter((supplier) => supplier.active).map((supplier) => ({ value: supplier.id, label: supplier.name, cnpj: supplier.cnpj })),
      processes: processes.data.map((view) => ({
        value: view.process.id,
        label: `${view.process.number} — ${view.process.title}`,
        councilId: view.process.councilId,
      })),
    });
  });
  return (
    <Screen result={result}>
      {(data) => (
        <div className="surface-card w-full max-w-3xl p-4 sm:p-6">
          <NewContractForm
            councils={data.lookups.councils.map((c) => ({ value: c.id, label: c.label }))}
            processes={data.processes}
            suppliers={data.suppliers}
            defaultProcessId={processId}
          />
        </div>
      )}
    </Screen>
  );
}

async function ContractFormContent({ searchParams }: { searchParams: Promise<{ processId?: string }> }) {
  const { processId } = await searchParams;
  return <Content processId={processId} />;
}

export default function NewContractPage({ searchParams }: { searchParams: Promise<{ processId?: string }> }) {
  return (
    <>
      <PageHeader eyebrow="Acompanhamento · Contratos" backHref="/contratos" backLabel="Todos os contratos" title="Novo contrato" description="Preencha os dados e vincule o processo para reunir contrato e ata na mesma contratação." />
      <Suspense fallback={<LoadingState title="Carregando formulário do contrato…" />}>
        <ContractFormContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}
