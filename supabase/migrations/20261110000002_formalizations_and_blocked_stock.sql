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
