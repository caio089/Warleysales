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
