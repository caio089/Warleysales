import type { Metadata } from "next";
import { Suspense } from "react";
import { Building2, Link2, UsersRound } from "lucide-react";
import { loadScreen } from "@/server/screen";
import { LoadingState } from "@/shared/ui/feedback-states";
import { KpiCard } from "@/shared/ui/kpi-card";
import { PageHeader } from "@/shared/ui/page-header";
import { Screen } from "@/shared/ui/screen";
import { SimpleTable } from "@/shared/ui/simple-table";
import { MembershipForms, ProvisionCouncilForm, StaffCategoryForm } from "./membership-forms";

export const metadata: Metadata = { title: "Usuários e vínculos" };

async function Content() {
  const result = await loadScreen(({ services, actor }) => services.memberships.directory(actor));
  return (
    <Screen result={result}>
      {(dir) => (
        <div className="space-y-8">
          <div className="grid gap-3 sm:grid-cols-3" aria-label="Resumo de acesso">
            <KpiCard icon={<UsersRound className="size-4" aria-hidden />} label="Usuários" value={dir.profiles.length} />
            <KpiCard icon={<Building2 className="size-4" aria-hidden />} label="Órgãos e empresas" value={dir.councils.length} />
            <KpiCard icon={<Link2 className="size-4" aria-hidden />} label="Vínculos ativos" value={dir.memberships.length} />
          </div>
          <ProvisionCouncilForm councils={dir.councils.filter((c) => c.active).map((c) => ({ value: c.id, label: c.acronym }))} />
          <SimpleTable
            caption="Vínculos de conselho"
            rows={dir.memberships.map((m) => ({
              id: `${m.userId}:${m.councilId}`,
              user: m.userName,
              council: m.councilLabel,
              role: dir.roles.find((r) => r.value === m.role)?.label ?? m.role,
            }))}
            columns={[{ key: "user", header: "Usuário" }, { key: "council", header: "Órgão ou empresa" }, { key: "role", header: "Papel" }]}
            filterKeys={[{ key: "council", label: "Órgão ou empresa" }, { key: "role", label: "Papel" }]}
            emptyTitle="Nenhum vínculo"
            emptyDescription="Sem vínculo, o usuário autenticado não opera nenhum órgão ou empresa."
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
          <StaffCategoryForm users={dir.profiles.map((p) => ({ value: p.id, label: `${p.fullName || p.id.slice(0, 8)} · ${p.staffCategory === "intern" ? "Estagiário" : p.staffCategory === "collaborator" ? "Colaborador" : "Não classificado"}` }))} />
        </div>
      )}
    </Screen>
  );
}

export default function UsersPage() {
  return (
    <>
      <PageHeader eyebrow="Administração · Acesso" backHref="/administracao" backLabel="Voltar para Administração" title="Usuários e vínculos" description="Consulte quem pode acessar cada órgão ou empresa e ajuste os respectivos papéis." />
      <Suspense fallback={<LoadingState />}><Content /></Suspense>
    </>
  );
}
