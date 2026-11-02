-- Validação dos fluxos atômicos (RPCs 0007) SEM pgTAP: aprovação/cancelamento de solicitação e avanço de transferência.
-- Tudo acontece em UMA transação com ROLLBACK ao final; nada é persistido.
-- Saída: uma linha por verificação (ok = true/false). Qualquer `false` é falha.
-- Uso local: psql -d <db> -f supabase/tests/002_validacao_sem_pgtap.sql
begin;

create temp table t_results (n serial, ok boolean, descricao text, detalhe text);
grant all on t_results to public;
grant usage on sequence t_results_n_seq to public;

-- Registra o resultado de uma verificação booleana.
create function pg_temp.check_that(p_ok boolean, p_desc text, p_detail text default null) returns void
language sql as $$ insert into t_results (ok, descricao, detalhe) values (coalesce(p_ok, false), p_desc, p_detail) $$;

-- Executa SQL e verifica se falhou com o SQLSTATE esperado (ex.: '42501').
create function pg_temp.expect_error(p_sql text, p_sqlstate text, p_desc text) returns void
language plpgsql as $$
begin
  execute p_sql;
  insert into t_results (ok, descricao, detalhe) values (false, p_desc, 'não falhou');
exception when others then
  insert into t_results (ok, descricao, detalhe) values (sqlstate = p_sqlstate, p_desc, 'sqlstate=' || sqlstate);
end $$;

-- Atua como o usuário (papel authenticated + claims JWT) dentro da transação.
create function pg_temp.act_as(p_user uuid) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('sub', p_user, 'role', 'authenticated')::text, true);
  set local role authenticated;
end $$;

-- ───────── Fixtures ─────────
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000a1', 'gestor.a@teste.local'),
  ('00000000-0000-0000-0000-0000000000b1', 'gestor.b@teste.local');
insert into public.councils (id, name, acronym) values
  ('10000000-0000-0000-0000-00000000000a', 'Conselho A', 'CA'),
  ('10000000-0000-0000-0000-00000000000b', 'Conselho B', 'CB');
insert into public.materials (id, code, name, unit) values
  ('20000000-0000-0000-0000-000000000001', 'M1', 'Papel', 'resma'),
  ('20000000-0000-0000-0000-000000000002', 'M2', 'Caneta', 'un');
insert into public.suppliers (id, name) values ('60000000-0000-0000-0000-000000000001', 'Fornecedor');
insert into public.price_registration_atas (id, council_id, number, start_date, status)
values ('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-00000000000a', 'ATA-1', current_date, 'vigente');
insert into public.ata_items (id, ata_id, description, material_id, registered_quantity, unit_price) values
  ('51000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'Papel', '20000000-0000-0000-0000-000000000001', 10, 5),
  ('51000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', 'Caneta', '20000000-0000-0000-0000-000000000002', 3, 1);
-- B tem alocação de 4 no item 1 (item 1 registrado = 10)
insert into public.ata_allocations (item_id, council_id, quantity) values ('51000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-00000000000b', 4);

-- Solicitação R1 (conselho B): item1 qtd 4 + item2 qtd 5 (item2 só tem 3 => deve falhar sem comprometer o item1)
insert into public.purchase_requests (id, council_id, title, status, created_by) values
  ('70000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-00000000000b', 'R1 multi-item', 'em_analise', '00000000-0000-0000-0000-0000000000b1');
insert into public.purchase_request_items (request_id, material_id, quantity, ata_item_id) values
  ('70000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 4, '51000000-0000-0000-0000-000000000001'),
  ('70000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 5, '51000000-0000-0000-0000-000000000002');

-- ───────── Aprovação multi-item é tudo-ou-nada ─────────
select pg_temp.check_that((public.approve_purchase_request('70000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000000000b1', now())) ->> 'code' = 'INSUFFICIENT_BALANCE',
  'aprovação falha quando a 2ª linha excede o saldo');
select pg_temp.check_that((select count(*) from public.ata_commitments) = 0, 'nenhum comprometimento parcial após falha (1ª linha desfeita)');
select pg_temp.check_that((select status from public.purchase_requests where id = '70000000-0000-0000-0000-000000000001') = 'em_analise', 'status permanece em_analise após falha');
select pg_temp.check_that((select count(*) from public.purchase_request_events) = 0, 'nenhum evento gravado após falha');

update public.purchase_request_items set quantity = 3 where ata_item_id = '51000000-0000-0000-0000-000000000002';
select pg_temp.check_that((public.approve_purchase_request('70000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000000000b1', now(), 'ok')) ->> 'ok' = 'true', 'aprovação multi-item bem-sucedida');
select pg_temp.check_that((select count(*) from public.ata_commitments where event_type = 'commit') = 2, 'dois comprometimentos gravados');
select pg_temp.check_that((select status from public.purchase_requests where id = '70000000-0000-0000-0000-000000000001') = 'aprovada', 'status aprovada');
select pg_temp.check_that((select count(*) from public.purchase_request_events where position = 0 and to_status = 'aprovada') = 1, 'evento de aprovação registrado');
select pg_temp.check_that((public.approve_purchase_request('70000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000000000b1', now())) ->> 'code' = 'INVALID_STATE', 'reaprovar é recusado (não duplica compromisso)');
select pg_temp.check_that((select count(*) from public.ata_commitments) = 2, 'reaprovação não duplicou o ledger');

-- Alocação do conselho B (4): nova solicitação de 1 estoura a alocação (4 já comprometidos)
insert into public.purchase_requests (id, council_id, title, status, created_by) values
  ('70000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-00000000000b', 'R2', 'em_analise', '00000000-0000-0000-0000-0000000000b1');
insert into public.purchase_request_items (request_id, material_id, quantity, ata_item_id) values
  ('70000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 1, '51000000-0000-0000-0000-000000000001');
select pg_temp.check_that((public.approve_purchase_request('70000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-0000000000b1', now())) ->> 'message' like '%alocação%', 'alocação por conselho é respeitada no banco');

-- Cancelamento devolve tudo
select pg_temp.check_that((public.cancel_purchase_request('70000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000000000b1', now(), 'desistência')) ->> 'ok' = 'true', 'cancelamento de aprovada');
select pg_temp.check_that((select coalesce(sum(case event_type when 'commit' then quantity else -quantity end), 0) from public.ata_commitments) = 0, 'saldo devolvido integralmente ao cancelar');
select pg_temp.check_that((public.cancel_purchase_request('70000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000000000b1', now())) ->> 'code' = 'INVALID_STATE', 'cancelar duas vezes é recusado');

-- ───────── Transferência: fluxo completo e atomicidade ─────────
-- Origem A: M1 físico 10; M2 físico 1. Destino B vazio.
select public.apply_stock_mutation('10000000-0000-0000-0000-00000000000a', '20000000-0000-0000-0000-000000000001', 0, 10, 0, '{"type":"entry","quantity":10,"idempotency_key":"seed1"}');
select public.apply_stock_mutation('10000000-0000-0000-0000-00000000000a', '20000000-0000-0000-0000-000000000002', 0, 1, 0, '{"type":"entry","quantity":1,"idempotency_key":"seed2"}');
insert into public.stock_transfers (id, origin_council_id, destination_council_id, status) values
  ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-00000000000a', '10000000-0000-0000-0000-00000000000b', 'em_analise'),
  ('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-00000000000a', '10000000-0000-0000-0000-00000000000b', 'em_analise');
insert into public.stock_transfer_items (transfer_id, material_id, quantity) values
  ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 6),
  ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 2), -- M2 só tem 1: deve falhar sem reservar M1
  ('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 6);

select pg_temp.check_that((public.advance_transfer('40000000-0000-0000-0000-000000000001', 'aprovada', '00000000-0000-0000-0000-0000000000a1', now())) ->> 'code' = 'INSUFFICIENT_BALANCE', 'aprovar transferência sem saldo em uma linha falha');
select pg_temp.check_that((select reserved from public.stock_balances where material_id = '20000000-0000-0000-0000-000000000001') = 0, 'reserva da 1ª linha foi desfeita (sem reserva órfã)');
select pg_temp.check_that((select status from public.stock_transfers where id = '40000000-0000-0000-0000-000000000001') = 'em_analise', 'status mantido após falha');

select pg_temp.check_that((public.advance_transfer('40000000-0000-0000-0000-000000000002', 'aprovada', '00000000-0000-0000-0000-0000000000a1', now())) ->> 'ok' = 'true', 'aprovar T2 reserva 6');
select pg_temp.check_that((select reserved from public.stock_balances where council_id = '10000000-0000-0000-0000-00000000000a' and material_id = '20000000-0000-0000-0000-000000000001') = 6, 'reservado = 6');
-- T1 (também 6 de M1) não cabe mais: disponível = 10 - 6 = 4 (e M2 também falharia)
update public.stock_transfer_items set quantity = 5 where transfer_id = '40000000-0000-0000-0000-000000000001' and material_id = '20000000-0000-0000-0000-000000000001';
delete from public.stock_transfer_items where transfer_id = '40000000-0000-0000-0000-000000000001' and material_id = '20000000-0000-0000-0000-000000000002';
select pg_temp.check_that((public.advance_transfer('40000000-0000-0000-0000-000000000001', 'aprovada', '00000000-0000-0000-0000-0000000000a1', now())) ->> 'code' = 'INSUFFICIENT_BALANCE', 'reserva não excede o disponível (4 < 5)');
select pg_temp.check_that((public.advance_transfer('40000000-0000-0000-0000-000000000002', 'em_transito', '00000000-0000-0000-0000-0000000000a1', now())) ->> 'code' = 'INVALID_STATE', 'não pula etapa (aprovada → em_transito)');
select pg_temp.check_that((public.advance_transfer('40000000-0000-0000-0000-000000000002', 'separada', '00000000-0000-0000-0000-0000000000a1', now())) ->> 'ok' = 'true', 'separada');
select pg_temp.check_that((public.advance_transfer('40000000-0000-0000-0000-000000000002', 'em_transito', '00000000-0000-0000-0000-0000000000a1', now())) ->> 'ok' = 'true', 'em trânsito (baixa na origem)');
select pg_temp.check_that((select physical || '/' || reserved from public.stock_balances where council_id = '10000000-0000-0000-0000-00000000000a' and material_id = '20000000-0000-0000-0000-000000000001') = '4.000/0.000', 'origem: físico 4, reservado 0 após saída');
select pg_temp.check_that((public.advance_transfer('40000000-0000-0000-0000-000000000002', 'recebida', '00000000-0000-0000-0000-0000000000b1', now(), null,
  '[{"materialId":"20000000-0000-0000-0000-000000000001","quantity":9}]')) ->> 'code' = 'VALIDATION', 'recebido acima do enviado é recusado');
select pg_temp.check_that((select count(*) from public.stock_movements where type = 'transfer_in') = 0, 'nenhuma entrada gravada após recusa');
select pg_temp.check_that((public.advance_transfer('40000000-0000-0000-0000-000000000002', 'recebida', '00000000-0000-0000-0000-0000000000b1', now(), 'divergência', 
  '[{"materialId":"20000000-0000-0000-0000-000000000001","quantity":5}]')) ->> 'ok' = 'true', 'recebimento parcial (5 de 6) com divergência');
select pg_temp.check_that((select physical from public.stock_balances where council_id = '10000000-0000-0000-0000-00000000000b' and material_id = '20000000-0000-0000-0000-000000000001') = 5, 'destino recebeu 5');
select pg_temp.check_that((select received_quantity from public.stock_transfer_items where transfer_id = '40000000-0000-0000-0000-000000000002') = 5, 'quantidade recebida registrada no item');
select pg_temp.check_that((public.advance_transfer('40000000-0000-0000-0000-000000000002', 'recebida', '00000000-0000-0000-0000-0000000000b1', now())) ->> 'code' = 'INVALID_STATE', 'reenvio do recebimento não duplica entrada (estado final)');
select pg_temp.check_that((select count(*) from public.stock_transfer_events where transfer_id = '40000000-0000-0000-0000-000000000002') = 4, 'histórico contíguo: 4 eventos (aprovada, separada, em_transito, recebida)');
select pg_temp.check_that((select count(*) from public.v_stock_reconciliation where balance_physical <> ledger_physical) = 0, 'reconciliação: saldo físico == soma do ledger em todos os saldos');

-- Cancelamento libera a reserva (origem tem físico 4; T1 reserva 3)
update public.stock_transfer_items set quantity = 3 where transfer_id = '40000000-0000-0000-0000-000000000001';
select pg_temp.check_that((public.advance_transfer('40000000-0000-0000-0000-000000000001', 'aprovada', '00000000-0000-0000-0000-0000000000a1', now())) ->> 'ok' = 'true', 'T1 aprovada reserva 3 de 4');
select pg_temp.check_that((select reserved from public.stock_balances where council_id = '10000000-0000-0000-0000-00000000000a' and material_id = '20000000-0000-0000-0000-000000000001') = 3, 'reservado = 3');
select pg_temp.check_that((public.advance_transfer('40000000-0000-0000-0000-000000000001', 'cancelada', '00000000-0000-0000-0000-0000000000a1', now(), 'sem necessidade')) ->> 'ok' = 'true', 'cancelar T1 aprovada');
select pg_temp.check_that((select reserved from public.stock_balances where council_id = '10000000-0000-0000-0000-00000000000a' and material_id = '20000000-0000-0000-0000-000000000001') = 0, 'reserva liberada ao cancelar');
select pg_temp.check_that((public.advance_transfer('40000000-0000-0000-0000-000000000001', 'cancelada', '00000000-0000-0000-0000-0000000000a1', now())) ->> 'code' = 'INVALID_STATE', 'cancelar de novo não libera reserva duas vezes');

-- ───────── Permissões das RPCs ─────────
select pg_temp.act_as('00000000-0000-0000-0000-0000000000a1');
select pg_temp.expect_error($$select public.approve_purchase_request('70000000-0000-0000-0000-000000000001', null, now())$$, '42501', 'usuário não executa approve_purchase_request');
select pg_temp.expect_error($$select public.advance_transfer('40000000-0000-0000-0000-000000000001', 'cancelada', null, now())$$, '42501', 'usuário não executa advance_transfer');
reset role;

select n, ok, descricao, detalhe from t_results order by n;
select count(*) filter (where not ok) as falhas, count(*) as total from t_results;
rollback;
