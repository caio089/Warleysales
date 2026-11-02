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
