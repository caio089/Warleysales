-- Migration 0001: identidade, conselhos, vínculos, auditoria.
-- Autorização NUNCA usa user_metadata (editável pelo usuário).

create type public.council_role as enum ('council_manager', 'council_operator', 'viewer');

-- Perfil 1:1 com auth.users. is_special_deleter só é alterável via service_role/SQL manual.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  is_central_admin boolean not null default false,
  is_special_deleter boolean not null default false, -- exclusivo do Warley (P1)
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.councils (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  acronym text not null check (length(trim(acronym)) > 0),
  responsible_user_id uuid references public.profiles (id),
  institutional_info text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (acronym)
);

create table public.council_memberships (
  user_id uuid not null references public.profiles (id) on delete cascade,
  council_id uuid not null references public.councils (id) on delete cascade,
  role public.council_role not null,
  created_at timestamptz not null default now(),
  primary key (user_id, council_id)
);
create index on public.council_memberships (council_id);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles (id),
  action text not null,
  entity text not null,
  entity_id text,
  council_id uuid references public.councils (id),
  result text not null default 'success' check (result in ('success', 'denied', 'error')),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index on public.audit_logs (council_id, created_at desc);
create index on public.audit_logs (entity, entity_id);

-- Trigger genérico de updated_at
create function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger trg_profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger trg_councils_touch before update on public.councils
  for each row execute function public.touch_updated_at();

-- Cria o perfil automaticamente (sem privilégios) ao criar usuário no Auth.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end $$;
revoke all on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helpers de autorização (leem apenas tabelas protegidas, nunca metadados do JWT).
create function public.is_central_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select p.is_central_admin and p.active
                   from public.profiles p where p.id = (select auth.uid())), false)
$$;

create function public.has_council_access(target_council uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select public.is_central_admin() or exists (
    select 1 from public.council_memberships m
    join public.profiles p on p.id = m.user_id
    where m.user_id = (select auth.uid()) and m.council_id = target_council and p.active)
$$;

create function public.has_council_role(target_council uuid, allowed public.council_role[])
returns boolean
language sql stable security definer set search_path = '' as $$
  select public.is_central_admin() or exists (
    select 1 from public.council_memberships m
    join public.profiles p on p.id = m.user_id
    where m.user_id = (select auth.uid()) and m.council_id = target_council
      and m.role = any (allowed) and p.active)
$$;

revoke all on function public.is_central_admin() from public, anon;
revoke all on function public.has_council_access(uuid) from public, anon;
revoke all on function public.has_council_role(uuid, public.council_role[]) from public, anon;
grant execute on function public.is_central_admin() to authenticated;
grant execute on function public.has_council_access(uuid) to authenticated;
grant execute on function public.has_council_role(uuid, public.council_role[]) to authenticated;

-- RLS
alter table public.profiles enable row level security;
alter table public.councils enable row level security;
alter table public.council_memberships enable row level security;
alter table public.audit_logs enable row level security;

-- profiles: o próprio usuário ou admin central lê; ninguém altera flags de privilégio via API.
create policy profiles_select on public.profiles for select to authenticated
  using (id = (select auth.uid()) or public.is_central_admin());
create policy profiles_update_self on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
-- Bloqueia escalada de privilégio: colunas sensíveis só via service_role.
revoke update on public.profiles from authenticated;
grant update (full_name) on public.profiles to authenticated;

create policy councils_select on public.councils for select to authenticated
  using (public.has_council_access(id));
create policy councils_admin_write on public.councils for all to authenticated
  using (public.is_central_admin()) with check (public.is_central_admin());

create policy memberships_select on public.council_memberships for select to authenticated
  using (user_id = (select auth.uid()) or public.is_central_admin());
create policy memberships_admin_write on public.council_memberships for all to authenticated
  using (public.is_central_admin()) with check (public.is_central_admin());

-- audit_logs: leitura por admin central ou gestor do conselho; escrita só por serviço (service_role).
create policy audit_select on public.audit_logs for select to authenticated
  using (public.is_central_admin()
         or (council_id is not null
             and public.has_council_role(council_id, array['council_manager']::public.council_role[])));
revoke insert, update, delete on public.audit_logs from authenticated, anon;
