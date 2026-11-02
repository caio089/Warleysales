import type { Metadata } from "next";
import { Suspense } from "react";
import { loadScreen } from "@/server/screen";
import { canInAnyCouncil } from "@/shared/lib/authz/policy";
import { ok } from "@/shared/lib/result";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { SimpleTable } from "@/shared/ui/simple-table";
import { formatCnpj } from "@/modules/suppliers/domain/cnpj";
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
        <div className="space-y-8">
          <SimpleTable
            caption="Fornecedores"
            rows={suppliers.map((s) => ({ id: s.id, name: s.name, cnpj: s.cnpj ? formatCnpj(s.cnpj) : null, email: s.email, phone: s.phone, active: s.active ? "Ativo" : "Inativo" }))}
            columns={[{ key: "name", header: "Razão social" }, { key: "cnpj", header: "CNPJ" }, { key: "email", header: "E-mail" }, { key: "phone", header: "Telefone" }, { key: "active", header: "Situação" }]}
            emptyTitle="Nenhum fornecedor cadastrado"
          />
          {canCreate ? <section aria-labelledby="novo" className="surface-card max-w-lg p-6"><h2 id="novo" className="mb-4 font-heading text-lg font-medium tracking-tight text-primary">Novo fornecedor</h2><NewSupplierForm /></section> : null}
        </div>
      )}
    </Screen>
  );
}

export default function SuppliersPage() {
  return (<><PageHeader title="Fornecedores" description="CNPJ único em todo o sistema." /><Suspense fallback={<LoadingState />}><Content /></Suspense></>);
}
