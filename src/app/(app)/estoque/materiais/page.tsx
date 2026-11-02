import type { Metadata } from "next";
import { Suspense } from "react";
import { loadScreen } from "@/server/screen";
import { canInAnyCouncil } from "@/shared/lib/authz/policy";
import { ok } from "@/shared/lib/result";
import { LoadingState } from "@/shared/ui/feedback-states";
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
        <div className="space-y-8">
          <SimpleTable
            caption="Catálogo de materiais"
            rows={materials.map((m) => ({ id: m.id, code: m.code, name: m.name, unit: m.unit, active: m.active ? "Ativo" : "Inativo" }))}
            columns={[{ key: "code", header: "Código" }, { key: "name", header: "Nome" }, { key: "unit", header: "Unidade" }, { key: "active", header: "Situação" }]}
            emptyTitle="Nenhum material cadastrado"
          />
          {canCreate ? <section aria-labelledby="novo" className="surface-card max-w-lg p-6"><h2 id="novo" className="mb-4 font-heading text-lg font-medium tracking-tight text-primary">Novo material</h2><NewMaterialForm /></section> : null}
        </div>
      )}
    </Screen>
  );
}

export default function MaterialsPage() {
  return (<><PageHeader title="Materiais" description="Catálogo global de materiais." /><Suspense fallback={<LoadingState />}><Content /></Suspense></>);
}
