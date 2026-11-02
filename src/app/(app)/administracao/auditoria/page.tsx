import type { Metadata } from "next";
import { Suspense } from "react";
import { loadScreen } from "@/server/screen";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { SimpleTable } from "@/shared/ui/simple-table";

export const metadata: Metadata = { title: "Auditoria" };

async function Content() {
  const result = await loadScreen(({ services, actor }) => services.audit.list(actor));
  return (
    <Screen result={result}>
      {(entries) => (
        <SimpleTable
          caption="Registros de auditoria"
          rows={entries.map((e) => ({ id: e.id, at: e.createdAt.toISOString(), actor: e.actorId ?? "Sistema (job)", action: e.action, entity: e.entity, entityId: e.entityId, result: e.result === "success" ? "Sucesso" : e.result === "denied" ? "Negado" : "Erro" }))}
          columns={[{ key: "at", header: "Quando", kind: "datetime" }, { key: "actor", header: "Autor" }, { key: "action", header: "Ação" }, { key: "entity", header: "Entidade" }, { key: "entityId", header: "Identificador" }, { key: "result", header: "Resultado" }]}
          filterKeys={[{ key: "result", label: "Resultado" }, { key: "entity", label: "Entidade" }]}
          emptyTitle="Nenhum registro de auditoria"
        />
      )}
    </Screen>
  );
}

export default function AuditPage() {
  return (<><PageHeader title="Auditoria" description="Registros somente de inclusão: não podem ser alterados nem apagados." /><Suspense fallback={<LoadingState />}><Content /></Suspense></>);
}
