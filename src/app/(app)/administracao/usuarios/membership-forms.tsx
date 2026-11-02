"use client";

import { assignMembershipFormAction, removeMembershipFormAction } from "@/modules/identity/council-actions";
import { ActionForm } from "@/shared/ui/forms/action-form";
import { SelectField } from "@/shared/ui/forms/fields";

type Option = { value: string; label: string };

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
                <SelectField name="councilId" label="Conselho" required options={councils} errors={e.councilId} />
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
