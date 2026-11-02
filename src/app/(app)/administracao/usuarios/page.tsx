import type { Metadata } from "next";
import { Suspense } from "react";
import { loadScreen } from "@/server/screen";
import { LoadingState } from "@/shared/ui/feedback-states";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { SimpleTable } from "@/shared/ui/simple-table";
import { MembershipForms } from "./membership-forms";

export const metadata: Metadata = { title: "Usuários e vínculos" };

async function Content() {
  const result = await loadScreen(({ services, actor }) => services.memberships.directory(actor));
  return (
    <Screen result={result}>
      {(dir) => (
        <div className="space-y-8">
          <p className="rounded-lg border bg-info p-3 text-sm text-info-foreground">
            Cadastro é somente por convite (P7). Convide no Auth e depois vincule o perfil ao conselho com o papel correto.
          </p>
          <SimpleTable
            caption="Vínculos de conselho"
            rows={dir.memberships.map((m) => ({
              id: `${m.userId}:${m.councilId}`,
              user: m.userName,
              council: m.councilLabel,
              role: dir.roles.find((r) => r.value === m.role)?.label ?? m.role,
            }))}
            columns={[{ key: "user", header: "Usuário" }, { key: "council", header: "Conselho" }, { key: "role", header: "Papel" }]}
            filterKeys={[{ key: "council", label: "Conselho" }, { key: "role", label: "Papel" }]}
            emptyTitle="Nenhum vínculo"
            emptyDescription="Sem vínculo, o usuário autenticado não opera nenhum conselho."
          />
          <MembershipForms
            users={dir.profiles.map((p) => ({ value: p.id, label: p.fullName || p.id.slice(0, 8) }))}
            councils={dir.councils.map((c) => ({ value: c.id, label: c.acronym }))}
            roles={dir.roles}
            memberships={dir.memberships.map((m) => ({
              value: `${m.userId}:${m.councilId}`,
              label: `${m.userName} · ${m.councilLabel} · ${dir.roles.find((r) => r.value === m.role)?.label ?? m.role}`,
            }))}
          />
        </div>
      )}
    </Screen>
  );
}

export default function UsersPage() {
  return (
    <>
      <PageHeader title="Usuários e vínculos" description="Papel por conselho. Exclusão manual continua exclusiva do Warley." />
      <Suspense fallback={<LoadingState />}><Content /></Suspense>
    </>
  );
}
