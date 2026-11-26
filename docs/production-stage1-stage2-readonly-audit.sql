-- Auditoria de leitura para o SQL Editor do Supabase de producao.
-- Nao altera dados ou estruturas. Execute com acesso autorizado e guarde os resultados.

-- 1. Historico formal: a existencia de objetos nao substitui este registro.
select version, name
from supabase_migrations.schema_migrations
where version in (
  '20261125000004', '20261126011635', '20261126011903',
  '20261126020000', '20261126020100', '20261126020200', '20261126020300'
)
order by version;

-- 2. Colunas e defaults efetivos.
select c.relname as table_name, a.attname as column_name,
       format_type(a.atttypid, a.atttypmod) as data_type,
       a.attnotnull as not_null,
       pg_get_expr(d.adbin, d.adrelid) as default_expression
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
join pg_attribute a on a.attrelid = c.oid and a.attnum > 0 and not a.attisdropped
left join pg_attrdef d on d.adrelid = c.oid and d.adnum = a.attnum
where n.nspname = 'public'
  and c.relname in ('profiles', 'administrative_processes', 'price_registration_atas',
                    'ata_items', 'purchase_requests', 'contracts', 'contract_ata_items',
                    'contract_receipt_lines', 'meeting_attendance', 'meeting_task_completions')
order by c.relname, a.attnum;

-- 3. Indices, inclusive os de contract_ata_items.
select schemaname, tablename, indexname, indexdef
from pg_indexes
where schemaname = 'public'
  and tablename in ('profiles', 'administrative_processes', 'contracts',
                    'contract_ata_items', 'contract_receipt_lines',
                    'meeting_attendance', 'meeting_task_completions')
order by tablename, indexname;

-- 4. PK, FK, unique e checks efetivos.
select c.relname as table_name, con.conname as constraint_name,
       con.contype as constraint_type, pg_get_constraintdef(con.oid) as definition
from pg_constraint con
join pg_class c on c.oid = con.conrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('profiles', 'administrative_processes', 'contracts',
                    'contract_ata_items', 'contract_receipt_lines',
                    'meeting_attendance', 'meeting_task_completions')
order by c.relname, con.conname;

-- 5. RLS habilitada e politicas efetivas.
select c.relname as table_name, c.relrowsecurity as rls_enabled,
       c.relforcerowsecurity as rls_forced
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind in ('r', 'p')
  and c.relname in ('contracts', 'contract_ata_items', 'contract_receipt_lines',
                    'meeting_attendance', 'meeting_task_completions')
order by c.relname;

select tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('contracts', 'contract_ata_items', 'contract_receipt_lines',
                    'meeting_attendance', 'meeting_task_completions')
order by tablename, policyname;

-- 6. Definicao real das RPCs e triggers de integridade.
select p.proname, pg_get_function_identity_arguments(p.oid) as arguments,
       pg_get_functiondef(p.oid) as definition
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('save_contract', 'record_meeting_evidence',
                    'receive_purchase_request_for_contract', 'receive_purchase_request')
order by p.proname, arguments;

select c.relname as table_name, t.tgname as trigger_name,
       pg_get_triggerdef(t.oid) as definition
from pg_trigger t join pg_class c on c.oid = t.tgrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and not t.tgisinternal
  and c.relname in ('administrative_processes', 'contracts',
                    'contract_receipt_lines', 'meeting_task_completions')
order by c.relname, t.tgname;

select n.nspname as schema_name, p.proname,
       pg_get_function_identity_arguments(p.oid) as arguments,
       pg_get_functiondef(p.oid) as definition
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'private'
  and p.proname in ('keep_meeting_task_completion',
                    'check_process_responsible_membership', 'check_contract_receipt_line')
order by p.proname;

-- 7. Contagens historicas sem alterar ou criar vinculos.
select 'purchase_requests' as object, count(*) as total from public.purchase_requests
union all select 'administrative_processes', count(*) from public.administrative_processes
union all select 'price_registration_atas', count(*) from public.price_registration_atas
union all select 'contracts', count(*) from public.contracts
union all select 'contract_ata_items', count(*) from public.contract_ata_items
union all select 'contract_amendments', count(*) from public.contract_amendments
union all select 'ata_extensions', count(*) from public.ata_extensions
union all select 'stock_movements', count(*) from public.stock_movements
union all select 'attachments', count(*) from public.attachments
union all select 'audit_logs', count(*) from public.audit_logs
union all select 'profiles', count(*) from public.profiles;

select 'requests_without_process' as condition, count(*) as total
from public.purchase_requests where process_id is null
union all select 'atas_without_process', count(*)
from public.price_registration_atas where process_id is null
union all select 'contracts_without_ata', count(*)
from public.contracts where ata_id is null;

-- 8. Verificar disponibilidade das novas estruturas antes de consultar dados nelas.
select to_regclass('public.meeting_attendance') as meeting_attendance,
       to_regclass('public.meeting_task_completions') as meeting_task_completions,
       to_regclass('public.contract_receipt_lines') as contract_receipt_lines,
       to_regprocedure('public.save_contract(jsonb)') as save_contract_rpc;

-- 9. Pre-requisitos das migrations e permissoes efetivas das RPCs.
select to_regclass('public.meetings') as meetings,
       to_regclass('public.meeting_action_items') as meeting_action_items,
       to_regclass('public.purchase_receipt_keys') as purchase_receipt_keys,
       to_regclass('public.purchase_request_items') as purchase_request_items,
       to_regclass('public.contract_ata_items') as contract_ata_items,
       to_regprocedure('public.create_contract_with_ata(jsonb)') as create_contract_with_ata,
       to_regprocedure('public.receive_purchase_request(uuid,uuid,timestamp with time zone,text,jsonb,boolean,text)') as receive_purchase_request;

select p.proname, pg_get_function_identity_arguments(p.oid) as arguments,
       has_function_privilege('service_role', p.oid, 'EXECUTE') as service_role_execute,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_execute,
       has_function_privilege('anon', p.oid, 'EXECUTE') as anon_execute
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('save_contract', 'create_contract_with_ata',
                    'receive_purchase_request', 'receive_purchase_request_for_contract',
                    'record_meeting_evidence')
order by p.proname, arguments;

-- Backup e teste de restauracao requerem evidencia do painel/procedimento operacional.
-- O catalogo PostgreSQL nao comprova que um backup e recuperavel.
