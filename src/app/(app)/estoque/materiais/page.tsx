import type { Metadata } from "next";
import { Suspense } from "react";
import { loadScreen } from "@/server/screen";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { SimpleTable } from "@/shared/ui/simple-table";
import { NewMaterialForm } from "./new-material-form";

export const metadata: Metadata = { title: "Materiais" };

async function Content() {
  const result = await loadScreen(({ services, actor }) => services.inventory.listMaterials(actor));
  return (
    <Screen result={result}>
      {(materials) => (
        <div className="space-y-8">
          <SimpleTable
            caption="Catálogo de materiais"
            rows={materials.map((m) => ({ id: m.id, code: m.code, name: m.name, unit: m.unit, active: m.active ? "Ativo" : "Inativo" }))}
            columns={[{ key: "code", header: "Código" }, { key: "name", header: "Nome" }, { key: "unit", header: "Unidade" }, { key: "active", header: "Situação" }]}
            emptyTitle="Nenhum material cadastrado"
          />
          <section aria-labelledby="novo" className="max-w-lg rounded-lg border p-4"><h2 id="novo" className="mb-4 text-base font-semibold">Novo material</h2><NewMaterialForm /></section>
        </div>
      )}
    </Screen>
  );
}

export default function MaterialsPage() {
  return (<><PageHeader title="Materiais" description="Catálogo global de materiais." /><Suspense fallback={<LoadingState />}><Content /></Suspense></>);
}
