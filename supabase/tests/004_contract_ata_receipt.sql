-- Execute em PostgreSQL isolado com as migrations aplicadas.
begin;

do $$
declare
  v_actor uuid := gen_random_uuid();
  v_outsider uuid := gen_random_uuid();
  v_council uuid := gen_random_uuid();
  v_other_council uuid := gen_random_uuid();
  v_material uuid := gen_random_uuid();
  v_process uuid := gen_random_uuid();
  v_ata uuid := gen_random_uuid();
  v_ata_item uuid := gen_random_uuid();
  v_first_request uuid := gen_random_uuid();
  v_second_request uuid := gen_random_uuid();
  v_first_item uuid := gen_random_uuid();
  v_second_item uuid := gen_random_uuid();
  v_contract jsonb;
  v_result jsonb;
  v_line jsonb;
  v_number integer;
begin
  insert into auth.users (id, email) values
    (v_actor, 'contrato-ata@teste.local'), (v_outsider, 'outro-orgao@teste.local');
  insert into public.councils (id, name, acronym) values
    (v_council, 'Conselho de teste', 'CT'), (v_other_council, 'Outro conselho', 'OC');
  insert into public.council_memberships (user_id, council_id, role) values
    (v_actor, v_council, 'council_manager'), (v_outsider, v_other_council, 'council_manager');
  insert into public.materials (id, code, name, unit) values (v_material, 'CAT', 'Material de teste', 'un');
  insert into public.administrative_processes
    (id, council_id, sequence, year, number, title, created_by, contracting_mode)
  values (v_process, v_council, 1, 2026, '1/2026', 'Registro de preços de teste', v_actor, 'registro_precos');
  insert into public.price_registration_atas (id, council_id, process_id, number, start_date, status)
  values (v_ata, v_council, v_process, 'ATA-TESTE', current_date, 'vigente');
  insert into public.ata_items (id, ata_id, description, material_id, registered_quantity, unit_price)
  values (v_ata_item, v_ata, 'Material de teste', v_material, 1, 0.03);
  insert into public.purchase_requests (id, council_id, process_id, title, status, created_by) values
    (v_first_request, v_council, v_process, 'Primeira solicitação', 'aprovada', v_actor),
    (v_second_request, v_council, v_process, 'Segunda solicitação', 'aprovada', v_actor);
  insert into public.purchase_request_items (id, request_id, material_id, quantity, ata_item_id) values
    (v_first_item, v_first_request, v_material, 0.375, v_ata_item),
    (v_second_item, v_second_request, v_material, 1, v_ata_item);

  v_line := jsonb_build_array(jsonb_build_object('item_id', v_first_item, 'received', 0.375));
  v_result := public.receive_purchase_request(v_first_request, v_actor, now(), 'primeira-entrega', v_line);
  assert v_result ->> 'code' = 'INVALID_STATE', 'Recebimento sem contrato deve ser bloqueado';

  for v_number in 1..3 loop
    v_contract := jsonb_build_object(
      'id', gen_random_uuid(), 'council_id', v_council, 'process_id', v_process, 'ata_id', v_ata,
      'number', 'TESTE-' || v_number, 'object', 'Material de teste', 'created_at', now(),
      'start_date', current_date, 'end_date', current_date + 30, 'value', 0.01,
      'ata_items', jsonb_build_array(jsonb_build_object(
        'id', gen_random_uuid(), 'ata_item_id', v_ata_item, 'quantity', 0.375, 'unit_price', 0.03
      ))
    );
    v_result := public.create_contract_with_ata(v_contract);
    if v_number < 3 then
      assert v_result ->> 'ok' = 'true', 'A mesma ata deve aceitar mais de um contrato';
      v_result := public.create_contract_with_ata(v_contract);
      assert v_result ->> 'code' = 'CONFLICT', 'Reenvio do mesmo contrato não deve duplicar o compromisso';
    else
      assert v_result ->> 'code' = 'INSUFFICIENT_BALANCE', 'O terceiro contrato deve exceder o saldo da ata';
    end if;
  end loop;
  assert (select count(*) = 2 and sum(value) = 0.02 from public.contracts where ata_id = v_ata),
    'Contratos devem preservar vínculo e valor';
  assert (select count(*) = 2 and sum(quantity) = 0.750 from public.contract_ata_items where ata_item_id = v_ata_item),
    'save_contract deve persistir os vínculos e quantidades contratadas';
  assert (select count(*) = 2 and sum(quantity) = 0.750 from public.ata_commitments where item_id = v_ata_item),
    'O consumo total e único da ata deve corresponder aos contratos';

  v_result := public.receive_purchase_request(v_first_request, v_actor, now(), 'primeira-entrega', v_line);
  assert v_result ->> 'ok' = 'true', 'A primeira solicitação deve receber e encerrar';
  assert (select status = 'atendida' from public.purchase_requests where id = v_first_request),
    'A primeira solicitação deve estar encerrada';

  v_line := jsonb_build_array(jsonb_build_object('item_id', v_second_item, 'received', 0.376));
  v_result := public.receive_purchase_request(v_second_request, v_actor, now(), 'segunda-entrega', v_line);
  assert v_result ->> 'code' = 'VALIDATION', 'O teto deve incluir o recebido na solicitação encerrada';
  assert (select received_total = 0 from public.purchase_request_items where id = v_second_item),
    'Uma tentativa acima do teto não deve alterar o recebido';

  v_line := jsonb_build_array(jsonb_build_object('item_id', v_second_item, 'received', 0.375));
  v_result := public.receive_purchase_request(v_second_request, v_actor, now(), 'segunda-entrega', v_line);
  assert v_result ->> 'ok' = 'true', 'O saldo contratual exato deve ser aceito';
  v_result := public.receive_purchase_request(v_second_request, v_actor, now(), 'segunda-entrega', v_line);
  assert v_result ->> 'ok' = 'true', 'O reenvio deve ser idempotente';
  assert (
    select count(*) = 2 and sum(quantity) = 0.750
    from public.stock_movements
    where council_id = v_council and material_id = v_material and type = 'entry'
      and reference in ('request:' || v_first_request, 'request:' || v_second_request)
  ), 'Cada recebimento deve gerar apenas uma entrada vinculada à solicitação';
  assert (select physical = 0.750 from public.stock_balances where council_id = v_council and material_id = v_material),
    'O saldo físico deve refletir apenas os recebimentos válidos';

  set local role authenticated;
  perform set_config('request.jwt.claims', jsonb_build_object('sub', v_actor)::text, true);
  assert (select count(*) = 2 from public.contract_ata_items where ata_item_id = v_ata_item),
    'O órgão do contrato deve consultar seus vínculos';
  perform set_config('request.jwt.claims', jsonb_build_object('sub', v_outsider)::text, true);
  assert (select count(*) = 0 from public.contract_ata_items where ata_item_id = v_ata_item),
    'O RLS deve ocultar vínculos de outro órgão';
  assert not has_function_privilege('public.save_contract(jsonb)', 'EXECUTE'),
    'O papel authenticated não deve executar save_contract';
  reset role;
end $$;

rollback;
