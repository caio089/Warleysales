-- Testes pgTAP (rodar com `supabase test db`; exigem Supabase local/Docker — NÃO executados no ambiente de desenvolvimento atual).
begin;
select plan(14);

-- Fixtures mínimas
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000a1', 'gestor.a@teste.local'),
  ('00000000-0000-0000-0000-0000000000b1', 'gestor.b@teste.local');
insert into public.councils (id, name, acronym) values
  ('10000000-0000-0000-0000-00000000000a', 'Conselho A', 'CA'),
  ('10000000-0000-0000-0000-00000000000b', 'Conselho B', 'CB');
insert into public.council_memberships (user_id, council_id, role) values
  ('00000000-0000-0000-0000-0000000000a1', '10000000-0000-0000-0000-00000000000a', 'council_manager'),
  ('00000000-0000-0000-0000-0000000000b1', '10000000-0000-0000-0000-00000000000b', 'council_manager');
insert into public.materials (id, code, name, unit) values ('20000000-0000-0000-0000-000000000001', 'M1', 'Papel', 'resma');
insert into public.administrative_processes (id, council_id, sequence, year, number, title, created_by) values
  ('30000000-0000-0000-0000-00000000000a', '10000000-0000-0000-0000-00000000000a', 1, 2026, '001/2026', 'Processo A', '00000000-0000-0000-0000-0000000000a1'),
  ('30000000-0000-0000-0000-00000000000b', '10000000-0000-0000-0000-00000000000b', 1, 2026, '001/2026', 'Processo B', '00000000-0000-0000-0000-0000000000b1');

-- 1-2: seed dos 7 tipos e número único por conselho
select is((select count(*)::int from public.document_types), 7, 'seed possui os 7 tipos documentais');
select throws_ok($$insert into public.administrative_processes (council_id, sequence, year, number, title, created_by)
  values ('10000000-0000-0000-0000-00000000000a', 2, 2026, '001/2026', 'Duplicado', '00000000-0000-0000-0000-0000000000a1')$$,
  '23505', null, 'número de processo é único por conselho');

-- 3-5: estoque (saldo não negativo, reservado <= físico, idempotência)
select is(public.apply_stock_mutation('10000000-0000-0000-0000-00000000000a', '20000000-0000-0000-0000-000000000001', 0, 10, 0,
  '{"type":"entry","quantity":10,"idempotency_key":"k-entrada-1"}'::jsonb), 'ok', 'entrada aplicada');
select is(public.apply_stock_mutation('10000000-0000-0000-0000-00000000000a', '20000000-0000-0000-0000-000000000001', 0, 20, 0,
  '{"type":"entry","quantity":10,"idempotency_key":"k-entrada-2"}'::jsonb), 'conflict', 'versão desatualizada é rejeitada');
select throws_ok($$select public.apply_stock_mutation('10000000-0000-0000-0000-00000000000a', '20000000-0000-0000-0000-000000000001', 1, 5, 9, null)$$,
  '23514', null, 'reservado maior que físico viola a constraint');

-- 6: reenvio com a mesma chave não duplica
select is(public.apply_stock_mutation('10000000-0000-0000-0000-00000000000a', '20000000-0000-0000-0000-000000000001', 1, 20, 0,
  '{"type":"entry","quantity":10,"idempotency_key":"k-entrada-1"}'::jsonb), 'conflict', 'mesma chave de idempotência não é reaplicada');

-- 7-8: ledger imutável
select throws_ok($$update public.stock_movements set quantity = 99$$, '42501', null, 'ledger de estoque é imutável (UPDATE)');
select throws_ok($$delete from public.audit_logs$$, '42501', null, 'auditoria é imutável (DELETE)');

-- 9-10: RLS — gestor do conselho A não enxerga processos do conselho B
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}', true);
select is((select count(*)::int from public.administrative_processes), 1, 'RLS: usuário A vê somente processos do próprio conselho');
select is((select count(*)::int from public.administrative_processes where council_id = '10000000-0000-0000-0000-00000000000b'), 0, 'RLS: processos do conselho B ficam ocultos');

-- 11-12: escrita direta negada ao cliente
select throws_ok($$insert into public.materials (code, name, unit) values ('X', 'X', 'un')$$, '42501', null, 'cliente não escreve em tabelas de domínio');
select throws_ok($$update public.profiles set is_central_admin = true$$, '42501', null, 'cliente não altera flags de privilégio');
reset role;

-- 13-14: progresso documental
select is((select percent from public.v_process_progress where process_id = '30000000-0000-0000-0000-00000000000a'), 0.00, 'processo sem anexos tem 0%');
insert into public.attachments (process_id, council_id, type_code, file_name, mime, size, sha256, storage_path, uploaded_by, upload_status)
values ('30000000-0000-0000-0000-00000000000a', '10000000-0000-0000-0000-00000000000a', 'DFD', 'a.pdf', 'application/pdf', 10, repeat('a', 64), 'a/a.pdf',
        '00000000-0000-0000-0000-0000000000a1', 'confirmed');
select is((select percent from public.v_process_progress where process_id = '30000000-0000-0000-0000-00000000000a'), 14.29, '1 de 7 tipos = 14,29%');

select * from finish();
rollback;
