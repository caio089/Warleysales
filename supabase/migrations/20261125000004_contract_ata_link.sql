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
