"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { assignMembershipFormAction, removeMembershipFormAction, setStaffCategoryFormAction } from "@/modules/identity/council-actions";
import { provisionCouncilAccess } from "@/modules/identity/provision-action";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { SelectField } from "@/shared/ui/forms/fields";

type Option = { value: string; label: string };

export function ProvisionCouncilForm({ councils }: { councils: Option[] }) {
  const [state, action, pending] = useActionState<Awaited<ReturnType<typeof provisionCouncilAccess>> | null, FormData>(
    provisionCouncilAccess,
    null,
  );
  return (
    <section className="surface-card p-6" aria-labelledby="criar-acesso">
      <h2 id="criar-acesso" className="mb-3 font-heading text-lg font-medium text-primary">Criar acesso para um órgão</h2>
      <form action={action} className="space-y-3">
        <label className="block text-sm">
          E-mail do órgão
          <Input type="email" name="email" autoComplete="off" required />
        </label>
        <SelectField name="councilId" label="Órgão ou empresa" required options={councils} />
        <Button disabled={pending || councils.length === 0}>{pending ? "Criando…" : "Criar acesso e gerar senha"}</Button>
      </form>
      {state?.status === "error" && <p role="alert" className="mt-3 text-sm">{state.message}</p>}
      {state?.status === "success" && state.data && (
        <div role="status" className="mt-3 rounded-md border p-3 text-sm">
          <p>{state.data.email}</p>
          <label className="block">Senha inicial <Input readOnly value={state.data.password} /></label>
          <p className="mt-2">Copie a senha agora. Ela não será exibida novamente após sair desta página.</p>
        </div>
      )}
    </section>
  );
}

export function MembershipForms({
  users,
  councils,
  roles,
  memberships,
}: {
  users: Option[];
  councils: Option[];
  roles: Option[];
  memberships: Option[];
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section aria-labelledby="vincular" className="surface-card p-6">
        <h2 id="vincular" className="mb-1 font-heading text-lg font-medium tracking-tight text-primary">Vincular usuário</h2>
        <p className="mb-4 text-sm text-muted-foreground">O convite continua no Auth. Aqui só se define o conselho e o papel.</p>
        {users.length === 0 || councils.length === 0 ? (
          <p className="text-sm text-muted-foreground">Cadastre um conselho e convide o usuário no Auth antes de vincular.</p>
        ) : (
          <ActionForm action={assignMembershipFormAction} submitLabel="Salvar vínculo">
            {(e) => (
              <>
                <SelectField name="userId" label="Usuário" required options={users} errors={e.userId} />
                <SelectField name="councilId" label="Órgão ou empresa" required options={councils} errors={e.councilId} />
                <SelectField name="role" label="Papel" required options={roles} errors={e.role} />
              </>
            )}
          </ActionForm>
        )}
      </section>
      {memberships.length > 0 ? (
        <section aria-labelledby="remover" className="surface-card p-6">
          <h2 id="remover" className="mb-4 font-heading text-lg font-medium tracking-tight text-primary">Remover vínculo</h2>
          <ActionForm action={removeMembershipFormAction} submitLabel="Remover" submitVariant="destructive">
            {(e) => <SelectField name="membershipKey" label="Vínculo" required options={memberships} errors={e.userId ?? e.councilId} />}
          </ActionForm>
        </section>
      ) : null}
    </div>
  );
}

export function StaffCategoryForm({ users }: { users: Option[] }) {
  return <section className="surface-card p-6">
    <h2 className="mb-3 font-heading text-lg font-medium text-primary">Classificação para relatórios de equipe</h2>
    <ActionForm action={setStaffCategoryFormAction} submitLabel="Salvar classificação">
      {(errors) => <>
        <SelectField name="userId" label="Usuário" required options={users} errors={errors.userId} />
        <SelectField name="category" label="Classificação" required options={[{ value: "unclassified", label: "Não classificado" }, { value: "collaborator", label: "Colaborador" }, { value: "intern", label: "Estagiário" }]} errors={errors.category} />
      </>}
    </ActionForm>
  </section>;
}
