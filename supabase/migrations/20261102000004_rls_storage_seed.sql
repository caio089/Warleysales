-- Migration 0004: RLS por conselho, Storage privado e seed dos tipos documentais.
-- Defesa em profundidade: o app acessa via service_role (serviços já autorizam), mas qualquer acesso
-- direto com a chave publicável só enxerga dados do(s) conselho(s) do usuário, em modo somente leitura.

-- Seed dos 7 tipos (nomenclatura provisória — pendência P6)
insert into public.document_types (code, name, position) values
  ('DFD', 'Documento de Formalização da Demanda', 1),
  ('ETP', 'Estudo Técnico Preliminar', 2),
  ('MR',  'Matriz de Riscos', 3),
  ('TR',  'Termo de Referência', 4),
  ('PP',  'Pesquisa de Preços', 5),
  ('PJ',  'Parecer Jurídico', 6),
  ('ED',  'Edital', 7);

-- Habilita RLS em todas as tabelas de domínio e cria política de LEITURA por conselho.
do $$
declare t record;
begin
  for t in select unnest(array[
    'administrative_processes', 'attachments', 'stock_balances', 'stock_movements',
    'price_registration_atas', 'contracts', 'purchase_requests', 'meetings']) as name loop
    execute format('alter table public.%I enable row level security', t.name);
  end loop;
end $$;

create policy processes_select on public.administrative_processes for select to authenticated using (private.has_council_access(council_id));
create policy attachments_select on public.attachments for select to authenticated using (private.has_council_access(council_id));
create policy stock_balances_select on public.stock_balances for select to authenticated using (private.has_council_access(council_id));
create policy stock_movements_select on public.stock_movements for select to authenticated using (private.has_council_access(council_id));
create policy atas_select on public.price_registration_atas for select to authenticated using (private.has_council_access(council_id));
create policy contracts_select on public.contracts for select to authenticated using (private.has_council_access(council_id));
create policy purchase_requests_select on public.purchase_requests for select to authenticated using (private.has_council_access(council_id));
create policy meetings_select on public.meetings for select to authenticated using (private.has_council_access(council_id));

-- Tabelas filhas/auxiliares: RLS ligada SEM políticas => acesso direto negado; somente service_role lê/escreve.
do $$
declare t record;
begin
  for t in select unnest(array[
    'document_types', 'retention_authorizations', 'retention_holds', 'document_cleanup_runs', 'suppliers',
    'materials', 'ata_items', 'ata_allocations', 'ata_extensions', 'ata_commitments', 'contract_amendments',
    'purchase_request_items', 'purchase_request_events', 'purchase_receipt_keys', 'stock_transfers',
    'stock_transfer_items', 'stock_transfer_events', 'meeting_action_items', 'notifications', 'scheduled_job_runs']) as name loop
    execute format('alter table public.%I enable row level security', t.name);
  end loop;
end $$;

-- Transferências visíveis para origem e destino.
create policy transfers_select on public.stock_transfers for select to authenticated
  using (private.has_council_access(origin_council_id) or private.has_council_access(destination_council_id));

-- Notificações: cada usuário lê as suas.
create policy notifications_select on public.notifications for select to authenticated using (recipient_id = (select auth.uid()));

-- Nenhuma escrita direta pelo cliente nas tabelas de domínio.
revoke insert, update, delete on all tables in schema public from anon, authenticated;
revoke all on all functions in schema public from anon;

-- Storage privado (R15): bucket NÃO público; acesso apenas por URL assinada gerada no servidor.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('process-documents', 'process-documents', false, 26214400,
        array['application/pdf', 'image/png', 'image/jpeg',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
on conflict (id) do update set public = false;
-- Sem políticas em storage.objects para anon/authenticated => somente service_role acessa.
