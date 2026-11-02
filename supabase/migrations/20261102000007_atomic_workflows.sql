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
