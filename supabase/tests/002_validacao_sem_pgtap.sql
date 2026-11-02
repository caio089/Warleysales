-- Validação de integridade/RLS SEM pgTAP: roda em Postgres comum (psql) ou via execute_sql.
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

-- ───────── Fixtures (como superusuário) ─────────
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000a1', 'gestor.a@teste.local'),
  ('00000000-0000-0000-0000-0000000000b1', 'gestor.b@teste.local'),
  ('00000000-0000-0000-0000-0000000000c1', 'leitor.a@teste.local'),
  ('00000000-0000-0000-0000-0000000000d1', 'admin@teste.local');
update public.profiles set is_central_admin = true where id = '00000000-0000-0000-0000-0000000000d1';
insert into public.councils (id, name, acronym) values
  ('10000000-0000-0000-0000-00000000000a', 'Conselho A', 'CA'),
  ('10000000-0000-0000-0000-00000000000b', 'Conselho B', 'CB');
insert into public.council_memberships (user_id, council_id, role) values
  ('00000000-0000-0000-0000-0000000000a1', '10000000-0000-0000-0000-00000000000a', 'council_manager'),
  ('00000000-0000-0000-0000-0000000000b1', '10000000-0000-0000-0000-00000000000b', 'council_manager'),
  ('00000000-0000-0000-0000-0000000000c1', '10000000-0000-0000-0000-00000000000a', 'viewer');
insert into public.materials (id, code, name, unit) values ('20000000-0000-0000-0000-000000000001', 'M1', 'Papel', 'resma');
insert into public.administrative_processes (id, council_id, sequence, year, number, title, created_by) values
  ('30000000-0000-0000-0000-00000000000a', '10000000-0000-0000-0000-00000000000a', 1, 2026, '001/2026', 'Processo A', '00000000-0000-0000-0000-0000000000a1'),
  ('30000000-0000-0000-0000-00000000000b', '10000000-0000-0000-0000-00000000000b', 1, 2026, '001/2026', 'Processo B', '00000000-0000-0000-0000-0000000000b1');
insert into public.stock_transfers (id, origin_council_id, destination_council_id, status) values
  ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-00000000000a', '10000000-0000-0000-0000-00000000000b', 'solicitada');

-- ───────── Seed / unicidade ─────────
select pg_temp.check_that((select count(*) from public.document_types) = 7, 'seed possui os 7 tipos documentais');
select pg_temp.check_that((select count(*) from storage.buckets where id = 'process-documents' and public = false) = 1, 'bucket process-documents existe e é privado');
select pg_temp.check_that((select count(*) from public.profiles) = 4, 'trigger on_auth_user_created criou 4 perfis');
select pg_temp.check_that(not exists (select 1 from public.profiles where id <> '00000000-0000-0000-0000-0000000000d1' and (is_central_admin or is_special_deleter)), 'perfis novos nascem sem privilégios');
select pg_temp.expect_error($$insert into public.administrative_processes (council_id, sequence, year, number, title, created_by)
  values ('10000000-0000-0000-0000-00000000000a', 2, 2026, '001/2026', 'Duplicado', '00000000-0000-0000-0000-0000000000a1')$$,
  '23505', 'número de processo é único por conselho');

-- ───────── Estoque: CAS, idempotência, saldo negativo ─────────
select pg_temp.check_that(public.apply_stock_mutation('10000000-0000-0000-0000-00000000000a', '20000000-0000-0000-0000-000000000001', 0, 10, 0,
  '{"type":"entry","quantity":10,"idempotency_key":"k1"}'::jsonb) = 'ok', 'entrada aplicada');
select pg_temp.check_that(public.apply_stock_mutation('10000000-0000-0000-0000-00000000000a', '20000000-0000-0000-0000-000000000001', 0, 20, 0,
  '{"type":"entry","quantity":10,"idempotency_key":"k2"}'::jsonb) = 'conflict', 'versão desatualizada é rejeitada (CAS)');
select pg_temp.check_that(public.apply_stock_mutation('10000000-0000-0000-0000-00000000000a', '20000000-0000-0000-0000-000000000001', 1, 20, 0,
  '{"type":"entry","quantity":10,"idempotency_key":"k1"}'::jsonb) = 'conflict', 'mesma chave de idempotência não é reaplicada');
select pg_temp.check_that((select physical from public.stock_balances where material_id = '20000000-0000-0000-0000-000000000001') = 10, 'saldo permanece 10 após tentativas rejeitadas');
select pg_temp.expect_error($$select public.apply_stock_mutation('10000000-0000-0000-0000-00000000000a', '20000000-0000-0000-0000-000000000001', 1, 5, 9, null)$$,
  '23514', 'reservado maior que físico viola constraint');
select pg_temp.expect_error($$select public.apply_stock_mutation('10000000-0000-0000-0000-00000000000a', '20000000-0000-0000-0000-000000000001', 1, -1, 0, null)$$,
  '23514', 'saldo físico negativo é impedido pelo banco');

-- ───────── Append-only (inclusive para quem tem privilégio total) ─────────
select pg_temp.expect_error($$update public.stock_movements set quantity = 99$$, '42501', 'ledger de estoque imutável (UPDATE)');
select pg_temp.expect_error($$delete from public.stock_movements$$, '42501', 'ledger de estoque imutável (DELETE)');
insert into public.audit_logs (actor_id, action, entity) values (null, 'teste', 'teste');
select pg_temp.expect_error($$update public.audit_logs set action = 'x'$$, '42501', 'auditoria imutável (UPDATE)');
select pg_temp.expect_error($$delete from public.audit_logs$$, '42501', 'auditoria imutável (DELETE)');
select pg_temp.expect_error($$truncate public.audit_logs$$, '42501', 'auditoria imutável (TRUNCATE)');
select pg_temp.expect_error($$truncate public.stock_movements$$, '42501', 'ledger imutável (TRUNCATE)');

-- ───────── RLS: isolamento entre conselhos ─────────
select pg_temp.act_as('00000000-0000-0000-0000-0000000000a1');
select pg_temp.check_that((select count(*) from public.administrative_processes) = 1, 'RLS: gestor A vê somente 1 processo (o seu)');
select pg_temp.check_that((select count(*) from public.administrative_processes where council_id = '10000000-0000-0000-0000-00000000000b') = 0, 'RLS: processos do conselho B ocultos para A');
select pg_temp.check_that((select count(*) from public.councils) = 1, 'RLS: A vê somente o próprio conselho');
select pg_temp.check_that((select count(*) from public.stock_balances where council_id = '10000000-0000-0000-0000-00000000000b') = 0, 'RLS: saldos de B ocultos');
select pg_temp.check_that((select count(*) from public.stock_transfers) = 1, 'RLS: transferência visível à origem (A)');
select pg_temp.check_that((select count(*) from public.profiles) = 1, 'RLS: A vê apenas o próprio perfil');
select pg_temp.check_that((select count(*) from public.council_memberships) = 1, 'RLS: A vê apenas o próprio vínculo');
select pg_temp.check_that((select count(*) from public.audit_logs) = 0, 'RLS: auditoria sem council_id não é visível a gestor');
reset role;
select pg_temp.act_as('00000000-0000-0000-0000-0000000000b1');
select pg_temp.check_that((select count(*) from public.stock_transfers) = 1, 'RLS: transferência visível ao destino (B)');
select pg_temp.check_that((select count(*) from public.administrative_processes where council_id = '10000000-0000-0000-0000-00000000000a') = 0, 'RLS: processos de A ocultos para B');
reset role;
select pg_temp.act_as('00000000-0000-0000-0000-0000000000d1');
select pg_temp.check_that((select count(*) from public.administrative_processes) = 2, 'admin central vê todos os conselhos');
reset role;

-- ───────── Usuário comum não escreve/exclui; escalada de privilégio bloqueada ─────────
select pg_temp.act_as('00000000-0000-0000-0000-0000000000a1');
select pg_temp.expect_error($$delete from public.administrative_processes$$, '42501', 'gestor (authenticated) não exclui processos');
select pg_temp.expect_error($$delete from public.attachments$$, '42501', 'usuário não exclui anexos');
select pg_temp.expect_error($$insert into public.materials (code, name, unit) values ('X', 'X', 'un')$$, '42501', 'cliente não escreve em tabelas de domínio');
select pg_temp.expect_error($$update public.profiles set is_central_admin = true$$, '42501', 'escalada: usuário não vira admin central');
select pg_temp.expect_error($$update public.profiles set is_special_deleter = true$$, '42501', 'escalada: usuário não vira special deleter');
select pg_temp.expect_error($$insert into public.council_memberships (user_id, council_id, role) values ('00000000-0000-0000-0000-0000000000a1', '10000000-0000-0000-0000-00000000000b', 'council_manager')$$, '42501', 'escalada: usuário não se vincula a outro conselho');
select pg_temp.expect_error($$update public.council_memberships set role = 'council_manager'$$, '42501', 'escalada: usuário não altera o próprio papel');
select pg_temp.expect_error($$insert into public.councils (name, acronym) values ('Novo', 'NV')$$, '42501', 'usuário não cria conselho');
select pg_temp.expect_error($$insert into public.audit_logs (action, entity) values ('forjado', 'x')$$, '42501', 'usuário não forja auditoria');
select pg_temp.expect_error($$select public.apply_stock_mutation('10000000-0000-0000-0000-00000000000a', '20000000-0000-0000-0000-000000000001', 1, 999, 0, null)$$, '42501', 'usuário não executa RPC de estoque');
select pg_temp.expect_error($$truncate public.administrative_processes cascade$$, '42501', 'usuário não executa TRUNCATE');
select pg_temp.expect_error($$select public.handle_new_user()$$, '42501', 'usuário não executa handle_new_user');
update public.profiles set full_name = 'Gestor A' where id = '00000000-0000-0000-0000-0000000000a1';
select pg_temp.check_that((select full_name from public.profiles) = 'Gestor A', 'usuário altera o próprio nome (permitido)');
reset role;
-- anon não lê nada
set local role anon;
select pg_temp.expect_error($$select count(*) from public.administrative_processes$$, '42501', 'anon não lê tabelas de domínio');
reset role;

-- ───────── Progresso documental 0 / 1 / 7 e reversão ─────────
select pg_temp.check_that((select percent from public.v_process_progress where process_id = '30000000-0000-0000-0000-00000000000a') = 0, 'processo sem anexos: 0%');
insert into public.attachments (process_id, council_id, type_code, file_name, mime, size, sha256, storage_path, uploaded_by, upload_status)
values ('30000000-0000-0000-0000-00000000000a', '10000000-0000-0000-0000-00000000000a', 'DFD', 'a.pdf', 'application/pdf', 10, repeat('a', 64), 'a/dfd1.pdf', '00000000-0000-0000-0000-0000000000a1', 'confirmed');
select pg_temp.check_that((select percent from public.v_process_progress where process_id = '30000000-0000-0000-0000-00000000000a') = 14.29, '1 de 7 tipos = 14,29%');
insert into public.attachments (process_id, council_id, type_code, file_name, mime, size, sha256, storage_path, uploaded_by, upload_status)
values ('30000000-0000-0000-0000-00000000000a', '10000000-0000-0000-0000-00000000000a', 'DFD', 'b.pdf', 'application/pdf', 10, repeat('b', 64), 'a/dfd2.pdf', '00000000-0000-0000-0000-0000000000a1', 'confirmed');
select pg_temp.check_that((select valid_types from public.v_process_progress where process_id = '30000000-0000-0000-0000-00000000000a') = 1, 'dois anexos do mesmo tipo contam uma vez');
insert into public.attachments (process_id, council_id, type_code, file_name, mime, size, sha256, storage_path, uploaded_by, upload_status)
select '30000000-0000-0000-0000-00000000000a', '10000000-0000-0000-0000-00000000000a', code, code || '.pdf', 'application/pdf', 10, repeat('c', 64), 'a/' || code || '.pdf', '00000000-0000-0000-0000-0000000000a1', 'pending'
  from public.document_types where code <> 'DFD';
select pg_temp.check_that((select valid_types from public.v_process_progress where process_id = '30000000-0000-0000-0000-00000000000a') = 1, 'anexos pendentes (não confirmados) não contam');
update public.attachments set upload_status = 'confirmed' where upload_status = 'pending';
select pg_temp.check_that((select percent from public.v_process_progress where process_id = '30000000-0000-0000-0000-00000000000a') = 100, '7 de 7 tipos = 100%');
update public.attachments set link_status = 'archived' where type_code = 'ED';
select pg_temp.check_that((select percent from public.v_process_progress where process_id = '30000000-0000-0000-0000-00000000000a') = 85.71, 'desvincular um tipo reverte para 85,71%');
update public.attachments set link_status = 'active' where type_code = 'ED';
select pg_temp.check_that((select percent from public.v_process_progress where process_id = '30000000-0000-0000-0000-00000000000a') = 100, 'revincular volta a 100%');
select pg_temp.check_that((select percent from public.v_process_progress where process_id = '30000000-0000-0000-0000-00000000000b') = 0, 'progresso é por processo (B continua 0%)');

-- ───────── Atas: ledger, saldo e idempotência/concorrência ─────────
insert into public.price_registration_atas (id, council_id, number, start_date, status)
values ('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-00000000000a', 'ATA-1', current_date, 'vigente');
insert into public.ata_items (id, ata_id, description, registered_quantity, unit_price)
values ('51000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'Item', 10, 5);
select pg_temp.check_that(public.append_commitment_event('51000000-0000-0000-0000-000000000001', 0,
  '{"event_type":"commit","quantity":6,"council_id":"10000000-0000-0000-0000-00000000000a"}') = 'ok', 'comprometimento de 6/10 aceito');
select pg_temp.check_that(public.append_commitment_event('51000000-0000-0000-0000-000000000001', 0,
  '{"event_type":"commit","quantity":2,"council_id":"10000000-0000-0000-0000-00000000000a"}') = 'conflict', 'ledger desatualizado é rejeitado');
select pg_temp.expect_error($$select public.append_commitment_event('51000000-0000-0000-0000-000000000001', 1,
  '{"event_type":"commit","quantity":5,"council_id":"10000000-0000-0000-0000-00000000000a"}')$$, '23514', 'comprometer acima do registrado é impedido pelo banco');
select pg_temp.expect_error($$select public.append_commitment_event('51000000-0000-0000-0000-000000000001', 1,
  '{"event_type":"release","quantity":1,"council_id":"10000000-0000-0000-0000-00000000000a"}')$$, '23514', 'devolução sem base legal é rejeitada');
select pg_temp.expect_error($$select public.append_commitment_event('51000000-0000-0000-0000-000000000001', 1,
  '{"event_type":"release","quantity":7,"council_id":"10000000-0000-0000-0000-00000000000a","legal_basis":"x"}')$$, '23514', 'devolver mais que o comprometido é impedido');
select pg_temp.expect_error($$update public.ata_commitments set quantity = 1$$, '42501', 'ledger da ata imutável');

-- ───────── Idempotência estrutural ─────────
insert into public.scheduled_job_runs (job_name, window_key, started_at) values ('alertas', '2026-11-02', now());
select pg_temp.expect_error($$insert into public.scheduled_job_runs (job_name, window_key, started_at) values ('alertas', '2026-11-02', now())$$, '23505', 'job executa uma vez por janela');
insert into public.notifications (recipient_id, dedup_key, entity_type, entity_id, milestone, title, body)
values ('00000000-0000-0000-0000-0000000000a1', 'ata:1:a1:30', 'ata', gen_random_uuid(), 30, 't', 'b');
select pg_temp.expect_error($$insert into public.notifications (recipient_id, dedup_key, entity_type, entity_id, milestone, title, body)
  values ('00000000-0000-0000-0000-0000000000a1', 'ata:1:a1:30', 'ata', gen_random_uuid(), 30, 't', 'b')$$, '23505', 'notificação não duplica (dedup_key)');

-- ───────── Resultado ─────────
select n, ok, descricao, detalhe from t_results order by n;
select count(*) filter (where not ok) as falhas, count(*) as total from t_results;
rollback;
