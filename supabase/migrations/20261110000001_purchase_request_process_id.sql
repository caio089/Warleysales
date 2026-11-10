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
