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
