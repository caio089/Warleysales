-- Novos perfis por órgão e data civil da sessão pública.
alter type public.council_role add value 'director';
alter type public.council_role add value 'request_collaborator';
alter type public.council_role add value 'purchasing_collaborator';

alter table public.administrative_processes add column public_session_date date;

-- A coluna derivada permite montar o índice na mesma transação do bundle,
-- antes de os novos valores do enum poderem ser usados em predicados.
alter table public.council_memberships
  add column is_director boolean not null default false;

create function private.check_staff_membership() returns trigger
language plpgsql set search_path = '' as $$
begin
  -- Serializa os vínculos independentes da mesma conta.
  perform 1 from public.profiles where id = new.user_id for update;
  if exists (
    select 1 from public.council_memberships m
    where m.user_id = new.user_id and m.council_id <> new.council_id
      and (
        m.role::text in ('director', 'request_collaborator', 'purchasing_collaborator')
        or new.role::text in ('director', 'request_collaborator', 'purchasing_collaborator')
      )
  ) then
    raise check_violation using message = 'Este perfil deve ficar vinculado a um único órgão.';
  end if;
  new.is_director := new.role::text = 'director';
  return new;
end $$;

create trigger check_staff_membership
before insert or update on public.council_memberships
for each row execute function private.check_staff_membership();

create unique index council_memberships_one_director
  on public.council_memberships(council_id) where is_director;

-- Mantém o acesso dos colaboradores normais apenas às solicitações do órgão.
create or replace function private.has_council_access(target_council uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select private.is_central_admin() or exists (
    select 1 from public.council_memberships m
    join public.profiles p on p.id = m.user_id
    where m.user_id = (select auth.uid()) and m.council_id = target_council and p.active
      and m.role::text <> 'request_collaborator')
$$;

create function private.has_request_access(target_council uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select private.is_central_admin() or exists (
    select 1 from public.council_memberships m
    join public.profiles p on p.id = m.user_id
    where m.user_id = (select auth.uid()) and m.council_id = target_council and p.active)
$$;
revoke all on function private.has_request_access(uuid) from public, anon;
grant execute on function private.has_request_access(uuid) to authenticated;

alter policy purchase_requests_select on public.purchase_requests
  using (private.has_request_access(council_id));
alter policy councils_select on public.councils
  using (private.has_request_access(id));
