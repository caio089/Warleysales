-- GERADO por scripts/bundle-migrations.mjs — não edite; edite supabase/migrations/*.sql e regenere.
-- Aplicar UMA vez em projeto novo/vazio (SQL Editor). Roda tudo em uma transação: falhou = nada é aplicado.
begin;

-- ===== 20261102000001_identity.sql =====
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

-- Schema privado: NÃO exposto pela Data API (PostgREST). Os helpers SECURITY DEFINER ficam aqui para não
-- virarem RPCs públicas (advisor 0029). As políticas RLS os chamam como o usuário autenticado (usage + execute).
create schema private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated, service_role;

-- Helpers de autorização (leem apenas tabelas protegidas, nunca metadados do JWT).
create function private.is_central_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select p.is_central_admin and p.active
                   from public.profiles p where p.id = (select auth.uid())), false)
$$;

create function private.has_council_access(target_council uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select private.is_central_admin() or exists (
    select 1 from public.council_memberships m
    join public.profiles p on p.id = m.user_id
    where m.user_id = (select auth.uid()) and m.council_id = target_council and p.active)
$$;

create function private.has_council_role(target_council uuid, allowed public.council_role[])
returns boolean
language sql stable security definer set search_path = '' as $$
  select private.is_central_admin() or exists (
    select 1 from public.council_memberships m
    join public.profiles p on p.id = m.user_id
    where m.user_id = (select auth.uid()) and m.council_id = target_council
      and m.role = any (allowed) and p.active)
$$;

revoke all on function private.is_central_admin() from public, anon;
revoke all on function private.has_council_access(uuid) from public, anon;
revoke all on function private.has_council_role(uuid, public.council_role[]) from public, anon;
grant execute on function private.is_central_admin() to authenticated;
grant execute on function private.has_council_access(uuid) to authenticated;
grant execute on function private.has_council_role(uuid, public.council_role[]) to authenticated;

-- RLS
alter table public.profiles enable row level security;
alter table public.councils enable row level security;
alter table public.council_memberships enable row level security;
alter table public.audit_logs enable row level security;

-- profiles: o próprio usuário ou admin central lê; ninguém altera flags de privilégio via API.
create policy profiles_select on public.profiles for select to authenticated
  using (id = (select auth.uid()) or private.is_central_admin());
create policy profiles_update_self on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
-- Bloqueia escalada de privilégio: colunas sensíveis só via service_role.
revoke update on public.profiles from authenticated;
grant update (full_name) on public.profiles to authenticated;

create policy councils_select on public.councils for select to authenticated
  using (private.has_council_access(id));
create policy councils_admin_write on public.councils for all to authenticated
  using (private.is_central_admin()) with check (private.is_central_admin());

create policy memberships_select on public.council_memberships for select to authenticated
  using (user_id = (select auth.uid()) or private.is_central_admin());
create policy memberships_admin_write on public.council_memberships for all to authenticated
  using (private.is_central_admin()) with check (private.is_central_admin());

-- audit_logs: leitura por admin central ou gestor do conselho; escrita só por serviço (service_role).
create policy audit_select on public.audit_logs for select to authenticated
  using (private.is_central_admin()
         or (council_id is not null
             and private.has_council_role(council_id, array['council_manager']::public.council_role[])));
revoke insert, update, delete on public.audit_logs from authenticated, anon;

-- ===== 20261102000002_domain_tables.sql =====
-- Migration 0002: tabelas de domínio (processos, anexos, retenção, estoque, atas, contratos,
-- compras, transferências, fornecedores, reuniões, notificações, jobs).
-- Convenções: valores monetários numeric(15,2); quantidades numeric(15,3); vigências em date;
-- eventos em timestamptz. Mudanças de estado passam pelos serviços; o banco garante integridade.

-- ───────────── Processos e documentos ─────────────
create table public.document_types (
  code text primary key,
  name text not null,
  position smallint not null unique
);

create table public.administrative_processes (
  id uuid primary key default gen_random_uuid(),
  council_id uuid not null references public.councils (id),
  sequence integer not null check (sequence > 0),
  year integer not null check (year between 2000 and 2100),
  number text not null check (number ~ '^\d{1,6}/\d{4}$'),
  title text not null check (length(trim(title)) >= 3),
  status text not null default 'em_andamento'
    check (status in ('em_andamento', 'aguardando_providencia', 'concluido', 'cancelado', 'arquivado')),
  documental_completed_at timestamptz,
  documental_snapshot jsonb,
  closing_report_registered boolean not null default false,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  unique (council_id, number) -- P4: numeração por conselho (número já contém o ano)
);
create index on public.administrative_processes (council_id, created_at desc);

create table public.attachments (
  id uuid primary key default gen_random_uuid(),
  process_id uuid not null references public.administrative_processes (id),
  council_id uuid not null references public.councils (id),
  type_code text not null references public.document_types (code),
  file_name text not null,
  mime text not null,
  size bigint not null check (size > 0 and size <= 26214400),
  sha256 text not null check (sha256 ~ '^[0-9a-f]{64}$'),
  storage_path text not null unique,
  uploaded_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  link_status text not null default 'active' check (link_status in ('active', 'replaced', 'archived', 'disposed')),
  upload_status text not null default 'pending' check (upload_status in ('pending', 'confirmed', 'failed')),
  retention_state text not null default 'retained' check (retention_state in ('retained', 'archived', 'disposed'))
);
create index on public.attachments (process_id);

create table public.retention_authorizations (
  id uuid primary key default gen_random_uuid(),
  process_id uuid not null references public.administrative_processes (id),
  authorized_by uuid not null references public.profiles (id),
  reference text not null check (length(trim(reference)) > 0),
  created_at timestamptz not null default now()
);
create index on public.retention_authorizations (process_id);

create table public.retention_holds (
  id uuid primary key default gen_random_uuid(),
  process_id uuid not null references public.administrative_processes (id),
  reason text not null check (length(trim(reason)) > 0),
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  released_at timestamptz
);
create index on public.retention_holds (process_id) where released_at is null;

-- Execuções de limpeza: a chave primária garante idempotência por conclusão.
create table public.document_cleanup_runs (
  key text primary key,
  process_id uuid not null references public.administrative_processes (id),
  outcome text not null check (outcome in ('archived', 'disposed', 'skipped')),
  at timestamptz not null
);

-- ───────────── Fornecedores ─────────────
create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) >= 2),
  cnpj text unique check (cnpj is null or cnpj ~ '^\d{14}$'), -- P8: único quando informado
  email text,
  phone text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ───────────── Estoque ─────────────
create table public.materials (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  unit text not null,
  active boolean not null default true
);

create table public.stock_balances (
  council_id uuid not null references public.councils (id),
  material_id uuid not null references public.materials (id),
  physical numeric(15,3) not null default 0 check (physical >= 0),
  reserved numeric(15,3) not null default 0 check (reserved >= 0),
  minimum numeric(15,3) not null default 0 check (minimum >= 0),
  version integer not null default 0, -- controle otimista usado por apply_stock_mutation
  updated_at timestamptz not null default now(),
  primary key (council_id, material_id),
  check (reserved <= physical)
);

create table public.stock_movements (
  id bigint generated always as identity primary key,
  council_id uuid not null references public.councils (id),
  material_id uuid not null references public.materials (id),
  type text not null check (type in ('entry', 'consumption', 'adjustment_in', 'adjustment_out', 'transfer_out', 'transfer_in')),
  quantity numeric(15,3) not null check (quantity > 0),
  idempotency_key text not null,
  reason text not null default '',
  reference text,
  actor_id uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  unique (council_id, material_id, idempotency_key)
);
create index on public.stock_movements (council_id, material_id, created_at);

-- ───────────── Atas de registro de preços ─────────────
create table public.price_registration_atas (
  id uuid primary key default gen_random_uuid(),
  council_id uuid not null references public.councils (id),
  number text not null,
  supplier_id uuid references public.suppliers (id),
  start_date date not null,
  status text not null default 'rascunho' check (status in ('rascunho', 'vigente')),
  created_at timestamptz not null default now(),
  unique (council_id, number)
);

create table public.ata_items (
  seq bigint generated always as identity, -- preserva a ordem de inclusão
  id uuid primary key default gen_random_uuid(),
  ata_id uuid not null references public.price_registration_atas (id),
  description text not null,
  material_id uuid references public.materials (id),
  registered_quantity numeric(15,3) not null check (registered_quantity > 0),
  unit_price numeric(15,2) not null check (unit_price >= 0)
);
create index on public.ata_items (ata_id);

create table public.ata_allocations (
  item_id uuid not null references public.ata_items (id),
  council_id uuid not null references public.councils (id),
  quantity numeric(15,3) not null check (quantity > 0),
  primary key (item_id, council_id)
);

create table public.ata_extensions (
  ata_id uuid not null references public.price_registration_atas (id),
  position integer not null,
  requested_by uuid not null references public.profiles (id),
  previous_end_date date not null,
  new_end_date date not null check (new_end_date > previous_end_date),
  legal_basis text not null check (length(trim(legal_basis)) > 0),
  primary key (ata_id, position)
);

-- Ledger de comprometimento (append-only): saldo = registrada − comprometida (R9).
create table public.ata_commitments (
  id bigint generated always as identity primary key,
  item_id uuid not null references public.ata_items (id),
  event_type text not null check (event_type in ('commit', 'release')),
  quantity numeric(15,3) not null check (quantity > 0),
  council_id uuid not null references public.councils (id),
  legal_basis text,
  created_at timestamptz not null default now(),
  check (event_type <> 'release' or (legal_basis is not null and length(trim(legal_basis)) > 0))
);
create index on public.ata_commitments (item_id);

-- ───────────── Contratos ─────────────
create table public.contracts (
  id uuid primary key default gen_random_uuid(),
  council_id uuid not null references public.councils (id),
  number text not null,
  supplier_id uuid references public.suppliers (id),
  object text not null,
  start_date date not null,
  end_date date not null,
  value numeric(15,2) not null check (value >= 0),
  created_at timestamptz not null default now(),
  check (end_date >= start_date),
  unique (council_id, number)
);

-- Aditivos guardam valores anteriores e novos (R16); append-only.
create table public.contract_amendments (
  contract_id uuid not null references public.contracts (id),
  sequence integer not null,
  reason text not null,
  signed_at date not null,
  previous_start_date date not null,
  previous_end_date date not null,
  previous_value numeric(15,2) not null,
  next_start_date date not null,
  next_end_date date not null,
  next_value numeric(15,2) not null check (next_value >= 0),
  primary key (contract_id, sequence)
);

-- ───────────── Solicitações de compra ─────────────
create table public.purchase_requests (
  id uuid primary key default gen_random_uuid(),
  council_id uuid not null references public.councils (id),
  title text not null,
  status text not null,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);
create index on public.purchase_requests (council_id, created_at desc);

create table public.purchase_request_items (
  seq bigint generated always as identity, -- preserva a ordem de inclusão
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.purchase_requests (id),
  material_id uuid not null references public.materials (id),
  quantity numeric(15,3) not null check (quantity > 0),
  ata_item_id uuid references public.ata_items (id),
  received_total numeric(15,3) not null default 0 check (received_total >= 0)
);
create index on public.purchase_request_items (request_id);

create table public.purchase_request_events (
  request_id uuid not null references public.purchase_requests (id),
  position integer not null,
  from_status text,
  to_status text not null,
  actor_id uuid not null references public.profiles (id),
  at timestamptz not null,
  note text,
  primary key (request_id, position)
);

create table public.purchase_receipt_keys (
  request_id uuid not null references public.purchase_requests (id),
  receipt_key text not null,
  primary key (request_id, receipt_key)
);

-- ───────────── Transferências ─────────────
create table public.stock_transfers (
  id uuid primary key default gen_random_uuid(),
  origin_council_id uuid not null references public.councils (id),
  destination_council_id uuid not null references public.councils (id),
  status text not null,
  created_at timestamptz not null default now(),
  check (origin_council_id <> destination_council_id)
);

create table public.stock_transfer_items (
  seq bigint generated always as identity, -- preserva a ordem de inclusão
  transfer_id uuid not null references public.stock_transfers (id),
  material_id uuid not null references public.materials (id),
  quantity numeric(15,3) not null check (quantity > 0),
  received_quantity numeric(15,3) check (received_quantity is null or received_quantity >= 0),
  primary key (transfer_id, material_id)
);

create table public.stock_transfer_events (
  transfer_id uuid not null references public.stock_transfers (id),
  position integer not null,
  from_status text,
  to_status text not null,
  actor_id uuid not null references public.profiles (id),
  at timestamptz not null,
  note text,
  primary key (transfer_id, position)
);

-- ───────────── Reuniões (ata de REUNIÃO, R8) ─────────────
create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  council_id uuid not null references public.councils (id),
  title text not null,
  scheduled_at timestamptz not null,
  status text not null check (status in ('agendada', 'realizada', 'cancelada', 'reagendada')),
  minutes_text text,
  minutes_registered_by uuid references public.profiles (id),
  minutes_registered_at timestamptz,
  created_by uuid not null references public.profiles (id)
);
create index on public.meetings (council_id, scheduled_at);

create table public.meeting_action_items (
  seq bigint generated always as identity, -- preserva a ordem de inclusão
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings (id),
  description text not null,
  responsible_id uuid references public.profiles (id),
  due_date date,
  done boolean not null default false
);

-- ───────────── Notificações e jobs ─────────────
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles (id),
  dedup_key text not null unique, -- H7: (tipo, entidade, destinatário, marco)
  entity_type text not null check (entity_type in ('ata', 'contract')),
  entity_id uuid not null,
  milestone integer not null,
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index on public.notifications (recipient_id, created_at desc);

create table public.scheduled_job_runs (
  job_name text not null,
  window_key text not null,
  status text not null default 'running' check (status in ('running', 'success', 'failed')),
  started_at timestamptz not null,
  finished_at timestamptz,
  summary jsonb,
  primary key (job_name, window_key) -- lock/idempotência por janela diária
);

-- ===== 20261102000003_functions_and_triggers.sql =====
-- Migration 0003: funções transacionais (RPC), triggers de append-only e visão de progresso.
-- As RPCs são executadas SOMENTE pelo service_role (servidor); a autorização de negócio fica nos serviços.

-- ───────────── Append-only ─────────────
create function public.forbid_mutation() returns trigger
language plpgsql set search_path = '' as $$
begin
  raise exception 'Registro imutável: % em % não é permitido.', tg_op, tg_table_name using errcode = '42501';
end $$;

create trigger trg_audit_logs_immutable before update or delete on public.audit_logs
  for each row execute function public.forbid_mutation();
create trigger trg_stock_movements_immutable before update or delete on public.stock_movements
  for each row execute function public.forbid_mutation();
create trigger trg_ata_commitments_immutable before update or delete on public.ata_commitments
  for each row execute function public.forbid_mutation();
create trigger trg_contract_amendments_immutable before update or delete on public.contract_amendments
  for each row execute function public.forbid_mutation();
create trigger trg_ata_extensions_immutable before update or delete on public.ata_extensions
  for each row execute function public.forbid_mutation();

-- ───────────── Estoque: aplica saldo + ledger de forma atômica (H2) ─────────────
-- Retorna 'ok' ou 'conflict' (outra transação alterou o saldo: o chamador relê e tenta de novo).
create function public.apply_stock_mutation(
  p_council uuid, p_material uuid, p_expected_version integer,
  p_physical numeric, p_reserved numeric, p_movement jsonb
) returns text
language plpgsql set search_path = '' as $$
declare
  v_version integer;
begin
  insert into public.stock_balances (council_id, material_id)
  values (p_council, p_material) on conflict do nothing;

  select version into v_version from public.stock_balances
   where council_id = p_council and material_id = p_material for update;
  if v_version <> p_expected_version then return 'conflict'; end if;

  if p_movement is not null then
    -- A UNIQUE (conselho, material, chave) barra reenvio; violação => 'conflict' (relê e vê a chave).
    begin
      insert into public.stock_movements (council_id, material_id, type, quantity, idempotency_key, reason, reference, actor_id)
      values (p_council, p_material, p_movement ->> 'type', (p_movement ->> 'quantity')::numeric,
              p_movement ->> 'idempotency_key', coalesce(p_movement ->> 'reason', ''),
              p_movement ->> 'reference', nullif(p_movement ->> 'actor_id', '')::uuid);
    exception when unique_violation then
      return 'conflict';
    end;
  end if;

  update public.stock_balances
     set physical = p_physical, reserved = p_reserved, version = version + 1, updated_at = now()
   where council_id = p_council and material_id = p_material;
  return 'ok';
end $$;

-- ───────────── Ata: grava evento sob lock do item (H3) ─────────────
-- A validação de saldo ocorre no serviço sobre o ledger lido; aqui garantimos que o ledger não mudou.
create function public.append_commitment_event(p_item uuid, p_expected_count integer, p_event jsonb)
returns text
language plpgsql set search_path = '' as $$
declare
  v_count integer;
begin
  perform 1 from public.ata_items where id = p_item for update;
  select count(*) into v_count from public.ata_commitments where item_id = p_item;
  if v_count <> p_expected_count then return 'conflict'; end if;
  insert into public.ata_commitments (item_id, event_type, quantity, council_id, legal_basis)
  values (p_item, p_event ->> 'event_type', (p_event ->> 'quantity')::numeric,
          (p_event ->> 'council_id')::uuid, nullif(p_event ->> 'legal_basis', ''));
  return 'ok';
end $$;

-- ───────────── Persistência de agregados (uma transação por chamada) ─────────────
create function public.save_ata(p jsonb) returns void
language plpgsql set search_path = '' as $$
begin
  insert into public.price_registration_atas (id, council_id, number, supplier_id, start_date, status, created_at)
  values ((p ->> 'id')::uuid, (p ->> 'council_id')::uuid, p ->> 'number', nullif(p ->> 'supplier_id', '')::uuid,
          (p ->> 'start_date')::date, p ->> 'status', (p ->> 'created_at')::timestamptz)
  on conflict (id) do update set status = excluded.status, supplier_id = excluded.supplier_id;

  insert into public.ata_items (id, ata_id, description, material_id, registered_quantity, unit_price)
  select x.id, (p ->> 'id')::uuid, x.description, x.material_id, x.registered_quantity, x.unit_price
    from jsonb_to_recordset(p -> 'items') as x(id uuid, description text, material_id uuid, registered_quantity numeric, unit_price numeric)
  on conflict (id) do nothing; -- itens não são alterados após criados (ledger depende deles)

  delete from public.ata_allocations where item_id in (select id from public.ata_items where ata_id = (p ->> 'id')::uuid);
  insert into public.ata_allocations (item_id, council_id, quantity)
  select (i ->> 'id')::uuid, (a ->> 'council_id')::uuid, (a ->> 'quantity')::numeric
    from jsonb_array_elements(p -> 'items') i, jsonb_array_elements(i -> 'allocations') a;

  insert into public.ata_extensions (ata_id, position, requested_by, previous_end_date, new_end_date, legal_basis)
  select (p ->> 'id')::uuid, e.ordinality - 1, (e.value ->> 'requested_by')::uuid,
         (e.value ->> 'previous_end_date')::date, (e.value ->> 'new_end_date')::date, e.value ->> 'legal_basis'
    from jsonb_array_elements(p -> 'extensions') with ordinality e
  on conflict do nothing;
end $$;

create function public.save_contract(p jsonb) returns void
language plpgsql set search_path = '' as $$
begin
  insert into public.contracts (id, council_id, number, supplier_id, object, start_date, end_date, value, created_at)
  values ((p ->> 'id')::uuid, (p ->> 'council_id')::uuid, p ->> 'number', nullif(p ->> 'supplier_id', '')::uuid,
          p ->> 'object', (p ->> 'start_date')::date, (p ->> 'end_date')::date, (p ->> 'value')::numeric,
          (p ->> 'created_at')::timestamptz)
  on conflict (id) do update set supplier_id = excluded.supplier_id; -- termos originais nunca mudam (R16)

  insert into public.contract_amendments (contract_id, sequence, reason, signed_at,
    previous_start_date, previous_end_date, previous_value, next_start_date, next_end_date, next_value)
  select (p ->> 'id')::uuid, (a ->> 'sequence')::integer, a ->> 'reason', (a ->> 'signed_at')::date,
         (a ->> 'previous_start_date')::date, (a ->> 'previous_end_date')::date, (a ->> 'previous_value')::numeric,
         (a ->> 'next_start_date')::date, (a ->> 'next_end_date')::date, (a ->> 'next_value')::numeric
    from jsonb_array_elements(p -> 'amendments') a
  on conflict do nothing;
end $$;

create function public.save_purchase_request(p jsonb) returns void
language plpgsql set search_path = '' as $$
begin
  insert into public.purchase_requests (id, council_id, title, status, created_by, created_at)
  values ((p ->> 'id')::uuid, (p ->> 'council_id')::uuid, p ->> 'title', p ->> 'status',
          (p ->> 'created_by')::uuid, (p ->> 'created_at')::timestamptz)
  on conflict (id) do update set status = excluded.status, title = excluded.title;

  insert into public.purchase_request_items (id, request_id, material_id, quantity, ata_item_id, received_total)
  select x.id, (p ->> 'id')::uuid, x.material_id, x.quantity, x.ata_item_id, x.received_total
    from jsonb_to_recordset(p -> 'items') as x(id uuid, material_id uuid, quantity numeric, ata_item_id uuid, received_total numeric)
  on conflict (id) do update set received_total = excluded.received_total;

  insert into public.purchase_request_events (request_id, position, from_status, to_status, actor_id, at, note)
  select (p ->> 'id')::uuid, e.ordinality - 1, e.value ->> 'from_status', e.value ->> 'to_status',
         (e.value ->> 'actor_id')::uuid, (e.value ->> 'at')::timestamptz, e.value ->> 'note'
    from jsonb_array_elements(p -> 'events') with ordinality e
  on conflict do nothing;

  insert into public.purchase_receipt_keys (request_id, receipt_key)
  select (p ->> 'id')::uuid, k from jsonb_array_elements_text(p -> 'receipt_keys') k
  on conflict do nothing;
end $$;

create function public.save_transfer(p jsonb) returns void
language plpgsql set search_path = '' as $$
begin
  insert into public.stock_transfers (id, origin_council_id, destination_council_id, status, created_at)
  values ((p ->> 'id')::uuid, (p ->> 'origin_council_id')::uuid, (p ->> 'destination_council_id')::uuid,
          p ->> 'status', (p ->> 'created_at')::timestamptz)
  on conflict (id) do update set status = excluded.status;

  insert into public.stock_transfer_items (transfer_id, material_id, quantity, received_quantity)
  select (p ->> 'id')::uuid, x.material_id, x.quantity, x.received_quantity
    from jsonb_to_recordset(p -> 'items') as x(material_id uuid, quantity numeric, received_quantity numeric)
  on conflict (transfer_id, material_id) do update set received_quantity = excluded.received_quantity;

  insert into public.stock_transfer_events (transfer_id, position, from_status, to_status, actor_id, at, note)
  select (p ->> 'id')::uuid, e.ordinality - 1, e.value ->> 'from_status', e.value ->> 'to_status',
         (e.value ->> 'actor_id')::uuid, (e.value ->> 'at')::timestamptz, e.value ->> 'note'
    from jsonb_array_elements(p -> 'events') with ordinality e
  on conflict do nothing;
end $$;

create function public.save_meeting(p jsonb) returns void
language plpgsql set search_path = '' as $$
begin
  insert into public.meetings (id, council_id, title, scheduled_at, status, minutes_text,
                               minutes_registered_by, minutes_registered_at, created_by)
  values ((p ->> 'id')::uuid, (p ->> 'council_id')::uuid, p ->> 'title', (p ->> 'scheduled_at')::timestamptz,
          p ->> 'status', p ->> 'minutes_text', nullif(p ->> 'minutes_registered_by', '')::uuid,
          nullif(p ->> 'minutes_registered_at', '')::timestamptz, (p ->> 'created_by')::uuid)
  on conflict (id) do update set title = excluded.title, scheduled_at = excluded.scheduled_at, status = excluded.status,
    minutes_text = excluded.minutes_text, minutes_registered_by = excluded.minutes_registered_by,
    minutes_registered_at = excluded.minutes_registered_at;

  insert into public.meeting_action_items (id, meeting_id, description, responsible_id, due_date, done)
  select x.id, (p ->> 'id')::uuid, x.description, x.responsible_id, x.due_date, x.done
    from jsonb_to_recordset(p -> 'action_items') as x(id uuid, description text, responsible_id uuid, due_date date, done boolean)
  on conflict (id) do update set description = excluded.description, responsible_id = excluded.responsible_id,
    due_date = excluded.due_date, done = excluded.done;
end $$;

-- Somente o servidor (service_role) executa as RPCs.
do $$
declare fn text;
begin
  foreach fn in array array[
    'apply_stock_mutation(uuid, uuid, integer, numeric, numeric, jsonb)',
    'append_commitment_event(uuid, integer, jsonb)',
    'save_ata(jsonb)', 'save_contract(jsonb)', 'save_purchase_request(jsonb)',
    'save_transfer(jsonb)', 'save_meeting(jsonb)'] loop
    execute format('revoke all on function public.%s from public, anon, authenticated', fn);
    execute format('grant execute on function public.%s to service_role', fn);
  end loop;
end $$;

-- ───────────── Progresso documental (H6): fonte única para verificação/relatórios ─────────────
-- 7 tipos distintos com anexo ativo, confirmado e retido (R1/R2). Percentual = tipos válidos / 7.
create view public.v_process_progress with (security_invoker = true) as
select p.id as process_id,
       count(distinct a.type_code) as valid_types,
       round(count(distinct a.type_code) * 100.0 / (select count(*) from public.document_types), 2) as percent
  from public.administrative_processes p
  left join public.attachments a
    on a.process_id = p.id and a.link_status = 'active'
   and a.upload_status = 'confirmed' and a.retention_state = 'retained'
 group by p.id;

-- Reconciliação (R11): saldo físico deve ser igual à soma assinada do ledger.
create view public.v_stock_reconciliation with (security_invoker = true) as
select b.council_id, b.material_id, b.physical as balance_physical,
       coalesce(sum(case when m.type in ('entry', 'adjustment_in', 'transfer_in') then m.quantity else -m.quantity end), 0) as ledger_physical
  from public.stock_balances b
  left join public.stock_movements m on m.council_id = b.council_id and m.material_id = b.material_id
 group by b.council_id, b.material_id, b.physical;

-- ===== 20261102000004_rls_storage_seed.sql =====
-- Migration 0004: RLS por conselho, Storage privado e seed dos tipos documentais.
-- Defesa em profundidade: o app acessa via service_role (serviços já autorizam), mas qualquer acesso
-- direto com a chave publicável só enxerga dados do(s) conselho(s) do usuário, em modo somente leitura.

-- Seed dos 7 tipos (nomenclatura provisória — pendência P6)
insert into public.document_types (code, name, position) values
  ('DFD', 'Documento de Formalização da Demanda', 1),
  ('ETP', 'Estudo Técnico Preliminar', 2),
  ('MR',  'Matriz de Riscos', 3),
  ('TR',  'Termo de Referência', 4),
  ('PP',  'Pesquisa de Preços', 5),
  ('PJ',  'Parecer Jurídico', 6),
  ('ED',  'Edital', 7);

-- Habilita RLS em todas as tabelas de domínio e cria política de LEITURA por conselho.
do $$
declare t record;
begin
  for t in select unnest(array[
    'administrative_processes', 'attachments', 'stock_balances', 'stock_movements',
    'price_registration_atas', 'contracts', 'purchase_requests', 'meetings']) as name loop
    execute format('alter table public.%I enable row level security', t.name);
  end loop;
end $$;

create policy processes_select on public.administrative_processes for select to authenticated using (private.has_council_access(council_id));
create policy attachments_select on public.attachments for select to authenticated using (private.has_council_access(council_id));
create policy stock_balances_select on public.stock_balances for select to authenticated using (private.has_council_access(council_id));
create policy stock_movements_select on public.stock_movements for select to authenticated using (private.has_council_access(council_id));
create policy atas_select on public.price_registration_atas for select to authenticated using (private.has_council_access(council_id));
create policy contracts_select on public.contracts for select to authenticated using (private.has_council_access(council_id));
create policy purchase_requests_select on public.purchase_requests for select to authenticated using (private.has_council_access(council_id));
create policy meetings_select on public.meetings for select to authenticated using (private.has_council_access(council_id));

-- Tabelas filhas/auxiliares: RLS ligada SEM políticas => acesso direto negado; somente service_role lê/escreve.
do $$
declare t record;
begin
  for t in select unnest(array[
    'document_types', 'retention_authorizations', 'retention_holds', 'document_cleanup_runs', 'suppliers',
    'materials', 'ata_items', 'ata_allocations', 'ata_extensions', 'ata_commitments', 'contract_amendments',
    'purchase_request_items', 'purchase_request_events', 'purchase_receipt_keys', 'stock_transfers',
    'stock_transfer_items', 'stock_transfer_events', 'meeting_action_items', 'notifications', 'scheduled_job_runs']) as name loop
    execute format('alter table public.%I enable row level security', t.name);
  end loop;
end $$;

-- Transferências visíveis para origem e destino.
create policy transfers_select on public.stock_transfers for select to authenticated
  using (private.has_council_access(origin_council_id) or private.has_council_access(destination_council_id));

-- Notificações: cada usuário lê as suas.
create policy notifications_select on public.notifications for select to authenticated using (recipient_id = (select auth.uid()));

-- Nenhuma escrita direta pelo cliente nas tabelas de domínio.
revoke insert, update, delete on all tables in schema public from anon, authenticated;
revoke all on all functions in schema public from anon;

-- Storage privado (R15): bucket NÃO público; acesso apenas por URL assinada gerada no servidor.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('process-documents', 'process-documents', false, 26214400,
        array['application/pdf', 'image/png', 'image/jpeg',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
on conflict (id) do update set public = false;
-- Sem políticas em storage.objects para anon/authenticated => somente service_role acessa.

-- ===== 20261102000005_hardening.sql =====
-- Migration 0005: endurecimento encontrado na validação (privilégios de tabela, TRUNCATE e ledger da ata).
-- Achados corrigidos:
--  1. TRUNCATE não é barrado por RLS nem por triggers de linha: os privilégios padrão do Supabase
--     concedem ALL a anon/authenticated. Revogamos tudo e concedemos apenas SELECT onde há política RLS.
--  2. `revoke update` em nível de tabela (0004) também removeu o grant de coluna profiles.full_name: reconcedido.
--  3. Tabelas append-only agora bloqueiam TRUNCATE (trigger de comando).
--  4. append_commitment_event valida saldo no banco (defesa em profundidade contra corrida de serviços).

-- ───────────── 1. Privilégios mínimos para as roles da Data API ─────────────
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from public, anon, authenticated;

-- Somente leitura, e apenas das tabelas que possuem política de SELECT (o RLS ainda filtra por conselho).
do $$
declare t record;
begin
  for t in select distinct tablename from pg_policies where schemaname = 'public' and cmd in ('SELECT', 'ALL') loop
    execute format('grant select on public.%I to authenticated', t.tablename);
  end loop;
end $$;

-- 2. Única coluna editável pelo próprio usuário (nome). Flags de privilégio permanecem bloqueadas.
grant update (full_name) on public.profiles to authenticated;

-- Objetos futuros nascem sem acesso para a Data API (novas migrations devem conceder explicitamente).
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;

-- ───────────── 3. TRUNCATE também é imutável nas tabelas append-only ─────────────
create trigger trg_audit_logs_no_truncate before truncate on public.audit_logs
  for each statement execute function public.forbid_mutation();
create trigger trg_stock_movements_no_truncate before truncate on public.stock_movements
  for each statement execute function public.forbid_mutation();
create trigger trg_ata_commitments_no_truncate before truncate on public.ata_commitments
  for each statement execute function public.forbid_mutation();
create trigger trg_contract_amendments_no_truncate before truncate on public.contract_amendments
  for each statement execute function public.forbid_mutation();
create trigger trg_ata_extensions_no_truncate before truncate on public.ata_extensions
  for each statement execute function public.forbid_mutation();

-- ───────────── 4. Ledger da ata: o banco também confere o saldo ─────────────
create or replace function public.append_commitment_event(p_item uuid, p_expected_count integer, p_event jsonb)
returns text
language plpgsql set search_path = '' as $$
declare
  v_count integer;
  v_registered numeric;
  v_committed numeric;
  v_quantity numeric := (p_event ->> 'quantity')::numeric;
begin
  select registered_quantity into v_registered from public.ata_items where id = p_item for update;
  if not found then
    raise exception 'Item de ata inexistente.' using errcode = '23503';
  end if;

  select count(*),
         coalesce(sum(case event_type when 'commit' then quantity else -quantity end), 0)
    into v_count, v_committed
    from public.ata_commitments where item_id = p_item;
  if v_count <> p_expected_count then return 'conflict'; end if;

  if p_event ->> 'event_type' = 'commit' and v_committed + v_quantity > v_registered then
    raise exception 'Comprometimento excede a quantidade registrada do item.' using errcode = '23514';
  end if;
  if p_event ->> 'event_type' = 'release' and v_quantity > v_committed then
    raise exception 'Devolução excede o quantitativo comprometido.' using errcode = '23514';
  end if;

  insert into public.ata_commitments (item_id, event_type, quantity, council_id, legal_basis)
  values (p_item, p_event ->> 'event_type', v_quantity,
          (p_event ->> 'council_id')::uuid, nullif(p_event ->> 'legal_basis', ''));
  return 'ok';
end $$;

revoke all on function public.append_commitment_event(uuid, integer, jsonb) from public, anon, authenticated;
grant execute on function public.append_commitment_event(uuid, integer, jsonb) to service_role;

-- ===== 20261102000006_fk_indexes.sql =====
-- Migration 0006: índices nas chaves estrangeiras sem índice de cobertura (advisor de performance 0001).
-- Gerado a partir de pg_constraint no banco validado; acelera JOINs, RLS e ON DELETE.
create index if not exists idx_administrative_processes_created_by on public.administrative_processes (created_by);
create index if not exists idx_ata_allocations_council_id on public.ata_allocations (council_id);
create index if not exists idx_ata_commitments_council_id on public.ata_commitments (council_id);
create index if not exists idx_ata_extensions_requested_by on public.ata_extensions (requested_by);
create index if not exists idx_ata_items_material_id on public.ata_items (material_id);
create index if not exists idx_attachments_council_id on public.attachments (council_id);
create index if not exists idx_attachments_type_code on public.attachments (type_code);
create index if not exists idx_attachments_uploaded_by on public.attachments (uploaded_by);
create index if not exists idx_audit_logs_actor_id on public.audit_logs (actor_id);
create index if not exists idx_contracts_supplier_id on public.contracts (supplier_id);
create index if not exists idx_councils_responsible_user_id on public.councils (responsible_user_id);
create index if not exists idx_document_cleanup_runs_process_id on public.document_cleanup_runs (process_id);
create index if not exists idx_meeting_action_items_meeting_id on public.meeting_action_items (meeting_id);
create index if not exists idx_meeting_action_items_responsible_id on public.meeting_action_items (responsible_id);
create index if not exists idx_meetings_created_by on public.meetings (created_by);
create index if not exists idx_meetings_minutes_registered_by on public.meetings (minutes_registered_by);
create index if not exists idx_price_registration_atas_supplier_id on public.price_registration_atas (supplier_id);
create index if not exists idx_purchase_request_events_actor_id on public.purchase_request_events (actor_id);
create index if not exists idx_purchase_request_items_ata_item_id on public.purchase_request_items (ata_item_id);
create index if not exists idx_purchase_request_items_material_id on public.purchase_request_items (material_id);
create index if not exists idx_purchase_requests_created_by on public.purchase_requests (created_by);
create index if not exists idx_retention_authorizations_authorized_by on public.retention_authorizations (authorized_by);
create index if not exists idx_retention_holds_created_by on public.retention_holds (created_by);
create index if not exists idx_stock_balances_material_id on public.stock_balances (material_id);
create index if not exists idx_stock_movements_actor_id on public.stock_movements (actor_id);
create index if not exists idx_stock_movements_material_id on public.stock_movements (material_id);
create index if not exists idx_stock_transfer_events_actor_id on public.stock_transfer_events (actor_id);
create index if not exists idx_stock_transfer_items_material_id on public.stock_transfer_items (material_id);
create index if not exists idx_stock_transfers_destination_council_id on public.stock_transfers (destination_council_id);
create index if not exists idx_stock_transfers_origin_council_id on public.stock_transfers (origin_council_id);

-- ===== 20261102000007_atomic_workflows.sql =====
-- Migration 0007: fluxos multi-item em UMA transação SQL (substitui a compensação em TypeScript).
--  * approve_purchase_request: compromete o saldo de TODAS as linhas ligadas a ata + muda o status + registra o evento.
--  * cancel_purchase_request:  devolve o saldo comprometido (se aprovada) + muda o status + registra o evento.
--  * advance_transfer:         aplica o efeito de estoque de TODOS os materiais + muda o status + registra o evento.
-- Qualquer falha desfaz tudo (subtransação) e devolve {"ok":false,"code":...,"message":...}; nunca estado parcial.
-- Autorização de negócio e validações de formato continuam nos serviços; aqui ficam as invariantes sob lock.
-- Execução restrita ao service_role.

-- Falha de negócio controlada: mensagem "CÓDIGO|texto" capturada pelo bloco de exceção de cada RPC.
create function private.business_error(p_code text, p_message text) returns void
language plpgsql set search_path = '' as $$
begin
  raise exception '%|%', p_code, p_message using errcode = 'P0001';
end $$;
revoke all on function private.business_error(text, text) from public, anon, authenticated;
grant execute on function private.business_error(text, text) to service_role;

-- Próxima posição do histórico de eventos (histórico contíguo e sem colisão: a linha pai está travada).
create function private.next_request_event_position(p_request uuid) returns integer
language sql stable set search_path = '' as $$
  select coalesce(max(position), -1) + 1 from public.purchase_request_events where request_id = p_request
$$;
create function private.next_transfer_event_position(p_transfer uuid) returns integer
language sql stable set search_path = '' as $$
  select coalesce(max(position), -1) + 1 from public.stock_transfer_events where transfer_id = p_transfer
$$;
revoke all on function private.next_request_event_position(uuid) from public, anon, authenticated;
revoke all on function private.next_transfer_event_position(uuid) from public, anon, authenticated;
grant execute on function private.next_request_event_position(uuid) to service_role;
grant execute on function private.next_transfer_event_position(uuid) to service_role;
grant usage on schema private to service_role;

-- ───────────── Solicitação: aprovar (compromete ata) ─────────────
create function public.approve_purchase_request(p_request uuid, p_actor uuid, p_at timestamptz, p_note text default null)
returns jsonb
language plpgsql set search_path = '' as $$
declare
  v_request public.purchase_requests%rowtype;
  v_item record;
  v_registered numeric;
  v_committed numeric;
  v_council_committed numeric;
  v_allocation numeric;
begin
  select * into v_request from public.purchase_requests where id = p_request for update;
  if not found then return jsonb_build_object('ok', false, 'code', 'NOT_FOUND', 'message', 'Solicitação não encontrada.'); end if;
  if v_request.status <> 'em_analise' then
    return jsonb_build_object('ok', false, 'code', 'INVALID_STATE', 'message', 'Somente solicitações em análise podem ser aprovadas.');
  end if;

  begin
    -- Ordem estável por item de ata evita deadlock entre aprovações concorrentes.
    for v_item in
      select ata_item_id, quantity from public.purchase_request_items
       where request_id = p_request and ata_item_id is not null order by ata_item_id, seq
    loop
      select registered_quantity into v_registered from public.ata_items where id = v_item.ata_item_id for update;
      if not found then perform private.business_error('NOT_FOUND', 'Item de ata não encontrado.'); end if;

      select coalesce(sum(case event_type when 'commit' then quantity else -quantity end), 0)
        into v_committed from public.ata_commitments where item_id = v_item.ata_item_id;
      if v_item.quantity > v_registered - v_committed then
        perform private.business_error('INSUFFICIENT_BALANCE',
          format('Quantidade excede o saldo da ata (disponível: %s).', v_registered - v_committed));
      end if;

      select quantity into v_allocation from public.ata_allocations
       where item_id = v_item.ata_item_id and council_id = v_request.council_id;
      if found then
        select coalesce(sum(case event_type when 'commit' then quantity else -quantity end), 0)
          into v_council_committed from public.ata_commitments
         where item_id = v_item.ata_item_id and council_id = v_request.council_id;
        if v_item.quantity > v_allocation - v_council_committed then
          perform private.business_error('INSUFFICIENT_BALANCE',
            format('Quantidade excede a alocação do conselho (disponível: %s).', v_allocation - v_council_committed));
        end if;
      end if;

      insert into public.ata_commitments (item_id, event_type, quantity, council_id, legal_basis)
      values (v_item.ata_item_id, 'commit', v_item.quantity, v_request.council_id, 'request:' || p_request);
    end loop;

    update public.purchase_requests set status = 'aprovada' where id = p_request;
    insert into public.purchase_request_events (request_id, position, from_status, to_status, actor_id, at, note)
    values (p_request, private.next_request_event_position(p_request), v_request.status, 'aprovada', p_actor, p_at, p_note);
  exception when sqlstate 'P0001' then
    -- O bloco inteiro foi desfeito (subtransação): nenhum comprometimento parcial permanece.
    return jsonb_build_object('ok', false, 'code', split_part(sqlerrm, '|', 1), 'message', split_part(sqlerrm, '|', 2));
  end;
  return jsonb_build_object('ok', true);
end $$;

-- ───────────── Solicitação: cancelar (devolve saldo se aprovada) ─────────────
create function public.cancel_purchase_request(p_request uuid, p_actor uuid, p_at timestamptz, p_note text default null)
returns jsonb
language plpgsql set search_path = '' as $$
declare
  v_request public.purchase_requests%rowtype;
  v_item record;
begin
  select * into v_request from public.purchase_requests where id = p_request for update;
  if not found then return jsonb_build_object('ok', false, 'code', 'NOT_FOUND', 'message', 'Solicitação não encontrada.'); end if;
  if v_request.status not in ('rascunho', 'enviada', 'em_analise', 'aprovada') then
    return jsonb_build_object('ok', false, 'code', 'INVALID_STATE', 'message', 'A solicitação não pode mais ser cancelada.');
  end if;

  begin
    if v_request.status = 'aprovada' then
      for v_item in
        select ata_item_id, quantity from public.purchase_request_items
         where request_id = p_request and ata_item_id is not null order by ata_item_id, seq
      loop
        perform 1 from public.ata_items where id = v_item.ata_item_id for update;
        insert into public.ata_commitments (item_id, event_type, quantity, council_id, legal_basis)
        values (v_item.ata_item_id, 'release', v_item.quantity, v_request.council_id, 'cancelamento ' || p_request);
      end loop;
    end if;
    update public.purchase_requests set status = 'cancelada' where id = p_request;
    insert into public.purchase_request_events (request_id, position, from_status, to_status, actor_id, at, note)
    values (p_request, private.next_request_event_position(p_request), v_request.status, 'cancelada', p_actor, p_at, p_note);
  exception
    when sqlstate 'P0001' then
      return jsonb_build_object('ok', false, 'code', split_part(sqlerrm, '|', 1), 'message', split_part(sqlerrm, '|', 2));
    when check_violation then
      return jsonb_build_object('ok', false, 'code', 'INVALID_STATE', 'message', 'Devolução maior que o comprometido.');
  end;
  return jsonb_build_object('ok', true);
end $$;

-- ───────────── Transferência: avançar com efeito de estoque ─────────────
create function public.advance_transfer(
  p_transfer uuid, p_to text, p_actor uuid, p_at timestamptz, p_note text default null, p_received jsonb default null
) returns jsonb
language plpgsql set search_path = '' as $$
declare
  v_transfer public.stock_transfers%rowtype;
  v_item record;
  v_balance public.stock_balances%rowtype;
  v_received numeric;
  v_allowed boolean;
  v_holds_reservation boolean;
begin
  select * into v_transfer from public.stock_transfers where id = p_transfer for update;
  if not found then return jsonb_build_object('ok', false, 'code', 'NOT_FOUND', 'message', 'Transferência não encontrada.'); end if;

  -- Máquina de estados (espelha TRANSFER_TRANSITIONS do domínio).
  v_allowed := (v_transfer.status, p_to) in (
    ('solicitada', 'em_analise'), ('solicitada', 'cancelada'),
    ('em_analise', 'aprovada'), ('em_analise', 'rejeitada'), ('em_analise', 'cancelada'),
    ('aprovada', 'separada'), ('aprovada', 'cancelada'),
    ('separada', 'em_transito'), ('separada', 'cancelada'),
    ('em_transito', 'recebida'));
  if not v_allowed then
    return jsonb_build_object('ok', false, 'code', 'INVALID_STATE',
      'message', format('Transição inválida de transferência: %s → %s.', v_transfer.status, p_to));
  end if;
  v_holds_reservation := v_transfer.status in ('aprovada', 'separada');

  begin
    -- Ordem estável por material evita deadlock entre transferências concorrentes.
    for v_item in
      select material_id, quantity from public.stock_transfer_items where transfer_id = p_transfer order by material_id
    loop
      if p_to = 'aprovada' then
        -- Reserva na origem: disponível = físico − reservado.
        insert into public.stock_balances (council_id, material_id) values (v_transfer.origin_council_id, v_item.material_id) on conflict do nothing;
        select * into v_balance from public.stock_balances
         where council_id = v_transfer.origin_council_id and material_id = v_item.material_id for update;
        if v_item.quantity > v_balance.physical - v_balance.reserved then
          perform private.business_error('INSUFFICIENT_BALANCE', 'Quantidade disponível insuficiente para reserva.');
        end if;
        update public.stock_balances set reserved = reserved + v_item.quantity, version = version + 1, updated_at = now()
         where council_id = v_transfer.origin_council_id and material_id = v_item.material_id;

      elsif p_to in ('rejeitada', 'cancelada') and v_holds_reservation then
        select * into v_balance from public.stock_balances
         where council_id = v_transfer.origin_council_id and material_id = v_item.material_id for update;
        if not found or v_balance.reserved < v_item.quantity then
          perform private.business_error('INVALID_STATE', 'Reserva menor que a quantidade a liberar.');
        end if;
        update public.stock_balances set reserved = reserved - v_item.quantity, version = version + 1, updated_at = now()
         where council_id = v_transfer.origin_council_id and material_id = v_item.material_id;

      elsif p_to = 'em_transito' then
        -- Saída: libera a reserva e baixa o físico; o material fica em trânsito (não é estoque de ninguém).
        select * into v_balance from public.stock_balances
         where council_id = v_transfer.origin_council_id and material_id = v_item.material_id for update;
        if not found or v_balance.reserved < v_item.quantity or v_balance.physical < v_item.quantity then
          perform private.business_error('INSUFFICIENT_BALANCE', 'Saldo físico ou reserva insuficiente para a saída.');
        end if;
        insert into public.stock_movements (council_id, material_id, type, quantity, idempotency_key, reason, reference, actor_id)
        values (v_transfer.origin_council_id, v_item.material_id, 'transfer_out', v_item.quantity,
                'transfer:' || p_transfer || ':out:' || v_item.material_id, 'Saída por transferência', 'transfer:' || p_transfer, null);
        update public.stock_balances
           set physical = physical - v_item.quantity, reserved = reserved - v_item.quantity, version = version + 1, updated_at = now()
         where council_id = v_transfer.origin_council_id and material_id = v_item.material_id;

      elsif p_to = 'recebida' then
        v_received := coalesce(
          (select (r ->> 'quantity')::numeric from jsonb_array_elements(coalesce(p_received, '[]'::jsonb)) r
            where (r ->> 'materialId')::uuid = v_item.material_id limit 1),
          v_item.quantity);
        if v_received < 0 then perform private.business_error('VALIDATION', 'Quantidade recebida inválida.'); end if;
        if v_received > v_item.quantity then perform private.business_error('VALIDATION', 'Recebido não pode exceder o enviado.'); end if;
        update public.stock_transfer_items set received_quantity = v_received
         where transfer_id = p_transfer and material_id = v_item.material_id;
        if v_received > 0 then
          insert into public.stock_balances (council_id, material_id) values (v_transfer.destination_council_id, v_item.material_id) on conflict do nothing;
          perform 1 from public.stock_balances
           where council_id = v_transfer.destination_council_id and material_id = v_item.material_id for update;
          insert into public.stock_movements (council_id, material_id, type, quantity, idempotency_key, reason, reference, actor_id)
          values (v_transfer.destination_council_id, v_item.material_id, 'transfer_in', v_received,
                  'transfer:' || p_transfer || ':in:' || v_item.material_id, 'Entrada por transferência', 'transfer:' || p_transfer, null);
          update public.stock_balances set physical = physical + v_received, version = version + 1, updated_at = now()
           where council_id = v_transfer.destination_council_id and material_id = v_item.material_id;
        end if;
      end if;
    end loop;

    update public.stock_transfers set status = p_to where id = p_transfer;
    insert into public.stock_transfer_events (transfer_id, position, from_status, to_status, actor_id, at, note)
    values (p_transfer, private.next_transfer_event_position(p_transfer), v_transfer.status, p_to, p_actor, p_at, p_note);
  exception
    when sqlstate 'P0001' then
      return jsonb_build_object('ok', false, 'code', split_part(sqlerrm, '|', 1), 'message', split_part(sqlerrm, '|', 2));
    when check_violation then
      -- Ex.: físico < reservado ou saldo negativo barrados pelas constraints de stock_balances.
      return jsonb_build_object('ok', false, 'code', 'INSUFFICIENT_BALANCE', 'message', 'Saldo insuficiente para concluir a operação.');
  end;
  return jsonb_build_object('ok', true);
end $$;

do $$
declare fn text;
begin
  foreach fn in array array[
    'approve_purchase_request(uuid, uuid, timestamptz, text)',
    'cancel_purchase_request(uuid, uuid, timestamptz, text)',
    'advance_transfer(uuid, text, uuid, timestamptz, text, jsonb)'] loop
    execute format('revoke all on function public.%s from public, anon, authenticated', fn);
    execute format('grant execute on function public.%s to service_role', fn);
  end loop;
end $$;

-- ===== 20261102000008_council_whatsapp.sql =====
-- Migration 0008: celular WhatsApp do conselho (E.164), para envio futuro de mensagens.
-- Vazio é permitido; se informado, exige 55 + DDD + 9 dígitos (celular).

alter table public.councils
  add column if not exists whatsapp_e164 text;

alter table public.councils
  drop constraint if exists councils_whatsapp_e164_check;

alter table public.councils
  add constraint councils_whatsapp_e164_check
  check (whatsapp_e164 is null or whatsapp_e164 ~ '^55[1-9][0-9]9[0-9]{8}$');

comment on column public.councils.whatsapp_e164 is
  'Celular WhatsApp em E.164 (55 + DDD + 9 dígitos). Reservado para envio futuro de mensagens.';

-- ===== 20261110000001_purchase_request_process_id.sql =====
-- Migration: adiciona process_id em purchase_requests para vínculo com processos administrativos
alter table public.purchase_requests
  add column if not exists process_id uuid references public.administrative_processes (id) on delete set null;

create index if not exists idx_purchase_requests_process_id on public.purchase_requests (process_id);

create or replace function public.save_purchase_request(p jsonb) returns void
language plpgsql set search_path = '' as $$
begin
  insert into public.purchase_requests (id, council_id, title, status, process_id, created_by, created_at)
  values (
    (p ->> 'id')::uuid,
    (p ->> 'council_id')::uuid,
    p ->> 'title',
    p ->> 'status',
    nullif(p ->> 'process_id', '')::uuid,
    (p ->> 'created_by')::uuid,
    (p ->> 'created_at')::timestamptz
  )
  on conflict (id) do update set
    status = excluded.status,
    title = excluded.title,
    process_id = excluded.process_id;

  insert into public.purchase_request_items (id, request_id, material_id, quantity, ata_item_id, received_total)
  select x.id, (p ->> 'id')::uuid, x.material_id, x.quantity, x.ata_item_id, x.received_total
    from jsonb_to_recordset(p -> 'items') as x(id uuid, material_id uuid, quantity numeric, ata_item_id uuid, received_total numeric)
  on conflict (id) do update set received_total = excluded.received_total;

  insert into public.purchase_request_events (request_id, position, from_status, to_status, actor_id, at, note)
  select (p ->> 'id')::uuid, e.ordinality - 1, e.value ->> 'from_status', e.value ->> 'to_status',
         (e.value ->> 'actor_id')::uuid, (e.value ->> 'at')::timestamptz, e.value ->> 'note'
    from jsonb_array_elements(p -> 'events') with ordinality e
  on conflict do nothing;

  insert into public.purchase_receipt_keys (request_id, receipt_key)
  select (p ->> 'id')::uuid, k from jsonb_array_elements_text(p -> 'receipt_keys') k
  on conflict do nothing;
end $$;

-- ===== 20261110000002_formalizations_and_blocked_stock.sql =====
-- Migration 0002 Onda 1: formalizações, estoque bloqueado e valor estimado
alter table public.purchase_requests
  add column if not exists estimated_value numeric(15,2) check (estimated_value is null or estimated_value >= 0);

alter table public.stock_balances
  add column if not exists blocked numeric(15,3) not null default 0 check (blocked >= 0);

create table if not exists public.process_formalizations (
  id uuid primary key default gen_random_uuid(),
  process_id uuid not null references public.administrative_processes (id) on delete cascade,
  request_id uuid references public.purchase_requests (id) on delete set null,
  council_id uuid not null references public.councils (id),
  supplier_id uuid not null references public.suppliers (id),
  instrument_type text not null check (instrument_type in ('ata', 'contrato', 'empenho')),
  instrument_number text not null check (length(trim(instrument_number)) > 0),
  estimated_value numeric(15,2) not null check (estimated_value >= 0),
  contracted_value numeric(15,2) not null check (contracted_value >= 0),
  savings_value numeric(15,2) not null,
  savings_percent numeric(5,2) not null,
  status text not null default 'aguardando_homologacao'
    check (status in ('aguardando_homologacao', 'homologado', 'rejeitada')),
  homologated_by uuid references public.profiles (id),
  homologated_at timestamptz,
  homologation_note text,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  unique (process_id)
);

create index if not exists idx_process_formalizations_council on public.process_formalizations (council_id);
create index if not exists idx_process_formalizations_status on public.process_formalizations (status);

-- RLS
alter table public.process_formalizations enable row level security;

create policy process_formalizations_select on public.process_formalizations
  for select to authenticated
  using (private.has_council_access(council_id));

-- Atualização da RPC apply_stock_mutation para suportar p_blocked opcionalmente
create or replace function public.apply_stock_mutation(
  p_council uuid, p_material uuid, p_expected_version integer,
  p_physical numeric, p_reserved numeric, p_movement jsonb,
  p_blocked numeric
) returns text
language plpgsql set search_path = '' as $$
declare
  v_version integer;
begin
  insert into public.stock_balances (council_id, material_id)
  values (p_council, p_material) on conflict do nothing;

  select version into v_version from public.stock_balances
   where council_id = p_council and material_id = p_material for update;
  if v_version <> p_expected_version then return 'conflict'; end if;

  if p_movement is not null then
    begin
      insert into public.stock_movements (council_id, material_id, type, quantity, idempotency_key, reason, reference, actor_id)
      values (p_council, p_material, p_movement ->> 'type', (p_movement ->> 'quantity')::numeric,
              p_movement ->> 'idempotency_key', coalesce(p_movement ->> 'reason', ''),
              p_movement ->> 'reference', nullif(p_movement ->> 'actor_id', '')::uuid);
    exception when unique_violation then
      return 'conflict';
    end;
  end if;

  update public.stock_balances
     set physical = p_physical,
         reserved = p_reserved,
         blocked = coalesce(p_blocked, blocked),
         version = version + 1,
         updated_at = now()
   where council_id = p_council and material_id = p_material;
  return 'ok';
end $$;

create or replace function public.apply_stock_mutation(
  p_council uuid, p_material uuid, p_expected_version integer,
  p_physical numeric, p_reserved numeric, p_movement jsonb
) returns text
language plpgsql set search_path = '' as $$
begin
  return public.apply_stock_mutation(p_council, p_material, p_expected_version, p_physical, p_reserved, p_movement, null);
end $$;

revoke execute on function public.apply_stock_mutation(uuid, uuid, integer, numeric, numeric, jsonb, numeric) from public, anon, authenticated;
grant execute on function public.apply_stock_mutation(uuid, uuid, integer, numeric, numeric, jsonb, numeric) to service_role;

-- Atualização de save_purchase_request para persistir estimated_value
create or replace function public.save_purchase_request(p jsonb) returns void
language plpgsql set search_path = '' as $$
begin
  insert into public.purchase_requests (id, council_id, title, status, process_id, estimated_value, created_by, created_at)
  values (
    (p ->> 'id')::uuid,
    (p ->> 'council_id')::uuid,
    p ->> 'title',
    p ->> 'status',
    nullif(p ->> 'process_id', '')::uuid,
    nullif(p ->> 'estimated_value', '')::numeric,
    (p ->> 'created_by')::uuid,
    (p ->> 'created_at')::timestamptz
  )
  on conflict (id) do update set
    status = excluded.status,
    title = excluded.title,
    process_id = excluded.process_id,
    estimated_value = excluded.estimated_value;

  insert into public.purchase_request_items (id, request_id, material_id, quantity, ata_item_id, received_total)
  select x.id, (p ->> 'id')::uuid, x.material_id, x.quantity, x.ata_item_id, x.received_total
    from jsonb_to_recordset(p -> 'items') as x(id uuid, material_id uuid, quantity numeric, ata_item_id uuid, received_total numeric)
  on conflict (id) do update set received_total = excluded.received_total;

  insert into public.purchase_request_events (request_id, position, from_status, to_status, actor_id, at, note)
  select (p ->> 'id')::uuid, e.ordinality - 1, e.value ->> 'from_status', e.value ->> 'to_status',
         (e.value ->> 'actor_id')::uuid, (e.value ->> 'at')::timestamptz, e.value ->> 'note'
    from jsonb_array_elements(p -> 'events') with ordinality e
  on conflict do nothing;

  insert into public.purchase_receipt_keys (request_id, receipt_key)
  select (p ->> 'id')::uuid, k from jsonb_array_elements_text(p -> 'receipt_keys') k
  on conflict do nothing;
end $$;

-- ===== 20261110000003_material_orders.sql =====
-- Migration 0003 Onda 2: Pedidos de materiais contra estoque liberado
-- R11/R12: reserva de saldo e despacho com auditoria e RBAC institucional.

-- Tabela principal de pedidos de materiais
create table if not exists public.material_orders (
  id uuid primary key default gen_random_uuid(),
  number text not null,
  council_id uuid not null references public.councils (id),
  status text not null default 'pendente'
    check (status in ('pendente', 'aprovado', 'rejeitado', 'cancelado')),
  requested_by uuid not null references public.profiles (id),
  notes text,
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (council_id, number),
  check (status <> 'rejeitado' or (rejection_reason is not null and length(trim(rejection_reason)) > 0)),
  check (status <> 'aprovado' or reviewed_by is not null)
);

-- Índices de consulta e ordenação para pedidos
create index if not exists idx_material_orders_council on public.material_orders (council_id);
create index if not exists idx_material_orders_status on public.material_orders (status);
create index if not exists idx_material_orders_created_at on public.material_orders (created_at desc);
create index if not exists idx_material_orders_requested_by on public.material_orders (requested_by);

-- Tabela de itens do pedido de materiais
create table if not exists public.material_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.material_orders (id) on delete cascade,
  material_id uuid not null references public.materials (id),
  quantity numeric(15,3) not null check (quantity > 0)
);

-- Índices para itens de pedido
create index if not exists idx_material_order_items_order on public.material_order_items (order_id);
create index if not exists idx_material_order_items_material on public.material_order_items (material_id);

-- Row Level Security (RLS)
alter table public.material_orders enable row level security;
alter table public.material_order_items enable row level security;

-- Política de leitura isolada por conselho (ou acesso global para Warley via private.has_council_access)
create policy material_orders_select on public.material_orders
  for select to authenticated
  using (private.has_council_access(council_id));

create policy material_order_items_select on public.material_order_items
  for select to authenticated
  using (
    exists (
      select 1 from public.material_orders o
      where o.id = material_order_items.order_id
        and private.has_council_access(o.council_id)
    )
  );

-- Escrita restrita a service_role (operações passam exclusivamente pelos serviços de domínio)
revoke insert, update, delete on public.material_orders, public.material_order_items from anon, authenticated;

-- ===== 20261110000004_additional_documents.sql =====
-- Migration 0004 Onda 3: Suporte a tipos documentais adicionais/complementares
-- Preservação rigorosa da régua de cálculo de progresso com base estritamente nos 7 tipos documentais obrigatórios.

-- 1. Adiciona coluna is_required em public.document_types
alter table public.document_types
  add column if not exists is_required boolean not null default true;

-- 2. Insere tipo complementar 'OUTRO' com is_required = false
insert into public.document_types (code, name, position, is_required)
values ('OUTRO', 'Artefato Adicional / Complementar', 8, false)
on conflict (code) do update set
  name = excluded.name,
  position = excluded.position,
  is_required = excluded.is_required;

-- 3. Atualiza a view v_process_progress para considerar exclusivamente tipos obrigatórios
create or replace view public.v_process_progress with (security_invoker = true) as
select p.id as process_id,
       count(distinct case when dt.is_required = true then a.type_code end) as valid_types,
       round(
         count(distinct case when dt.is_required = true then a.type_code end) * 100.0 /
         nullif((select count(*) from public.document_types where is_required = true), 0),
         2
       ) as percent
  from public.administrative_processes p
  left join public.attachments a
    on a.process_id = p.id and a.link_status = 'active'
   and a.upload_status = 'confirmed' and a.retention_state = 'retained'
  left join public.document_types dt on dt.code = a.type_code
 group by p.id;

-- ===== 20261111000001_formalization_auction.sql =====
-- Contratação do pregão: data da sessão e quantidade contratada.
alter table public.process_formalizations
  add column if not exists auction_date date,
  add column if not exists contracted_quantity numeric(15,3) check (contracted_quantity is null or contracted_quantity > 0);

notify pgrst, 'reload schema';

-- ===== 20261111000002_link_process.sql =====
-- Liga atas e contratos ao processo administrativo do mesmo órgão.
alter table public.price_registration_atas
  add column if not exists process_id uuid references public.administrative_processes (id);

alter table public.contracts
  add column if not exists process_id uuid references public.administrative_processes (id);

create index if not exists idx_price_registration_atas_process_id on public.price_registration_atas (process_id);
create index if not exists idx_contracts_process_id on public.contracts (process_id);

create or replace function public.save_ata(p jsonb) returns void
language plpgsql set search_path = '' as $$
begin
  insert into public.price_registration_atas (id, council_id, number, supplier_id, start_date, status, created_at, process_id)
  values ((p ->> 'id')::uuid, (p ->> 'council_id')::uuid, p ->> 'number', nullif(p ->> 'supplier_id', '')::uuid,
          (p ->> 'start_date')::date, p ->> 'status', (p ->> 'created_at')::timestamptz,
          nullif(p ->> 'process_id', '')::uuid)
  on conflict (id) do update set
    status = excluded.status,
    supplier_id = excluded.supplier_id,
    process_id = excluded.process_id;

  insert into public.ata_items (id, ata_id, description, material_id, registered_quantity, unit_price)
  select x.id, (p ->> 'id')::uuid, x.description, x.material_id, x.registered_quantity, x.unit_price
    from jsonb_to_recordset(p -> 'items') as x(id uuid, description text, material_id uuid, registered_quantity numeric, unit_price numeric)
  on conflict (id) do nothing;

  delete from public.ata_allocations where item_id in (select id from public.ata_items where ata_id = (p ->> 'id')::uuid);
  insert into public.ata_allocations (item_id, council_id, quantity)
  select (i ->> 'id')::uuid, (a ->> 'council_id')::uuid, (a ->> 'quantity')::numeric
    from jsonb_array_elements(p -> 'items') i, jsonb_array_elements(i -> 'allocations') a;

  insert into public.ata_extensions (ata_id, position, requested_by, previous_end_date, new_end_date, legal_basis)
  select (p ->> 'id')::uuid, e.ordinality - 1, (e.value ->> 'requested_by')::uuid,
         (e.value ->> 'previous_end_date')::date, (e.value ->> 'new_end_date')::date, e.value ->> 'legal_basis'
    from jsonb_array_elements(p -> 'extensions') with ordinality e
  on conflict do nothing;
end $$;

create or replace function public.save_contract(p jsonb) returns void
language plpgsql set search_path = '' as $$
begin
  insert into public.contracts (id, council_id, number, supplier_id, object, start_date, end_date, value, created_at, process_id)
  values ((p ->> 'id')::uuid, (p ->> 'council_id')::uuid, p ->> 'number', nullif(p ->> 'supplier_id', '')::uuid,
          p ->> 'object', (p ->> 'start_date')::date, (p ->> 'end_date')::date, (p ->> 'value')::numeric,
          (p ->> 'created_at')::timestamptz, nullif(p ->> 'process_id', '')::uuid)
  on conflict (id) do update set
    supplier_id = excluded.supplier_id,
    process_id = excluded.process_id;

  insert into public.contract_amendments (contract_id, sequence, reason, signed_at,
    previous_start_date, previous_end_date, previous_value, next_start_date, next_end_date, next_value)
  select (p ->> 'id')::uuid, (a ->> 'sequence')::integer, a ->> 'reason', (a ->> 'signed_at')::date,
         (a ->> 'previous_start_date')::date, (a ->> 'previous_end_date')::date, (a ->> 'previous_value')::numeric,
         (a ->> 'next_start_date')::date, (a ->> 'next_end_date')::date, (a ->> 'next_value')::numeric
    from jsonb_array_elements(p -> 'amendments') a
  on conflict do nothing;
end $$;

notify pgrst, 'reload schema';

-- ===== 20261116000001_notification_emails.sql =====
-- Alertas antigos permanecem apenas no aplicativo. Novos avisos entram na fila de e-mail.
alter table public.notifications
  add column email_queued_at timestamptz,
  add column email_sent_at timestamptz,
  add column email_attempted_at timestamptz,
  add column email_failures integer not null default 0,
  add column email_last_error text;
alter table public.notifications alter column email_queued_at set default now();
create index notifications_pending_email_idx on public.notifications (created_at)
  where email_queued_at is not null and email_sent_at is null;

create function public.record_notification_email_failure(
  p_notification_ids uuid[], p_attempted_at timestamptz, p_reason text
) returns void language sql security definer set search_path = '' as $$
  update public.notifications
  set email_attempted_at = p_attempted_at,
      email_failures = email_failures + 1,
      email_last_error = left(p_reason, 200)
  where id = any(p_notification_ids) and email_sent_at is null;
$$;
revoke all on function public.record_notification_email_failure(uuid[], timestamptz, text) from public, anon, authenticated;
grant execute on function public.record_notification_email_failure(uuid[], timestamptz, text) to service_role;

-- ===== 20261116000002_meeting_audio.sql =====
-- Gravações de reuniões em bucket privado, com transcrição revisável no cadastro.
alter table public.meetings
  add column audio_path text,
  add column transcript_text text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('meeting-audio', 'meeting-audio', false, 26214400,
        array['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/mpeg'])
on conflict (id) do update set public = false;
-- Sem políticas de acesso em storage.objects para anon/authenticated.
-- Upload somente por URL assinada de uso único; reprodução por URL temporária.

-- ===== 20261116000003_private_organizations.sql =====
-- Distingue órgãos públicos de empresas privadas atendidas pela assessoria.
alter table public.councils
  add column if not exists organization_type text not null default 'public_body';

alter table public.councils
  drop constraint if exists councils_organization_type_check;

alter table public.councils
  add constraint councils_organization_type_check
  check (organization_type in ('public_body', 'private_company'));

create index if not exists idx_councils_organization_type
  on public.councils (organization_type, active);

comment on column public.councils.organization_type is
  'public_body para órgão público; private_company para empresa privada atendida pela assessoria.';

-- ===== 20261119000001_process_archive_uploads.sql =====
update storage.buckets
set allowed_mime_types = array(
  select distinct unnest(coalesce(allowed_mime_types, array[]::text[]) || array[
    'application/zip',
    'application/vnd.oasis.opendocument.text',
    'application/vnd.oasis.opendocument.spreadsheet'
  ])
)
where id = 'process-documents';

-- ===== 20261120000001_request_corrections.sql =====
alter table public.administrative_processes add column if not exists document_exceptions jsonb not null default '{}';
update public.document_types set name='Parecer Jurídico / Técnico' where code='PJ';
update public.document_types set name='Edital de Licitação / Aviso' where code='ED';

create or replace function public.set_document_exception(p_process uuid, p_type text, p_actor uuid, p_reason text, p_remove boolean default false)
returns void language plpgsql security definer set search_path = '' as $$
declare v public.administrative_processes; resolved integer; exceptions jsonb;
begin
  select * into strict v from public.administrative_processes where id = p_process for update;
  if not exists(select 1 from public.profiles where id=p_actor and active and
    (is_central_admin or exists(select 1 from public.council_memberships where user_id=p_actor and council_id=v.council_id and role in ('council_manager','council_operator'))))
    then raise exception 'Sem permissão para alterar o processo.'; end if;
  if p_type not in ('DFD','ETP','MR','TR','PP','PJ','ED') or length(trim(p_reason)) not between 10 and 1000 then
    raise exception 'Etapa ou justificativa inválida.'; end if;
  if v.documental_snapshot is not null or v.status in ('cancelado','arquivado') then raise exception 'Este processo está encerrado para alterações documentais.'; end if;
  exceptions := case when p_remove then v.document_exceptions - p_type else
    v.document_exceptions || jsonb_build_object(p_type,jsonb_build_object('justification',trim(p_reason),'actorId',p_actor,'at',now())) end;
  select count(*) into resolved from (
    select type_code from public.attachments where process_id=p_process and upload_status='confirmed' and link_status='active' and retention_state<>'disposed'
    union select jsonb_object_keys(exceptions)
  ) types where type_code in ('DFD','ETP','MR','TR','PP','PJ','ED');
  update public.administrative_processes set document_exceptions=exceptions,
    documental_completed_at=case when resolved=7 then coalesce(documental_completed_at,now()) else null end where id=p_process;
  insert into public.audit_logs(actor_id,action,entity,entity_id,council_id,details)
    values(p_actor,'process.document_exception','administrative_process',p_process::text,v.council_id,
      jsonb_build_object('type',p_type,'reason',p_reason,'removed',p_remove,'before',v.document_exceptions,'after',exceptions));
end $$;
revoke all on function public.set_document_exception(uuid,text,uuid,text,boolean) from public,anon,authenticated;
grant execute on function public.set_document_exception(uuid,text,uuid,text,boolean) to service_role;

create or replace function public.correct_purchase_request(p_request uuid,p_actor uuid,p_expected text,p_data jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare
  r public.purchase_requests; target uuid; item jsonb; material uuid; next_status text;
  reason text; priority text; amount numeric; structural boolean; old_items jsonb; new_items jsonb := '[]';
  balance record; delta numeric; locked boolean; position integer; previous jsonb;
begin
  select * into strict r from public.purchase_requests where id=p_request for update;
  if p_expected <> (select md5(to_jsonb(q)::text) from (
    select r.*, (select jsonb_agg(to_jsonb(i) order by i.seq) from public.purchase_request_items i where request_id=r.id) items,
    (select count(*) from public.purchase_request_events where request_id=r.id) events_count
  ) q) then raise exception 'A solicitação mudou. Atualize a página antes de corrigir.'; end if;
  target := (p_data->>'councilId')::uuid;
  if not exists(select 1 from public.profiles where id=p_actor and active and
    (is_central_admin or (exists(select 1 from public.council_memberships where user_id=p_actor and council_id=r.council_id and role in ('council_manager','council_operator'))
    and exists(select 1 from public.council_memberships where user_id=p_actor and council_id=target and role in ('council_manager','council_operator')))))
    then raise exception 'Sem permissão para corrigir esta solicitação ou transferir para este órgão.'; end if;
  if not exists(select 1 from public.councils where id=target and active) then raise exception 'Órgão inativo.'; end if;
  if r.status in ('cancelada','atendida','rejeitada') then raise exception 'Esta solicitação está encerrada.'; end if;
  reason := trim(p_data->>'justification'); priority := p_data->>'priority';
  amount := nullif(p_data->>'estimatedValue','')::numeric;
  if length(reason) not between 10 and 1000 or priority not in ('Alta','Média','Baixa') or
     length(trim(p_data->>'title')) not between 3 and 200 or amount < 0 or jsonb_array_length(p_data->'items') < 1 then
    raise exception 'Confira os campos e informe uma justificativa de pelo menos 10 caracteres.'; end if;
  select coalesce(jsonb_agg(to_jsonb(i) order by i.seq),'[]') into old_items from public.purchase_request_items i where request_id=r.id;
  previous := jsonb_build_object('request',to_jsonb(r),'items',old_items);
  for item in select value from jsonb_array_elements(p_data->'items') loop
    if (item->>'quantity')::numeric <= 0 or length(trim(item->>'description')) not between 2 and 160 or length(trim(item->>'unit')) not between 1 and 20 then raise exception 'Material, unidade ou quantidade inválida.'; end if;
    select m.id into material from public.materials m
      join public.purchase_request_items i on i.material_id=m.id and i.request_id=r.id
      where m.id=nullif(item->>'materialId','')::uuid and m.name=trim(item->>'description') and m.unit=trim(item->>'unit') limit 1;
    if material is null then
      select id into material from public.materials where name=trim(item->>'description') and unit=trim(item->>'unit') and active order by id limit 1;
    end if;
    if material is null then
      material := gen_random_uuid();
      insert into public.materials(id,code,name,unit) values(material,'COR-'||material::text,trim(item->>'description'),trim(item->>'unit'));
    end if;
    new_items := new_items || jsonb_build_array(jsonb_build_object('material_id',material,'quantity',(item->>'quantity')::numeric));
  end loop;
  structural := target<>r.council_id or
    (select jsonb_agg(jsonb_build_object('material_id',i->>'material_id','quantity',(i->>'quantity')::numeric) order by ord)
      from jsonb_array_elements(old_items) with ordinality t(i,ord)) is distinct from new_items;
  locked := exists(select 1 from public.process_formalizations where process_id=r.process_id)
    or exists(select 1 from public.purchase_request_items where request_id=r.id and (received_total>0 or ata_item_id is not null));
  if structural and locked then raise exception 'Materiais, quantidades e órgão só podem ser corrigidos antes da formalização, do recebimento e do compromisso de ata.'; end if;
  if target<>r.council_id and (
    exists(select 1 from public.price_registration_atas where process_id=r.process_id) or
    exists(select 1 from public.contracts where process_id=r.process_id)
  ) then raise exception 'O processo possui instrumentos vinculados. Revise esses vínculos antes de trocar o órgão.'; end if;
  if structural then
    for balance in
      select owner,mat,sum(qty) qty from (
        select r.council_id owner,(i->>'material_id')::uuid mat,-(i->>'quantity')::numeric qty from jsonb_array_elements(old_items) i
        union all select target,(i->>'material_id')::uuid,(i->>'quantity')::numeric from jsonb_array_elements(new_items) i
      ) changes group by owner,mat order by owner,mat
    loop
      insert into public.stock_balances(council_id,material_id) values(balance.owner,balance.mat) on conflict do nothing;
      perform 1 from public.stock_balances where council_id=balance.owner and material_id=balance.mat for update;
      update public.stock_balances set blocked=blocked+balance.qty,version=version+1
        where council_id=balance.owner and material_id=balance.mat and blocked+balance.qty>=0;
      if not found then raise exception 'Saldo bloqueado incompatível. A correção foi cancelada.'; end if;
    end loop;
    delete from public.purchase_request_items where request_id=r.id;
    for item in select value from jsonb_array_elements(new_items) loop
      insert into public.purchase_request_items(request_id,material_id,quantity) values(r.id,(item->>'material_id')::uuid,(item->>'quantity')::numeric);
    end loop;
  end if;
  next_status := case when structural and r.status<>'rascunho' then 'em_analise' else r.status end;
  update public.purchase_requests set title=trim(p_data->>'title'),council_id=target,estimated_value=amount,status=next_status where id=r.id;
  update public.administrative_processes set title=trim(p_data->>'title'),council_id=target where id=r.process_id;
  if target<>r.council_id then update public.attachments set council_id=target where process_id=r.process_id; end if;
  update public.process_formalizations set estimated_value=coalesce(amount,0),
    savings_value=coalesce(amount,0)-contracted_value,
    savings_percent=case when amount>0 then round((amount-contracted_value)/amount*100,2) else 0 end
    where process_id=r.process_id;
  select coalesce(max(e.position),-1)+1 into position from public.purchase_request_events e where request_id=r.id;
  insert into public.purchase_request_events(request_id,position,from_status,to_status,actor_id,at,note)
    values(r.id,position,r.status,next_status,p_actor,now(),'Correção: '||reason||' | Prioridade '||priority||
      ' | Valor estimado: '||coalesce(r.estimated_value::text,'não informado')||' → '||coalesce(amount::text,'não informado')||
      ' | Objeto: '||r.title||' → '||trim(p_data->>'title')||
      case when structural then ' | Órgão, materiais ou quantidades alterados. Retornou para análise.' else '' end);
  insert into public.audit_logs(actor_id,action,entity,entity_id,council_id,details)
    values(p_actor,'request.correct','purchase_request',r.id::text,target,
      jsonb_build_object('before',previous,'after',p_data,'structural',structural,'status',next_status));
end $$;
revoke all on function public.correct_purchase_request(uuid,uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.correct_purchase_request(uuid,uuid,text,jsonb) to service_role;

create or replace function public.purchase_request_revision(p_request uuid)
returns text language sql security definer set search_path = '' as $$
  select md5(to_jsonb(q)::text) from (
    select r.*, (select jsonb_agg(to_jsonb(i) order by i.seq) from public.purchase_request_items i where request_id=r.id) items,
    (select count(*) from public.purchase_request_events where request_id=r.id) events_count
    from public.purchase_requests r where id=p_request
  ) q
$$;
revoke all on function public.purchase_request_revision(uuid) from public,anon,authenticated;
grant execute on function public.purchase_request_revision(uuid) to service_role;

create or replace view public.v_process_progress with (security_invoker = true) as
  select p.id as process_id,
    (select count(*) from (
      select type_code from public.attachments where process_id=p.id and link_status='active'
        and upload_status='confirmed' and retention_state<>'disposed'
      union select jsonb_object_keys(p.document_exceptions)
    ) resolved where type_code in ('DFD','ETP','MR','TR','PP','PJ','ED')) as valid_types,
    round((select count(*) from (
      select type_code from public.attachments where process_id=p.id and link_status='active'
        and upload_status='confirmed' and retention_state<>'disposed'
      union select jsonb_object_keys(p.document_exceptions)
    ) resolved where type_code in ('DFD','ETP','MR','TR','PP','PJ','ED'))*100.0/7,2) as percent
  from public.administrative_processes p;

-- ===== 20261123000001_process_estimated_value.sql =====
alter table public.administrative_processes
  add column if not exists estimated_value numeric(15,2) check (estimated_value >= 0);

create or replace function public.set_process_estimated_value(p_process uuid, p_actor uuid, p_value numeric)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  process_row public.administrative_processes;
  request_row public.purchase_requests;
  previous_value numeric;
begin
  if p_value is null or p_value < 0 or p_value > 9999999999999.99 or p_value <> round(p_value, 2) then
    raise exception 'Informe um valor estimado válido.';
  end if;

  -- Same lock order as request corrections.
  select * into request_row from public.purchase_requests
    where process_id = p_process order by created_at desc, id desc limit 1 for update;
  select * into strict process_row from public.administrative_processes
    where id = p_process for update;

  if not exists (
    select 1 from public.profiles where id = p_actor and active and (
      is_central_admin or exists (
        select 1 from public.council_memberships where user_id = p_actor
          and council_id = process_row.council_id and role in ('council_manager', 'council_operator')
      )
    )
  ) or (request_row.id is not null and request_row.council_id <> process_row.council_id) then
    raise exception 'Sem permissão para alterar o valor estimado deste processo.';
  end if;

  if process_row.documental_snapshot is not null or process_row.status in ('cancelado', 'arquivado') then
    raise exception 'Este processo está encerrado para alterações.';
  end if;

  if request_row.id is not null then
    previous_value := request_row.estimated_value;
    update public.purchase_requests set estimated_value = p_value where id = request_row.id;
  else
    previous_value := process_row.estimated_value;
    update public.administrative_processes set estimated_value = p_value where id = p_process;
  end if;

  update public.process_formalizations
    set estimated_value = p_value,
        savings_value = p_value - contracted_value,
        savings_percent = case when p_value > 0 then round((p_value - contracted_value) / p_value * 100, 2) else 0 end
    where process_id = p_process;

  if previous_value is distinct from p_value then
    insert into public.audit_logs(actor_id, action, entity, entity_id, council_id, details)
      values (p_actor, 'process.estimated_value', 'administrative_process', p_process::text, process_row.council_id,
        jsonb_build_object('before', previous_value, 'after', p_value, 'requestId', request_row.id));
  end if;
end;
$$;

revoke all on function public.set_process_estimated_value(uuid, uuid, numeric) from public, anon, authenticated;
grant execute on function public.set_process_estimated_value(uuid, uuid, numeric) to service_role;

-- ===== 20261125000001_process_validity_start.sql =====
-- Vigência informada no TR e reutilizada na ata e no contrato.
alter table public.administrative_processes
  add column if not exists validity_start_date date;

create or replace function public.set_process_validity_start_date(p_process uuid, p_actor uuid, p_start date)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  process_row public.administrative_processes;
  previous_value date;
begin
  if p_start is null then
    raise exception 'Informe a data de início da vigência.';
  end if;

  select * into strict process_row from public.administrative_processes
    where id = p_process for update;

  if not exists (
    select 1 from public.profiles where id = p_actor and active and (
      is_central_admin or exists (
        select 1 from public.council_memberships where user_id = p_actor
          and council_id = process_row.council_id and role in ('council_manager', 'council_operator')
      )
    )
  ) then
    raise exception 'Sem permissão para alterar a vigência deste processo.';
  end if;

  if process_row.documental_snapshot is not null or process_row.status in ('cancelado', 'arquivado') then
    raise exception 'Este processo está encerrado para alterações.';
  end if;

  previous_value := process_row.validity_start_date;
  update public.administrative_processes
    set validity_start_date = p_start
    where id = p_process;

  if previous_value is distinct from p_start then
    insert into public.audit_logs(actor_id, action, entity, entity_id, council_id, details)
      values (
        p_actor,
        'process.validity_start',
        'administrative_process',
        p_process::text,
        process_row.council_id,
        jsonb_build_object('before', previous_value, 'after', p_start)
      );
  end if;
end;
$$;

revoke all on function public.set_process_validity_start_date(uuid, uuid, date) from public, anon, authenticated;
grant execute on function public.set_process_validity_start_date(uuid, uuid, date) to service_role;

-- ===== 20261125000002_process_contracting_mode.sql =====
-- Define se o processo usa registro de preços (ata + contrato) ou só contrato.
alter table public.administrative_processes
  add column if not exists contracting_mode text
  check (contracting_mode is null or contracting_mode in ('registro_precos', 'contrato'));

create or replace function public.set_process_contracting_mode(p_process uuid, p_actor uuid, p_mode text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  process_row public.administrative_processes;
  previous_value text;
begin
  if p_mode is null or p_mode not in ('registro_precos', 'contrato') then
    raise exception 'Informe se é registro de preços ou somente contrato.';
  end if;

  select * into strict process_row from public.administrative_processes
    where id = p_process for update;

  if not exists (
    select 1 from public.profiles where id = p_actor and active and (
      is_central_admin or exists (
        select 1 from public.council_memberships where user_id = p_actor
          and council_id = process_row.council_id and role in ('council_manager', 'council_operator')
      )
    )
  ) then
    raise exception 'Sem permissão para alterar o modo de contratação deste processo.';
  end if;

  if process_row.documental_snapshot is not null or process_row.status in ('cancelado', 'arquivado') then
    raise exception 'Este processo está encerrado para alterações.';
  end if;

  previous_value := process_row.contracting_mode;
  update public.administrative_processes
    set contracting_mode = p_mode
    where id = p_process;

  if previous_value is distinct from p_mode then
    insert into public.audit_logs(actor_id, action, entity, entity_id, council_id, details)
      values (
        p_actor,
        'process.contracting_mode',
        'administrative_process',
        p_process::text,
        process_row.council_id,
        jsonb_build_object('before', previous_value, 'after', p_mode)
      );
  end if;
end;
$$;

revoke all on function public.set_process_contracting_mode(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.set_process_contracting_mode(uuid, uuid, text) to service_role;

-- ===== 20261125000003_process_price_research_lines.sql =====
-- Linhas da pesquisa de preços (valor de referência por item) + total estimado.
alter table public.administrative_processes
  add column if not exists price_research_lines jsonb;

create or replace function public.set_process_price_research(p_process uuid, p_actor uuid, p_lines jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  process_row public.administrative_processes;
  request_row public.purchase_requests;
  previous_value numeric;
  total_value numeric := 0;
  line jsonb;
  line_total numeric;
begin
  if p_lines is null or jsonb_typeof(p_lines) <> 'array' or jsonb_array_length(p_lines) < 1 then
    raise exception 'Informe ao menos um item com valor de referência.';
  end if;

  for line in select * from jsonb_array_elements(p_lines)
  loop
    begin
      line_total := (line ->> 'lineTotal')::numeric;
    exception when others then
      raise exception 'Valor de referência inválido em um dos itens.';
    end;
    if line_total is null or line_total < 0 or line_total > 9999999999999.99 or line_total <> round(line_total, 2) then
      raise exception 'Informe valores de referência válidos, com até duas casas decimais.';
    end if;
    total_value := total_value + line_total;
  end loop;

  total_value := round(total_value, 2);

  select * into request_row from public.purchase_requests
    where process_id = p_process order by created_at desc, id desc limit 1 for update;
  select * into strict process_row from public.administrative_processes
    where id = p_process for update;

  if not exists (
    select 1 from public.profiles where id = p_actor and active and (
      is_central_admin or exists (
        select 1 from public.council_memberships where user_id = p_actor
          and council_id = process_row.council_id and role in ('council_manager', 'council_operator')
      )
    )
  ) or (request_row.id is not null and request_row.council_id <> process_row.council_id) then
    raise exception 'Sem permissão para alterar a pesquisa de preços deste processo.';
  end if;

  if process_row.documental_snapshot is not null or process_row.status in ('cancelado', 'arquivado') then
    raise exception 'Este processo está encerrado para alterações.';
  end if;

  if request_row.id is not null then
    previous_value := request_row.estimated_value;
    update public.purchase_requests set estimated_value = total_value where id = request_row.id;
  else
    previous_value := process_row.estimated_value;
  end if;

  update public.administrative_processes
    set estimated_value = total_value,
        price_research_lines = p_lines
    where id = p_process;

  update public.process_formalizations
    set estimated_value = total_value,
        savings_value = total_value - contracted_value,
        savings_percent = case when total_value > 0 then round((total_value - contracted_value) / total_value * 100, 2) else 0 end
    where process_id = p_process;

  if previous_value is distinct from total_value then
    insert into public.audit_logs(actor_id, action, entity, entity_id, council_id, details)
      values (
        p_actor,
        'process.price_research',
        'administrative_process',
        p_process::text,
        process_row.council_id,
        jsonb_build_object('before', previous_value, 'after', total_value, 'lines', p_lines, 'requestId', request_row.id)
      );
  end if;
end;
$$;

revoke all on function public.set_process_price_research(uuid, uuid, jsonb) from public, anon, authenticated;
grant execute on function public.set_process_price_research(uuid, uuid, jsonb) to service_role;

-- ===== 20261125000004_contract_ata_link.sql =====
-- Contrato pode consumir saldo de uma ata (vários contratos por ata).
-- Itens do contrato apontam para itens da ata e gravam a quantidade comprometida.

alter table public.contracts
  add column if not exists ata_id uuid references public.price_registration_atas (id);

create index if not exists contracts_ata_id_idx on public.contracts (ata_id);

create table if not exists public.contract_ata_items (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts (id) on delete cascade,
  ata_item_id uuid not null references public.ata_items (id),
  quantity numeric(15,3) not null check (quantity > 0),
  unit_price numeric(15,4) not null default 0 check (unit_price >= 0)
);

create index if not exists contract_ata_items_contract_id_idx on public.contract_ata_items (contract_id);
create index if not exists contract_ata_items_ata_item_id_idx on public.contract_ata_items (ata_item_id);

alter table public.contract_ata_items enable row level security;

drop policy if exists contract_ata_items_select on public.contract_ata_items;
create policy contract_ata_items_select on public.contract_ata_items
  for select to authenticated
  using (
    exists (
      select 1 from public.contracts c
      where c.id = contract_id
        and private.has_council_access(c.council_id)
    )
  );

create or replace function public.save_contract(p jsonb) returns void
language plpgsql set search_path = '' as $$
begin
  insert into public.contracts (
    id, council_id, number, supplier_id, object, start_date, end_date, value, created_at, process_id, ata_id
  )
  values (
    (p ->> 'id')::uuid,
    (p ->> 'council_id')::uuid,
    p ->> 'number',
    nullif(p ->> 'supplier_id', '')::uuid,
    p ->> 'object',
    (p ->> 'start_date')::date,
    (p ->> 'end_date')::date,
    (p ->> 'value')::numeric,
    (p ->> 'created_at')::timestamptz,
    nullif(p ->> 'process_id', '')::uuid,
    nullif(p ->> 'ata_id', '')::uuid
  )
  on conflict (id) do update set
    supplier_id = excluded.supplier_id,
    process_id = excluded.process_id,
    ata_id = excluded.ata_id;

  insert into public.contract_amendments (
    contract_id, sequence, reason, signed_at,
    previous_start_date, previous_end_date, previous_value,
    next_start_date, next_end_date, next_value
  )
  select
    (p ->> 'id')::uuid,
    (a ->> 'sequence')::integer,
    a ->> 'reason',
    (a ->> 'signed_at')::date,
    (a ->> 'previous_start_date')::date,
    (a ->> 'previous_end_date')::date,
    (a ->> 'previous_value')::numeric,
    (a ->> 'next_start_date')::date,
    (a ->> 'next_end_date')::date,
    (a ->> 'next_value')::numeric
  from jsonb_array_elements(coalesce(p -> 'amendments', '[]'::jsonb)) a
  on conflict do nothing;

  insert into public.contract_ata_items (id, contract_id, ata_item_id, quantity, unit_price)
  select
    (i ->> 'id')::uuid,
    (p ->> 'id')::uuid,
    (i ->> 'ata_item_id')::uuid,
    (i ->> 'quantity')::numeric,
    coalesce((i ->> 'unit_price')::numeric, 0)
  from jsonb_array_elements(coalesce(p -> 'ata_items', '[]'::jsonb)) i
  on conflict (id) do update set
    quantity = excluded.quantity,
    unit_price = excluded.unit_price;
end $$;

notify pgrst, 'reload schema';

-- ===== 20261126011635_contract_ata_and_request_reservation.sql =====
-- As políticas de leitura criadas depois do hardening não concedem privilégio de tabela.
-- O RLS continua restringindo as linhas por órgão.
grant select on public.process_formalizations to authenticated;
grant select on public.material_orders to authenticated;
grant select on public.material_order_items to authenticated;
grant select on public.contract_ata_items to authenticated;

-- A ata passa a ser comprometida pelo contrato. Aprovar/cancelar uma solicitação
-- somente muda seu estado e registra o histórico, na mesma transação.
create or replace function public.approve_purchase_request(
  p_request uuid, p_actor uuid, p_at timestamptz, p_note text default null
) returns jsonb
language plpgsql set search_path = '' as $$
declare
  v_request public.purchase_requests%rowtype;
begin
  select * into v_request from public.purchase_requests where id = p_request for update;
  if not found then
    return jsonb_build_object('ok', false, 'code', 'NOT_FOUND', 'message', 'Solicitação não encontrada.');
  end if;
  if v_request.status <> 'em_analise' then
    return jsonb_build_object('ok', false, 'code', 'INVALID_STATE', 'message', 'Somente solicitações em análise podem ser aprovadas.');
  end if;

  update public.purchase_requests set status = 'aprovada' where id = p_request;
  insert into public.purchase_request_events (request_id, position, from_status, to_status, actor_id, at, note)
  values (p_request, private.next_request_event_position(p_request), v_request.status, 'aprovada', p_actor, p_at, p_note);
  return jsonb_build_object('ok', true);
end $$;

-- Impede que updates posteriores desfaçam o vínculo ata/processo. Updates
-- de aditivo que não mudam estes campos continuam válidos para dados legados.
create or replace function private.check_contract_ata_process() returns trigger
language plpgsql set search_path = '' as $$
declare
  v_ata_council uuid;
  v_ata_process uuid;
begin
  if new.ata_id is null then return new; end if;
  select council_id, process_id into v_ata_council, v_ata_process
    from public.price_registration_atas where id = new.ata_id;
  if not found or v_ata_council is distinct from new.council_id then
    raise exception 'A ata deve pertencer ao órgão do contrato.' using errcode = '23514';
  end if;
  if v_ata_process is not null and new.process_id is distinct from v_ata_process then
    raise exception 'A ata e o contrato devem pertencer ao mesmo processo.' using errcode = '23514';
  end if;
  return new;
end $$;

create trigger contract_ata_process_insert
  before insert on public.contracts for each row
  execute function private.check_contract_ata_process();
create trigger contract_ata_process_update
  before update of ata_id, process_id on public.contracts for each row
  when (old.ata_id is distinct from new.ata_id or old.process_id is distinct from new.process_id)
  execute function private.check_contract_ata_process();

-- Criação de contrato e consumo da ata em uma única transação. A trava da linha
-- de cada item serializa a conferência do saldo com outros compromissos.
create or replace function public.create_contract_with_ata(p jsonb) returns jsonb
language plpgsql set search_path = '' as $$
declare
  v_ata public.price_registration_atas%rowtype;
  v_item record;
  v_contract_council uuid := (p ->> 'council_id')::uuid;
  v_contract_process uuid := nullif(p ->> 'process_id', '')::uuid;
  v_ata_id uuid := nullif(p ->> 'ata_id', '')::uuid;
  v_committed numeric;
  v_allocated numeric;
  v_council_committed numeric;
  v_end_date date;
begin
  -- Serializa reenvios concorrentes do mesmo contrato antes da checagem de ID.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p ->> 'id', 0));
  if exists (select 1 from public.contracts where id = (p ->> 'id')::uuid) then
    return jsonb_build_object('ok', false, 'code', 'CONFLICT', 'message', 'Contrato já cadastrado.');
  end if;
  if v_ata_id is null then
    if jsonb_array_length(coalesce(p -> 'ata_items', '[]'::jsonb)) > 0 then
      return jsonb_build_object('ok', false, 'code', 'VALIDATION', 'message', 'Informe a ata dos itens contratados.');
    end if;
    perform public.save_contract(p);
    return jsonb_build_object('ok', true);
  end if;

  select * into v_ata from public.price_registration_atas where id = v_ata_id;
  if not found then
    return jsonb_build_object('ok', false, 'code', 'NOT_FOUND', 'message', 'Ata não encontrada.');
  end if;
  if v_ata.council_id <> v_contract_council then
    return jsonb_build_object('ok', false, 'code', 'VALIDATION', 'message', 'A ata deve pertencer ao órgão do contrato.');
  end if;
  if v_ata.status <> 'vigente' then
    return jsonb_build_object('ok', false, 'code', 'INVALID_STATE', 'message', 'A ata não está vigente.');
  end if;
  if v_ata.process_id is not null and v_contract_process is distinct from v_ata.process_id then
    return jsonb_build_object('ok', false, 'code', 'VALIDATION', 'message', 'Ata e contrato devem pertencer ao mesmo processo.');
  end if;
  select coalesce(max(new_end_date), (v_ata.start_date + interval '1 year' - interval '1 day')::date)
    into v_end_date from public.ata_extensions where ata_id = v_ata_id;
  if (now() at time zone 'America/Fortaleza')::date > v_end_date then
    return jsonb_build_object('ok', false, 'code', 'INVALID_STATE', 'message', 'A ata está vencida.');
  end if;
  if jsonb_array_length(coalesce(p -> 'ata_items', '[]'::jsonb)) = 0 then
    return jsonb_build_object('ok', false, 'code', 'VALIDATION', 'message', 'Informe ao menos um item da ata.');
  end if;
  if exists (
    select 1 from jsonb_array_elements(p -> 'ata_items') i
    group by i ->> 'ata_item_id' having count(*) > 1
  ) then
    return jsonb_build_object('ok', false, 'code', 'VALIDATION', 'message', 'Item da ata repetido no contrato.');
  end if;

  for v_item in
    select (i ->> 'ata_item_id')::uuid as item_id, (i ->> 'quantity')::numeric as quantity
      from jsonb_array_elements(p -> 'ata_items') i
     order by (i ->> 'ata_item_id')::uuid
  loop
    perform 1 from public.ata_items where id = v_item.item_id and ata_id = v_ata_id for update;
    if not found then
      return jsonb_build_object('ok', false, 'code', 'VALIDATION', 'message', 'Item não pertence à ata selecionada.');
    end if;
    if v_item.quantity is null or v_item.quantity <= 0 then
      return jsonb_build_object('ok', false, 'code', 'VALIDATION', 'message', 'Quantidade contratada inválida.');
    end if;
    select coalesce(sum(case when event_type = 'commit' then quantity else -quantity end), 0)
      into v_committed from public.ata_commitments where item_id = v_item.item_id;
    if v_item.quantity > (select registered_quantity from public.ata_items where id = v_item.item_id) - v_committed then
      return jsonb_build_object('ok', false, 'code', 'INSUFFICIENT_BALANCE', 'message', 'Saldo insuficiente na ata.');
    end if;
    select quantity into v_allocated from public.ata_allocations
      where item_id = v_item.item_id and council_id = v_contract_council;
    if found then
      select coalesce(sum(case when event_type = 'commit' then quantity else -quantity end), 0)
        into v_council_committed from public.ata_commitments
       where item_id = v_item.item_id and council_id = v_contract_council;
      if v_item.quantity > v_allocated - v_council_committed then
        return jsonb_build_object('ok', false, 'code', 'INSUFFICIENT_BALANCE', 'message', 'Alocação insuficiente na ata.');
      end if;
    end if;
  end loop;

  perform public.save_contract(p);
  insert into public.ata_commitments (item_id, event_type, quantity, council_id, legal_basis)
  select (i ->> 'ata_item_id')::uuid, 'commit', (i ->> 'quantity')::numeric,
         v_contract_council, 'contract:' || (p ->> 'id')
    from jsonb_array_elements(p -> 'ata_items') i;
  return jsonb_build_object('ok', true);
end $$;

revoke all on function public.create_contract_with_ata(jsonb) from public, anon, authenticated;
grant execute on function public.create_contract_with_ata(jsonb) to service_role;

create or replace function public.cancel_purchase_request(
  p_request uuid, p_actor uuid, p_at timestamptz, p_note text default null
) returns jsonb
language plpgsql set search_path = '' as $$
declare
  v_request public.purchase_requests%rowtype;
begin
  select * into v_request from public.purchase_requests where id = p_request for update;
  if not found then
    return jsonb_build_object('ok', false, 'code', 'NOT_FOUND', 'message', 'Solicitação não encontrada.');
  end if;
  if v_request.status not in ('rascunho', 'enviada', 'em_analise', 'aprovada') then
    return jsonb_build_object('ok', false, 'code', 'INVALID_STATE', 'message', 'A solicitação não pode mais ser cancelada.');
  end if;

  update public.purchase_requests set status = 'cancelada' where id = p_request;
  insert into public.purchase_request_events (request_id, position, from_status, to_status, actor_id, at, note)
  values (p_request, private.next_request_event_position(p_request), v_request.status, 'cancelada', p_actor, p_at, p_note);
  return jsonb_build_object('ok', true);
end $$;

revoke all on function public.approve_purchase_request(uuid, uuid, timestamptz, text) from public, anon, authenticated;
revoke all on function public.cancel_purchase_request(uuid, uuid, timestamptz, text) from public, anon, authenticated;
grant execute on function public.approve_purchase_request(uuid, uuid, timestamptz, text) to service_role;
grant execute on function public.cancel_purchase_request(uuid, uuid, timestamptz, text) to service_role;

-- Ledger append-only: libera exatamente o saldo líquido das reservas antigas
-- feitas na aprovação. Considera cancelamentos já lançados e a marca desta
-- migração para permitir reaplicação segura em um ambiente de desenvolvimento.
do $$
declare
  reservation record;
  committed numeric;
  released numeric;
  outstanding numeric;
  available_committed numeric;
begin
  for reservation in
    select item_id, council_id, substring(legal_basis from 9) as request_id
    from public.ata_commitments
    where event_type = 'commit'
      and legal_basis ~ '^request:[0-9a-fA-F-]{36}$'
    group by item_id, council_id, substring(legal_basis from 9)
    order by item_id, council_id, substring(legal_basis from 9)
  loop
    perform 1 from public.ata_items where id = reservation.item_id for update;

    select coalesce(sum(quantity), 0) into committed
    from public.ata_commitments
    where item_id = reservation.item_id and council_id = reservation.council_id
      and event_type = 'commit' and legal_basis = 'request:' || reservation.request_id;
    select coalesce(sum(quantity), 0) into released
    from public.ata_commitments
    where item_id = reservation.item_id and council_id = reservation.council_id
      and event_type = 'release'
      and legal_basis in ('cancelamento ' || reservation.request_id,
                          'migration:release:request:' || reservation.request_id);
    outstanding := committed - released;
    if outstanding < 0 then
      raise exception 'Reserva antiga da solicitação % já foi liberada em excesso.', reservation.request_id;
    end if;
    if outstanding = 0 then continue; end if;

    select coalesce(sum(case when event_type = 'commit' then quantity else -quantity end), 0)
      into available_committed
    from public.ata_commitments where item_id = reservation.item_id;
    if outstanding > available_committed then
      raise exception 'Saldo comprometido insuficiente para liberar a reserva antiga da solicitação %.', reservation.request_id;
    end if;
    insert into public.ata_commitments (item_id, event_type, quantity, council_id, legal_basis)
    values (reservation.item_id, 'release', outstanding, reservation.council_id,
            'migration:release:request:' || reservation.request_id);
  end loop;
end $$;

-- ===== 20261126011903_atomic_purchase_receipt.sql =====
-- Recebimento em uma transação: a linha do processo serializa todos os
-- recebimentos que concorrem pelo mesmo teto contratual.
create function public.receive_purchase_request(
  p_request uuid, p_actor uuid, p_at timestamptz,
  p_receipt_key text, p_lines jsonb,
  p_close_incomplete boolean default false, p_justification text default null
) returns jsonb
language plpgsql set search_path = '' as $$
declare
  v_request public.purchase_requests%rowtype;
  v_process public.administrative_processes%rowtype;
  v_line record;
  v_ata_line record;
  v_item public.purchase_request_items%rowtype;
  v_contract_count integer;
  v_ata_contract_count integer;
  v_contract_total numeric;
  v_received_total numeric;
  v_complete boolean;
  v_target text;
  v_from text;
  v_balance public.stock_balances%rowtype;
begin
  if p_receipt_key is null or length(trim(p_receipt_key)) < 8
     or p_lines is null or jsonb_typeof(p_lines) <> 'array' then
    return jsonb_build_object('ok', false, 'code', 'VALIDATION', 'message', 'Informe uma chave e itens válidos.');
  end if;
  if jsonb_array_length(p_lines) = 0 then
    return jsonb_build_object('ok', false, 'code', 'VALIDATION', 'message', 'Informe uma chave e itens válidos.');
  end if;

  -- Ler o processo antes da solicitação evita deadlock com outros recebimentos.
  select * into v_request from public.purchase_requests where id = p_request;
  if not found then
    return jsonb_build_object('ok', false, 'code', 'NOT_FOUND', 'message', 'Solicitação não encontrada.');
  end if;
  if v_request.process_id is null then
    return jsonb_build_object('ok', false, 'code', 'INVALID_STATE', 'message', 'Vincule a solicitação a um processo antes do recebimento.');
  end if;
  select * into v_process from public.administrative_processes
    where id = v_request.process_id and council_id = v_request.council_id for update;
  if not found then
    return jsonb_build_object('ok', false, 'code', 'INVALID_STATE', 'message', 'Processo da solicitação não encontrado no órgão.');
  end if;
  select * into v_request from public.purchase_requests where id = p_request for update;
  if v_request.process_id is distinct from v_process.id or v_request.council_id is distinct from v_process.council_id then
    return jsonb_build_object('ok', false, 'code', 'CONFLICT', 'message', 'O vínculo da solicitação com o processo mudou.');
  end if;
  if exists(select 1 from public.purchase_receipt_keys where request_id = p_request and receipt_key = p_receipt_key) then
    return jsonb_build_object('ok', true);
  end if;
  if v_request.status not in ('aprovada', 'em_atendimento', 'parcialmente_atendida') then
    return jsonb_build_object('ok', false, 'code', 'INVALID_STATE', 'message', 'A solicitação não está em fase de recebimento.');
  end if;

  select count(*), count(*) filter (where ata_id is not null)
    into v_contract_count, v_ata_contract_count
    from public.contracts where process_id = v_request.process_id and council_id = v_request.council_id;
  if v_contract_count = 0 or (v_process.contracting_mode = 'registro_precos' and v_ata_contract_count = 0) then
    return jsonb_build_object('ok', false, 'code', 'INVALID_STATE', 'message', 'Cadastre o contrato vinculado ao processo antes do recebimento.');
  end if;

  begin
    -- Conferir o teto uma vez por item da ata antes de alterar qualquer total.
    -- Assim duas linhas do mesmo item não contam a primeira duas vezes.
    for v_ata_line in
      select ri.ata_item_id, sum((line.value ->> 'received')::numeric) as incoming
        from jsonb_array_elements(p_lines) line
        join public.purchase_request_items ri on ri.id = (line.value ->> 'item_id')::uuid
       where ri.request_id = p_request and ri.ata_item_id is not null
       group by ri.ata_item_id
    loop
      select coalesce(sum(ci.quantity), 0) into v_contract_total
        from public.contract_ata_items ci
        join public.contracts c on c.id = ci.contract_id
       where c.process_id = v_request.process_id and c.council_id = v_request.council_id
         and c.ata_id is not null and ci.ata_item_id = v_ata_line.ata_item_id;
      select coalesce(sum(ri.received_total), 0) into v_received_total
        from public.purchase_request_items ri
        join public.purchase_requests r on r.id = ri.request_id
       where r.process_id = v_request.process_id and ri.ata_item_id = v_ata_line.ata_item_id;
      if v_contract_total = 0 or v_received_total + v_ata_line.incoming > v_contract_total then
        perform private.business_error('VALIDATION', 'Quantidade acima do contratado para o item da ata.');
      end if;
    end loop;

    for v_line in
      select (value ->> 'item_id')::uuid as item_id, sum((value ->> 'received')::numeric) as quantity
        from jsonb_array_elements(p_lines) value
       group by (value ->> 'item_id')::uuid
       order by (value ->> 'item_id')::uuid
    loop
      select * into v_item from public.purchase_request_items
        where id = v_line.item_id and request_id = p_request for update;
      if not found then perform private.business_error('NOT_FOUND', 'Item não pertence à solicitação.'); end if;
      if v_line.quantity <= 0 or v_item.received_total + v_line.quantity > v_item.quantity then
        perform private.business_error('VALIDATION', 'Quantidade recebida excede o pedido.');
      end if;
      insert into public.stock_balances (council_id, material_id)
      values (v_request.council_id, v_item.material_id) on conflict do nothing;
      select * into v_balance from public.stock_balances
        where council_id = v_request.council_id and material_id = v_item.material_id for update;
      insert into public.stock_movements
        (council_id, material_id, type, quantity, idempotency_key, reason, reference, actor_id)
      values (v_request.council_id, v_item.material_id, 'entry', v_line.quantity,
        'receipt:' || p_receipt_key || ':' || v_item.id, 'Recebimento de compra',
        'request:' || p_request, p_actor);
      update public.stock_balances
         set physical = physical + v_line.quantity, version = version + 1, updated_at = now()
       where council_id = v_request.council_id and material_id = v_item.material_id;
      update public.purchase_request_items
         set received_total = received_total + v_line.quantity where id = v_item.id;
    end loop;

    select bool_and(received_total = quantity) into v_complete
      from public.purchase_request_items where request_id = p_request;
    if p_close_incomplete and not v_complete and length(trim(coalesce(p_justification, ''))) < 15 then
      perform private.business_error('VALIDATION', 'A justificativa deve ter no mínimo 15 caracteres.');
    end if;
    v_target := case when p_close_incomplete or v_complete then 'atendida' else 'parcialmente_atendida' end;
    v_from := v_request.status;
    if v_from = 'aprovada' then
      insert into public.purchase_request_events (request_id, position, from_status, to_status, actor_id, at)
      values (p_request, private.next_request_event_position(p_request), 'aprovada', 'em_atendimento', p_actor, p_at);
      v_from := 'em_atendimento';
    end if;
    update public.purchase_requests set status = v_target where id = p_request;
    insert into public.purchase_request_events (request_id, position, from_status, to_status, actor_id, at, note)
    values (p_request, private.next_request_event_position(p_request), v_from, v_target, p_actor, p_at,
      case when p_close_incomplete and not v_complete then trim(p_justification) else null end);
    insert into public.purchase_receipt_keys (request_id, receipt_key) values (p_request, p_receipt_key);
  exception when sqlstate 'P0001' then
    return jsonb_build_object('ok', false, 'code', split_part(sqlerrm, '|', 1), 'message', split_part(sqlerrm, '|', 2));
  end;
  return jsonb_build_object('ok', true);
end $$;

revoke all on function public.receive_purchase_request(uuid, uuid, timestamptz, text, jsonb, boolean, text)
  from public, anon, authenticated;
grant execute on function public.receive_purchase_request(uuid, uuid, timestamptz, text, jsonb, boolean, text)
  to service_role;

-- ===== 20261126020000_profile_staff_category.sql =====
-- Classificação declarada para relatórios individuais/mensais. Registros antigos permanecem sem classificação.
alter table public.profiles add column staff_category text not null default 'unclassified'
  check (staff_category in ('unclassified', 'collaborator', 'intern'));
create index idx_profiles_staff_category on public.profiles (staff_category) where staff_category = 'intern';

-- ===== 20261126020100_meeting_evidence.sql =====
create table public.meeting_attendance (
  meeting_id uuid not null references public.meetings(id),
  participant_id uuid not null references public.profiles(id),
  recorded_by uuid not null references public.profiles(id),
  recorded_at timestamptz not null default now(),
  primary key (meeting_id, participant_id)
);
create table public.meeting_task_completions (
  task_id uuid primary key references public.meeting_action_items(id),
  completed_by uuid not null references public.profiles(id),
  completed_at timestamptz not null default now(),
  due_date date
);
alter table public.meeting_attendance enable row level security;
alter table public.meeting_task_completions enable row level security;
revoke all on public.meeting_attendance, public.meeting_task_completions from anon, authenticated;
grant select on public.meeting_attendance, public.meeting_task_completions to service_role;

-- Writes go through the authorized server operation and commit together with the audit event.
create function public.record_meeting_evidence(p_meeting uuid, p_actor uuid, p_target uuid, p_kind text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  m public.meetings%rowtype;
  changed integer;
begin
  select * into m from public.meetings where id = p_meeting for update;
  if not found or not exists (
    select 1 from public.profiles p where p.id = p_actor and p.active and
      (p.is_central_admin or exists (select 1 from public.council_memberships cm
        where cm.council_id = m.council_id and cm.user_id = p_actor
          and cm.role in ('council_manager','council_operator')))
  ) then return false; end if;

  if p_kind = 'attendance' then
    if m.status <> 'realizada' or not exists (
      select 1 from public.council_memberships where council_id = m.council_id and user_id = p_target
    ) then return false; end if;
    insert into public.meeting_attendance (meeting_id, participant_id, recorded_by)
      values (p_meeting, p_target, p_actor) on conflict do nothing;
  elsif p_kind = 'completion' then
    insert into public.meeting_task_completions (task_id, completed_by, due_date)
      select id, p_actor, due_date from public.meeting_action_items
      where id = p_target and meeting_id = p_meeting and not done
      on conflict do nothing;
  else return false;
  end if;

  get diagnostics changed = row_count;
  if changed = 0 then return false; end if;
  if p_kind = 'completion' then
    update public.meeting_action_items set done = true where id = p_target;
  end if;
  insert into public.audit_logs (actor_id, action, entity, entity_id, council_id, details)
    values (p_actor, 'meeting.' || p_kind, 'meeting', p_meeting::text, m.council_id,
      jsonb_build_object('targetId', p_target));
  return true;
end $$;
revoke all on function public.record_meeting_evidence(uuid,uuid,uuid,text) from public, anon, authenticated;
grant execute on function public.record_meeting_evidence(uuid,uuid,uuid,text) to service_role;

-- A save based on an older meeting snapshot cannot undo a recorded completion.
create function private.keep_meeting_task_completion() returns trigger
language plpgsql set search_path = '' as $$
begin
  if exists (select 1 from public.meeting_task_completions where task_id = old.id) then
    new.done := true;
  end if;
  return new;
end $$;
create trigger keep_meeting_task_completion before update on public.meeting_action_items
for each row execute function private.keep_meeting_task_completion();

-- ===== 20261126020200_process_assignment_contract_closure.sql =====
-- Campos opcionais preservam os processos e contratos anteriores.
alter table public.administrative_processes
  add column responsible_id uuid references public.profiles(id),
  add column process_type text check (process_type is null or length(trim(process_type)) between 1 and 80);
create index administrative_processes_responsible_id_idx on public.administrative_processes(responsible_id)
  where responsible_id is not null;

create function private.check_process_responsible_membership() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.responsible_id is not null and not exists (
    select 1 from public.council_memberships m join public.profiles p on p.id = m.user_id
    where m.user_id = new.responsible_id and m.council_id = new.council_id and p.active
  ) then
    raise check_violation using message = 'O responsável precisa ser usuário ativo do órgão do processo.';
  end if;
  return new;
end $$;
create trigger administrative_processes_responsible_membership
before insert or update of responsible_id, council_id on public.administrative_processes
for each row execute function private.check_process_responsible_membership();

alter table public.contracts
  add column closed_at timestamptz,
  add column closed_by uuid references public.profiles(id);
alter table public.contracts add constraint contracts_closure_pair
  check ((closed_at is null) = (closed_by is null));

-- O recebimento antigo continua sem contrato individual conhecido.
create table public.contract_receipt_lines (
  request_id uuid not null references public.purchase_requests(id),
  receipt_key text not null,
  request_item_id uuid not null references public.purchase_request_items(id),
  contract_id uuid not null references public.contracts(id),
  ata_item_id uuid references public.ata_items(id),
  quantity numeric(15,3) not null check (quantity > 0),
  created_at timestamptz not null default now(),
  primary key (request_id, receipt_key, request_item_id),
  foreign key (request_id, receipt_key) references public.purchase_receipt_keys(request_id, receipt_key)
);
create index contract_receipt_lines_contract_idx on public.contract_receipt_lines(contract_id);
alter table public.contract_receipt_lines enable row level security;
create policy contract_receipt_lines_select on public.contract_receipt_lines
for select to authenticated using (exists (
  select 1 from public.purchase_requests r where r.id = request_id
  and private.has_council_access(r.council_id)
));
grant select on public.contract_receipt_lines to authenticated;

-- O wrapper preserva todas as regras da RPC vigente e grava a atribuição na
-- mesma transação. Falha de qualquer inserção reverte o recebimento inteiro.
create function public.receive_purchase_request_for_contract(
  p_request uuid, p_contract uuid, p_actor uuid, p_at timestamptz,
  p_receipt_key text, p_lines jsonb,
  p_close_incomplete boolean default false, p_justification text default null
) returns jsonb language plpgsql set search_path = '' as $$
declare
  v_request public.purchase_requests%rowtype;
  v_contract public.contracts%rowtype;
  v_line record;
  v_contract_total numeric;
  v_attributed numeric;
  v_received_total numeric;
  v_other_contracts integer;
  v_result jsonb;
begin
  if p_contract is null or p_lines is null or jsonb_typeof(p_lines) <> 'array' then
    return jsonb_build_object('ok', false, 'code', 'VALIDATION', 'message', 'Selecione um contrato válido.');
  end if;
  select * into v_request from public.purchase_requests where id = p_request;
  if not found then
    return jsonb_build_object('ok', false, 'code', 'NOT_FOUND', 'message', 'Solicitação não encontrada.');
  end if;
  -- A mesma linha de processo serializa recebimentos de contratos distintos.
  perform 1 from public.administrative_processes
    where id = v_request.process_id and council_id = v_request.council_id for update;
  select * into v_contract from public.contracts where id = p_contract;
  if not found or v_contract.process_id is distinct from v_request.process_id
    or v_contract.council_id is distinct from v_request.council_id then
    return jsonb_build_object('ok', false, 'code', 'VALIDATION', 'message', 'Contrato incompatível com a solicitação e o órgão.');
  end if;
  if exists(select 1 from public.purchase_receipt_keys where request_id = p_request and receipt_key = p_receipt_key) then
    if exists(select 1 from public.contract_receipt_lines
      where request_id = p_request and receipt_key = p_receipt_key and contract_id <> p_contract) then
      return jsonb_build_object('ok', false, 'code', 'CONFLICT', 'message', 'A chave de recebimento já pertence a outro contrato.');
    end if;
    return jsonb_build_object('ok', true);
  end if;
  for v_line in
    select ri.id as item_id, ri.ata_item_id, sum((line.value ->> 'received')::numeric) as quantity
    from jsonb_array_elements(p_lines) line
    join public.purchase_request_items ri on ri.id = (line.value ->> 'item_id')::uuid
    where ri.request_id = p_request
    group by ri.id, ri.ata_item_id
  loop
    if v_line.ata_item_id is not null then
      select coalesce(sum(ci.quantity), 0) into v_contract_total
      from public.contract_ata_items ci where ci.contract_id = p_contract and ci.ata_item_id = v_line.ata_item_id;
      if v_contract.ata_id is null or v_contract_total = 0 then
        return jsonb_build_object('ok', false, 'code', 'VALIDATION', 'message', 'Item da ata não pertence ao contrato escolhido.');
      end if;
      select coalesce(sum(cr.quantity), 0) into v_attributed
      from public.contract_receipt_lines cr where cr.contract_id = p_contract and cr.ata_item_id = v_line.ata_item_id;
      select coalesce(sum(ri.received_total), 0) into v_received_total
      from public.purchase_request_items ri join public.purchase_requests r on r.id = ri.request_id
      where r.process_id = v_request.process_id and r.council_id = v_request.council_id
        and ri.ata_item_id = v_line.ata_item_id;
      select count(*) into v_other_contracts from public.contract_ata_items ci
      join public.contracts c on c.id = ci.contract_id
      where c.id <> p_contract and c.process_id = v_request.process_id and c.council_id = v_request.council_id
        and ci.ata_item_id = v_line.ata_item_id;
      if v_other_contracts > 0 and v_received_total > (
        select coalesce(sum(cr.quantity), 0) from public.contract_receipt_lines cr
        join public.contracts c on c.id = cr.contract_id
        where c.process_id = v_request.process_id and c.council_id = v_request.council_id
          and cr.ata_item_id = v_line.ata_item_id
      ) then
        return jsonb_build_object('ok', false, 'code', 'CONFLICT', 'message', 'Há recebimentos históricos sem contrato individual comprovado para este item.');
      end if;
      if v_attributed + (case when v_other_contracts = 0 then v_received_total - v_attributed else 0 end) + v_line.quantity > v_contract_total then
        return jsonb_build_object('ok', false, 'code', 'VALIDATION', 'message', 'Quantidade acima do saldo contratado para este contrato.');
      end if;
    elsif v_contract.ata_id is not null then
      return jsonb_build_object('ok', false, 'code', 'VALIDATION', 'message', 'Item sem ata não corresponde ao contrato escolhido.');
    end if;
  end loop;
  v_result := public.receive_purchase_request(p_request, p_actor, p_at, p_receipt_key,
    p_lines, p_close_incomplete, p_justification);
  if not coalesce((v_result ->> 'ok')::boolean, false) then return v_result; end if;
  insert into public.contract_receipt_lines(request_id, receipt_key, request_item_id, contract_id, ata_item_id, quantity)
  select p_request, p_receipt_key, ri.id, p_contract, ri.ata_item_id, sum((line.value ->> 'received')::numeric)
  from jsonb_array_elements(p_lines) line
  join public.purchase_request_items ri on ri.id = (line.value ->> 'item_id')::uuid
  where ri.request_id = p_request
  group by ri.id, ri.ata_item_id;
  return v_result;
end $$;
revoke all on function public.receive_purchase_request_for_contract(uuid, uuid, uuid, timestamptz, text, jsonb, boolean, text)
  from public, anon, authenticated;
grant execute on function public.receive_purchase_request_for_contract(uuid, uuid, uuid, timestamptz, text, jsonb, boolean, text)
  to service_role;

-- ===== 20261126020300_contract_receipt_integrity.sql =====
-- Protege o vínculo mesmo se uma gravação contornar a RPC de recebimento.
create function private.check_contract_receipt_line() returns trigger
language plpgsql set search_path = '' as $$
begin
  if not exists (
    select 1
    from public.purchase_request_items ri
    join public.purchase_requests r on r.id = ri.request_id
    join public.contracts c on c.id = new.contract_id
    where ri.id = new.request_item_id and ri.request_id = new.request_id
      and c.council_id = r.council_id and c.process_id = r.process_id
      and ri.ata_item_id is not distinct from new.ata_item_id
      and (
        (ri.ata_item_id is null and c.ata_id is null)
        or exists (
          select 1 from public.contract_ata_items ci
          join public.ata_items ai on ai.id = ci.ata_item_id
          where ci.contract_id = c.id and ci.ata_item_id = ri.ata_item_id
            and ai.ata_id = c.ata_id
        )
      )
  ) then
    raise check_violation using message = 'Recebimento, contrato, item da ata e órgão incompatíveis.';
  end if;
  return new;
end $$;
create trigger contract_receipt_line_integrity
before insert or update on public.contract_receipt_lines
for each row execute function private.check_contract_receipt_line();

commit;
