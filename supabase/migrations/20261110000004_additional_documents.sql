-- Migration 0004 Onda 3: Suporte a tipos documentais adicionais/complementares
-- Preservação rigorosa da régua de cálculo de progresso com base estritamente nos 7 tipos documentais obrigatórios.

-- 1. Adiciona coluna is_required em public.document_types
alter table public.document_types
  add column if not exists is_required boolean not null default true;

-- 2. Insere tipo complementar 'OUTRO' com is_required = false
insert into public.document_types (code, name, position, is_required)
values ('OUTRO', 'Artefato Adicional / Complementar', 8, false)
on conflict (code) do update set
  name = excluded.name,
  position = excluded.position,
  is_required = excluded.is_required;

-- 3. Atualiza a view v_process_progress para considerar exclusivamente tipos obrigatórios
create or replace view public.v_process_progress with (security_invoker = true) as
select p.id as process_id,
       count(distinct case when dt.is_required = true then a.type_code end) as valid_types,
       round(
         count(distinct case when dt.is_required = true then a.type_code end) * 100.0 /
         nullif((select count(*) from public.document_types where is_required = true), 0),
         2
       ) as percent
  from public.administrative_processes p
  left join public.attachments a
    on a.process_id = p.id and a.link_status = 'active'
   and a.upload_status = 'confirmed' and a.retention_state = 'retained'
  left join public.document_types dt on dt.code = a.type_code
 group by p.id;
