import type { Metadata } from "next";
import { Suspense } from "react";
import { loadScreen } from "@/server/screen";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { SimpleTable } from "@/shared/ui/simple-table";
import { formatCnpj } from "@/modules/suppliers/domain/cnpj";
import { NewSupplierForm } from "./new-supplier-form";

export const metadata: Metadata = { title: "Fornecedores" };

async function Content() {
  const result = await loadScreen(({ services, actor }) => services.suppliers.list(actor));
  return (
    <Screen result={result}>
      {(suppliers) => (
        <div className="space-y-8">
          <SimpleTable
            caption="Fornecedores"
            rows={suppliers.map((s) => ({ id: s.id, name: s.name, cnpj: s.cnpj ? formatCnpj(s.cnpj) : null, email: s.email, phone: s.phone, active: s.active ? "Ativo" : "Inativo" }))}
            columns={[{ key: "name", header: "Razão social" }, { key: "cnpj", header: "CNPJ" }, { key: "email", header: "E-mail" }, { key: "phone", header: "Telefone" }, { key: "active", header: "Situação" }]}
            emptyTitle="Nenhum fornecedor cadastrado"
          />
          <section aria-labelledby="novo" className="max-w-lg rounded-lg border p-4"><h2 id="novo" className="mb-4 text-base font-semibold">Novo fornecedor</h2><NewSupplierForm /></section>
        </div>
      )}
    </Screen>
  );
}

export default function SuppliersPage() {
  return (<><PageHeader title="Fornecedores" description="CNPJ único em todo o sistema." /><Suspense fallback={<LoadingState />}><Content /></Suspense></>);
}
