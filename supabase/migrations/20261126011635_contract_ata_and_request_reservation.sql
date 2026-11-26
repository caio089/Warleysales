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
