import type { Metadata } from "next";
import { Suspense } from "react";
import { Archive, CheckCircle2, CirclePause, Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { loadScreen } from "@/server/screen";
import { canInAnyCouncil } from "@/shared/lib/authz/policy";
import { ok } from "@/shared/lib/result";
import { LoadingState } from "@/shared/ui/feedback-states";
import { KpiCard } from "@/shared/ui/kpi-card";
import { ModuleInsight, ModuleInsightFallback } from "@/shared/ui/module-insight";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { SimpleTable } from "@/shared/ui/simple-table";
import { NewMaterialForm } from "./new-material-form";

export const metadata: Metadata = { title: "Materiais" };

async function Content() {
  const result = await loadScreen(async ({ services, actor }) => {
    const materials = await services.inventory.listMaterials(actor);
    if (!materials.ok) return materials;
    return ok({ materials: materials.data, canCreate: canInAnyCouncil(actor, "material.manage") });
  });

  return (
    <Screen result={result}>
      {({ materials, canCreate }) => (
        <>
          <PageHeader eyebrow="Estoque · Cadastro" title="Materiais" description="Organize o catálogo usado nas solicitações, pedidos e movimentações de estoque." actions={canCreate ? <a href="#novo-material" className={buttonVariants()}><Plus className="size-4" aria-hidden /> Novo material</a> : undefined} />
          <div className="mb-6 grid gap-3 sm:grid-cols-3" aria-label="Resumo dos materiais">
            <KpiCard icon={<Archive className="size-4" aria-hidden />} label="Cadastrados" value={materials.length} />
            <KpiCard icon={<CheckCircle2 className="size-4" aria-hidden />} label="Ativos" value={materials.filter((m) => m.active).length} />
            <KpiCard icon={<CirclePause className="size-4" aria-hidden />} label="Inativos" value={materials.filter((m) => !m.active).length} />
          </div>
          <Suspense fallback={<ModuleInsightFallback />}>
            <ModuleInsight moduleName="Materiais" sourceHref="/estoque/materiais" facts={[
              { label: "Cadastrados", value: materials.length },
              { label: "Ativos", value: materials.filter((m) => m.active).length },
            ]} />
          </Suspense>
          <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_21rem]">
            <SimpleTable
              caption="Catálogo de materiais"
              rows={materials.map((m) => ({ id: m.id, code: m.code, name: m.name, unit: m.unit, active: m.active ? "Ativo" : "Inativo" }))}
              columns={[{ key: "code", header: "Código" }, { key: "name", header: "Nome" }, { key: "unit", header: "Unidade" }, { key: "active", header: "Situação" }]}
              filterKeys={[{ key: "active", label: "Situação" }]}
              emptyTitle="Nenhum material cadastrado"
              emptyDescription="Cadastre um material para usá-lo nas solicitações e no estoque."
            />
            {canCreate ? <section id="novo-material" aria-labelledby="novo-material-titulo" className="surface-card scroll-mt-6 p-5 xl:sticky xl:top-6"><p className="mb-1 text-[0.7rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">Cadastro rápido</p><h2 id="novo-material-titulo" className="mb-4 font-heading text-lg font-medium text-primary">Novo material</h2><NewMaterialForm /></section> : null}
          </div>
        </>
      )}
    </Screen>
  );
}

export default function MaterialsPage() {
  return <Suspense fallback={<LoadingState />}><Content /></Suspense>;
}
