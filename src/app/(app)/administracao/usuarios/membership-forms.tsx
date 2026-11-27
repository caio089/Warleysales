"use client";

import { startTransition, useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { assignMembershipFormAction, removeMembershipFormAction, setStaffCategoryFormAction } from "@/modules/identity/council-actions";
import { provisionCouncilAccess } from "@/modules/identity/provision-action";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { SelectField } from "@/shared/ui/forms/fields";

import { COUNCIL_ROLES, COUNCIL_ROLE_LABELS } from "@/shared/lib/authz/navigation";
import { STAFF_CATEGORIES, STAFF_CATEGORY_LABELS } from "@/modules/identity/schemas";

type Option = { value: string; label: string };

function ProvisionCouncilForm({ councils }: { councils: Option[] }) {
  const [state, action, pending] = useActionState<Awaited<ReturnType<typeof provisionCouncilAccess>> | null, FormData>(
    provisionCouncilAccess,
    null,
  );
  const [linkNow, setLinkNow] = useState(false);
  return (
    <div>
      <form onSubmit={(event) => {
        event.preventDefault();
        if (pending) return;
        const form = new FormData(event.currentTarget);
        startTransition(() => action(form));
      }} className="space-y-3">
        <label className="block text-sm">
          Nome completo
          <Input name="fullName" autoComplete="off" minLength={2} maxLength={120} required />
        </label>
        <label className="block text-sm">
          E-mail (opcional)
          <Input type="email" name="email" autoComplete="off" />
        </label>
        <p className="text-sm text-muted-foreground">Se deixar em branco, o sistema gera um e-mail de login sem caixa postal. Use um e-mail real para permitir a recuperação de senha por e-mail.</p>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="linkNow" checked={linkNow} onChange={(event) => setLinkNow(event.target.checked)} />
          Vincular a um órgão ou empresa agora
        </label>
        {linkNow && <>
          <SelectField name="councilId" label="Órgão ou empresa" required options={councils} />
          <SelectField name="role" label="Papel" required options={COUNCIL_ROLES.map((value) => ({ value, label: COUNCIL_ROLE_LABELS[value] }))} />
        </>}
        <Button type="submit" disabled={pending || (linkNow && councils.length === 0)}>{pending ? "Criando…" : "Criar acesso e gerar senha"}</Button>
      </form>
      {!pending && state?.status === "error" && <p role="alert" className="mt-3 text-sm">{state.message}</p>}
      {!pending && state?.status === "success" && state.data && (
        <div role="status" className="mt-3 rounded-md border p-3 text-sm">
          <p>{state.data.email}</p>
          <label className="block">Senha inicial <Input readOnly value={state.data.password} /></label>
          <p className="mt-2">Copie a senha agora. Ela não será exibida novamente após sair desta página.</p>
        </div>
      )}
    </div>
  );
}

export function MembershipForms({
  users,
  councils,
  roles,
  memberships,
  creationCouncils,
}: {
  users: Option[];
  councils: Option[];
  roles: Option[];
  memberships: Option[];
  creationCouncils?: Option[];
}) {
  const [createAccount, setCreateAccount] = useState(false);
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section id="vincular-usuario" aria-labelledby="vincular" className="surface-card p-6">
        <h2 id="vincular" className="mb-1 font-heading text-lg font-medium tracking-tight text-primary">Vincular usuário</h2>
        {creationCouncils && (
          <fieldset className="mb-4 flex flex-wrap gap-4 text-sm">
            <legend className="sr-only">Tipo de cadastro</legend>
            <label className="flex items-center gap-2">
              <input type="radio" name="account-mode" checked={!createAccount} onChange={() => setCreateAccount(false)} />
              Usuário existente
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="account-mode" checked={createAccount} onChange={() => setCreateAccount(true)} />
              Criar usuário
            </label>
          </fieldset>
        )}
        {createAccount && creationCouncils ? (
          <ProvisionCouncilForm councils={creationCouncils} />
        ) : users.length === 0 || councils.length === 0 ? (
          <p className="text-sm text-muted-foreground">É preciso ter um usuário cadastrado e uma organização para criar o vínculo.</p>
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
        <SelectField name="category" label="Classificação" required options={STAFF_CATEGORIES.map((value) => ({ value, label: STAFF_CATEGORY_LABELS[value] }))} errors={errors.category} />
      </>}
    </ActionForm>
  </section>;
}
