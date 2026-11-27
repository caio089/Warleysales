-- Supabase SQL Editor. Execute um bloco numerado por vez. Todas as instruções são SELECT.

-- 01 Histórico formal das migrations
select version, name from supabase_migrations.schema_migrations
where version >= '20261125000002'
order by version;

-- 02 Tabelas e colunas existentes
select relname as tabela, relrowsecurity as rls, relforcerowsecurity as rls_forcada
from pg_class where relnamespace = 'public'::regnamespace
and relname in ('profiles','administrative_processes','purchase_requests','purchase_receipt_keys',
  'contracts','contract_ata_items','contract_receipt_lines','price_registration_atas','stock_transfers',
  'stock_transfer_items','stock_transfer_events','stock_movements','calendar_appointments',
  'meetings','meeting_attendance','meeting_task_completions','meeting_action_items','attachments','audit_logs')
order by relname;

select table_name, column_name, data_type, is_nullable, column_default
from information_schema.columns where table_schema = 'public'
and table_name in ('profiles','administrative_processes','contracts','contract_ata_items','contract_receipt_lines',
  'calendar_appointments','meetings','meeting_attendance','meeting_task_completions','meeting_action_items')
order by table_name, ordinal_position;

-- 03 Funções RPC, definições e grants
select p.oid::regprocedure as assinatura, pg_get_functiondef(p.oid) as definicao,
  has_function_privilege('anon',p.oid,'EXECUTE') as anon_execute,
  has_function_privilege('authenticated',p.oid,'EXECUTE') as authenticated_execute,
  has_function_privilege('service_role',p.oid,'EXECUTE') as service_role_execute
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname in ('public','private') and p.prokind='f' and p.proname in
  ('save_contract','create_contract_with_ata','receive_purchase_request','receive_purchase_request_for_contract',
   'save_transfer','advance_transfer','save_meeting','record_meeting_evidence','claim_meeting_ai',
   'keep_approved_meeting_minutes','keep_meeting_task_completion','validate_meeting_details',
   'check_contract_ata_process','check_contract_receipt_line','check_process_responsible_membership',
   'approve_purchase_request','cancel_purchase_request','set_process_contracting_mode','set_process_price_research')
order by p.proname, p.oid;

-- 04 Triggers
select c.relname as tabela,t.tgname,t.tgenabled,pg_get_triggerdef(t.oid) as definicao
from pg_trigger t join pg_class c on c.oid=t.tgrelid
where c.relnamespace='public'::regnamespace and not t.tgisinternal
and c.relname in ('administrative_processes','contracts','contract_receipt_lines','meetings','meeting_action_items')
order by c.relname,t.tgname;

-- 05 Constraints e chaves estrangeiras
select c.relname as tabela, con.conname, con.convalidated, pg_get_constraintdef(con.oid) as definicao
from pg_constraint con join pg_class c on c.oid = con.conrelid
where c.relnamespace = 'public'::regnamespace
and c.relname in ('contracts','contract_ata_items','contract_receipt_lines','purchase_receipt_keys',
  'profiles','administrative_processes','calendar_appointments','meetings','meeting_action_items',
  'meeting_attendance','meeting_task_completions')
order by c.relname, con.conname;

-- 06 Índices
select tablename,indexname,indexdef from pg_indexes where schemaname='public'
and tablename in ('contracts','contract_ata_items','contract_receipt_lines','profiles',
  'administrative_processes','calendar_appointments','meetings','meeting_action_items')
order by tablename,indexname;

-- 07 Políticas RLS
select schemaname,tablename,policyname,roles,cmd,qual,with_check from pg_policies
where (schemaname='storage' and tablename='objects') or (schemaname='public' and tablename in
  ('contracts','contract_ata_items','contract_receipt_lines','stock_transfers','calendar_appointments',
   'meetings','meeting_action_items','meeting_attendance','meeting_task_completions','attachments'))
order by schemaname,tablename,policyname;

-- 08 Registros históricos e compatibilidade
-- Execute as instruções deste bloco separadamente se algum objeto estiver indisponível.
select count(*) as solicitacoes_sem_processo from public.purchase_requests where process_id is null;
select count(*) as atas_sem_processo from public.price_registration_atas where process_id is null;
select count(*) as contratos from public.contracts;
select count(*) as movimentos from public.stock_movements;
select count(*) as registros_de_auditoria from public.audit_logs;
select count(*) as anexos from public.attachments;

select id,public,file_size_limit from storage.buckets where id in ('process-documents','meeting-audio');
select bucket_id,count(*) as objetos from storage.objects
where bucket_id in ('process-documents','meeting-audio') group by bucket_id order by bucket_id;

-- 09 Transferências bloqueantes
-- Uma linha por estado, inclusive quando a contagem for zero.
select bloqueio.status, count(t.status) as total
from (values ('aprovada'), ('separada'), ('em_transito')) as bloqueio(status)
left join public.stock_transfers t on t.status::text = bloqueio.status
group by bloqueio.status
order by bloqueio.status;

-- Grants efetivos de escrita nas tabelas históricas.
select r.rolname, c.relname,
  has_table_privilege(r.oid,c.oid,'INSERT') as pode_inserir,
  has_table_privilege(r.oid,c.oid,'UPDATE') as pode_atualizar,
  has_table_privilege(r.oid,c.oid,'DELETE') as pode_excluir,
  has_table_privilege(r.oid,c.oid,'TRUNCATE') as pode_truncar
from pg_roles r cross join pg_class c
where r.rolname in ('anon','authenticated','service_role')
and c.relnamespace = 'public'::regnamespace
and c.relname in ('stock_transfers','stock_transfer_items','stock_transfer_events')
order by r.rolname,c.relname;

-- 10 Dependências das migrations
-- Presença de objetos de que outras versões dependem. Presença não atesta definição ou histórico.
select objeto, to_regclass(objeto) is not null as existe
from (values ('public.administrative_processes'), ('public.profiles'), ('public.council_memberships'),
  ('public.councils'), ('public.contracts'), ('public.price_registration_atas'), ('public.ata_items'), ('public.ata_commitments'),
  ('public.contract_ata_items'), ('public.purchase_requests'), ('public.purchase_receipt_keys'),
  ('public.contract_receipt_lines'), ('public.stock_transfers'), ('public.stock_transfer_items'),
  ('public.stock_transfer_events'), ('public.stock_movements'), ('public.meetings'),
  ('public.meeting_action_items'), ('storage.buckets'), ('storage.objects')) as dependencias(objeto)
order by objeto;

select assinatura, to_regprocedure(assinatura) is not null as existe
from (values ('public.save_contract(jsonb)'), ('public.create_contract_with_ata(jsonb)'),
  ('public.receive_purchase_request(uuid,uuid,timestamptz,text,jsonb,boolean,text)'),
  ('public.save_transfer(jsonb)'), ('public.advance_transfer(uuid,text,uuid,timestamptz,text,jsonb)'),
  ('public.claim_meeting_ai()')) as dependencias(assinatura)
order by assinatura;
