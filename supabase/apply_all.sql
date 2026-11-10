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

commit;
