-- Resolve o item da ata no momento do recebimento, após a escolha do contrato.
-- A solicitação pode ter sido aprovada antes da ata ou apontar para uma ata substituída.
create function public.receive_purchase_request_for_selected_contract(
  p_request uuid, p_contract uuid, p_actor uuid, p_at timestamptz,
  p_receipt_key text, p_lines jsonb,
  p_close_incomplete boolean default false, p_justification text default null
) returns jsonb language plpgsql set search_path = '' as $$
declare
  v_request public.purchase_requests%rowtype;
  v_contract public.contracts%rowtype;
  v_item record;
  v_selected_item uuid;
  v_latest_ata uuid;
  v_result jsonb;
begin
  select * into v_request from public.purchase_requests where id = p_request;
  if not found then
    return jsonb_build_object('ok', false, 'code', 'NOT_FOUND', 'message', 'Solicitação não encontrada.');
  end if;
  perform 1 from public.administrative_processes
    where id = v_request.process_id and council_id = v_request.council_id for update;
  select * into v_contract from public.contracts where id = p_contract;
  if not found or v_contract.process_id is distinct from v_request.process_id
    or v_contract.council_id is distinct from v_request.council_id then
    return jsonb_build_object('ok', false, 'code', 'VALIDATION', 'message', 'Contrato incompatível com a solicitação.');
  end if;
  if v_contract.ata_id is null then
    return public.receive_purchase_request_for_contract(p_request, p_contract, p_actor, p_at,
      p_receipt_key, p_lines, p_close_incomplete, p_justification);
  end if;
  if p_lines is null or jsonb_typeof(p_lines) <> 'array' then
    return jsonb_build_object('ok', false, 'code', 'VALIDATION', 'message', 'Informe os itens do recebimento.');
  end if;
  -- O bloco interno reverte a remarcação se a RPC de recebimento rejeitar alguma linha.
  begin
    for v_item in
      select distinct ri.id, ri.material_id, ri.ata_item_id, ri.received_total
      from jsonb_array_elements(p_lines) line
      join public.purchase_request_items ri on ri.id = (line.value ->> 'item_id')::uuid
      where ri.request_id = p_request
    loop
      select ai.id into v_selected_item
      from public.contract_ata_items ci
      join public.ata_items ai on ai.id = ci.ata_item_id
      where ci.contract_id = p_contract and ai.ata_id = v_contract.ata_id
        and ai.material_id = v_item.material_id and ci.quantity > 0
      order by ai.seq limit 1;
      select a.id into v_latest_ata
      from public.price_registration_atas a
      join public.ata_items ai on ai.ata_id = a.id
      where a.process_id = v_request.process_id and ai.material_id = v_item.material_id
      order by a.created_at desc, a.id desc limit 1;
      if v_selected_item is null or v_latest_ata is distinct from v_contract.ata_id then
        return jsonb_build_object('ok', false, 'code', 'VALIDATION', 'message', 'O item não pertence à ata atual do contrato escolhido.');
      end if;
      if v_item.ata_item_id is distinct from v_selected_item and v_item.received_total > 0 then
        return jsonb_build_object('ok', false, 'code', 'CONFLICT', 'message', 'Este item já tem recebimentos associados a outra ata. Crie uma nova solicitação para o saldo.');
      end if;
    end loop;
    update public.purchase_request_items ri set ata_item_id = ai.id
    from public.contract_ata_items ci
    join public.ata_items ai on ai.id = ci.ata_item_id
    where ci.contract_id = p_contract and ai.ata_id = v_contract.ata_id
      and ri.request_id = p_request and ri.material_id = ai.material_id
      and ri.id in (select (line.value ->> 'item_id')::uuid from jsonb_array_elements(p_lines) line)
      and ri.ata_item_id is distinct from ai.id;
    v_result := public.receive_purchase_request_for_contract(p_request, p_contract, p_actor, p_at,
      p_receipt_key, p_lines, p_close_incomplete, p_justification);
    if not coalesce((v_result ->> 'ok')::boolean, false) then
      raise exception using errcode = 'P1234', message = 'receipt rejected';
    end if;
  exception when sqlstate 'P1234' then
    return v_result;
  end;
  return v_result;
end $$;
revoke all on function public.receive_purchase_request_for_selected_contract(uuid, uuid, uuid, timestamptz, text, jsonb, boolean, text) from public, anon, authenticated;
grant execute on function public.receive_purchase_request_for_selected_contract(uuid, uuid, uuid, timestamptz, text, jsonb, boolean, text) to service_role;
