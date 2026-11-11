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
