import type { Metadata } from "next";
import { Suspense } from "react";
import { Building2, CheckCircle2, CirclePause, Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { formatCnpj } from "@/modules/suppliers/domain/cnpj";
import { loadScreen } from "@/server/screen";
import { canInAnyCouncil } from "@/shared/lib/authz/policy";
import { ok } from "@/shared/lib/result";
import { LoadingState } from "@/shared/ui/feedback-states";
import { KpiCard } from "@/shared/ui/kpi-card";
import { ModuleInsight, ModuleInsightFallback } from "@/shared/ui/module-insight";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { SimpleTable } from "@/shared/ui/simple-table";
import { NewSupplierForm } from "./new-supplier-form";

export const metadata: Metadata = { title: "Fornecedores" };

async function Content() {
  const result = await loadScreen(async ({ services, actor }) => {
    const suppliers = await services.suppliers.list(actor);
    if (!suppliers.ok) return suppliers;
    return ok({ suppliers: suppliers.data, canCreate: canInAnyCouncil(actor, "supplier.manage") });
  });

  return (
    <Screen result={result}>
      {({ suppliers, canCreate }) => (
        <>
          <PageHeader eyebrow="Cadastro · Compras" title="Fornecedores" description="Consulte empresas cadastradas e mantenha os contatos usados nas contratações. O CNPJ é único no sistema." actions={canCreate ? <a href="#novo-fornecedor" className={buttonVariants()}><Plus className="size-4" aria-hidden /> Novo fornecedor</a> : undefined} />
          <div className="mb-6 grid gap-3 sm:grid-cols-3" aria-label="Resumo dos fornecedores">
            <KpiCard icon={<Building2 className="size-4" aria-hidden />} label="Cadastrados" value={suppliers.length} />
            <KpiCard icon={<CheckCircle2 className="size-4" aria-hidden />} label="Ativos" value={suppliers.filter((s) => s.active).length} />
            <KpiCard icon={<CirclePause className="size-4" aria-hidden />} label="Inativos" value={suppliers.filter((s) => !s.active).length} />
          </div>
          <Suspense fallback={<ModuleInsightFallback />}>
            <ModuleInsight moduleName="Fornecedores" sourceHref="/fornecedores" facts={[
              { label: "Cadastrados", value: suppliers.length },
              { label: "Ativos", value: suppliers.filter((s) => s.active).length },
              { label: "Inativos", value: suppliers.filter((s) => !s.active).length },
            ]} />
          </Suspense>
          <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_21rem]">
            <SimpleTable
              caption="Fornecedores cadastrados"
              rows={suppliers.map((s) => ({ id: s.id, name: s.name, cnpj: s.cnpj ? formatCnpj(s.cnpj) : null, email: s.email, phone: s.phone, active: s.active ? "Ativo" : "Inativo" }))}
              columns={[{ key: "name", header: "Razão social" }, { key: "cnpj", header: "CNPJ" }, { key: "email", header: "E-mail" }, { key: "phone", header: "Telefone" }, { key: "active", header: "Situação" }]}
              filterKeys={[{ key: "active", label: "Situação" }]}
              emptyTitle="Nenhum fornecedor cadastrado"
              emptyDescription="Cadastre o primeiro fornecedor para associá-lo aos contratos e processos."
            />
            {canCreate ? <section id="novo-fornecedor" aria-labelledby="novo-fornecedor-titulo" className="surface-card scroll-mt-6 p-5 xl:sticky xl:top-6"><p className="mb-1 text-[0.7rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">Cadastro rápido</p><h2 id="novo-fornecedor-titulo" className="mb-4 font-heading text-lg font-medium text-primary">Novo fornecedor</h2><NewSupplierForm /></section> : null}
          </div>
        </>
      )}
    </Screen>
  );
}

export default function SuppliersPage() {
  return <Suspense fallback={<LoadingState />}><Content /></Suspense>;
}
