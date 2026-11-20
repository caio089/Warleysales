alter table public.administrative_processes add column if not exists document_exceptions jsonb not null default '{}';
update public.document_types set name='Parecer Jurídico / Técnico' where code='PJ';
update public.document_types set name='Edital de Licitação / Aviso' where code='ED';

create or replace function public.set_document_exception(p_process uuid, p_type text, p_actor uuid, p_reason text, p_remove boolean default false)
returns void language plpgsql security definer set search_path = '' as $$
declare v public.administrative_processes; resolved integer; exceptions jsonb;
begin
  select * into strict v from public.administrative_processes where id = p_process for update;
  if not exists(select 1 from public.profiles where id=p_actor and active and
    (is_central_admin or exists(select 1 from public.council_memberships where user_id=p_actor and council_id=v.council_id and role in ('council_manager','council_operator'))))
    then raise exception 'Sem permissão para alterar o processo.'; end if;
  if p_type not in ('DFD','ETP','MR','TR','PP','PJ','ED') or length(trim(p_reason)) not between 10 and 1000 then
    raise exception 'Etapa ou justificativa inválida.'; end if;
  if v.documental_snapshot is not null or v.status in ('cancelado','arquivado') then raise exception 'Este processo está encerrado para alterações documentais.'; end if;
  exceptions := case when p_remove then v.document_exceptions - p_type else
    v.document_exceptions || jsonb_build_object(p_type,jsonb_build_object('justification',trim(p_reason),'actorId',p_actor,'at',now())) end;
  select count(*) into resolved from (
    select type_code from public.attachments where process_id=p_process and upload_status='confirmed' and link_status='active' and retention_state<>'disposed'
    union select jsonb_object_keys(exceptions)
  ) types where type_code in ('DFD','ETP','MR','TR','PP','PJ','ED');
  update public.administrative_processes set document_exceptions=exceptions,
    documental_completed_at=case when resolved=7 then coalesce(documental_completed_at,now()) else null end where id=p_process;
  insert into public.audit_logs(actor_id,action,entity,entity_id,council_id,details)
    values(p_actor,'process.document_exception','administrative_process',p_process::text,v.council_id,
      jsonb_build_object('type',p_type,'reason',p_reason,'removed',p_remove,'before',v.document_exceptions,'after',exceptions));
end $$;
revoke all on function public.set_document_exception(uuid,text,uuid,text,boolean) from public,anon,authenticated;
grant execute on function public.set_document_exception(uuid,text,uuid,text,boolean) to service_role;

create or replace function public.correct_purchase_request(p_request uuid,p_actor uuid,p_expected text,p_data jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare
  r public.purchase_requests; target uuid; item jsonb; material uuid; next_status text;
  reason text; priority text; amount numeric; structural boolean; old_items jsonb; new_items jsonb := '[]';
  balance record; delta numeric; locked boolean; position integer; previous jsonb;
begin
  select * into strict r from public.purchase_requests where id=p_request for update;
  if p_expected <> (select md5(to_jsonb(q)::text) from (
    select r.*, (select jsonb_agg(to_jsonb(i) order by i.seq) from public.purchase_request_items i where request_id=r.id) items,
    (select count(*) from public.purchase_request_events where request_id=r.id) events_count
  ) q) then raise exception 'A solicitação mudou. Atualize a página antes de corrigir.'; end if;
  target := (p_data->>'councilId')::uuid;
  if not exists(select 1 from public.profiles where id=p_actor and active and
    (is_central_admin or (exists(select 1 from public.council_memberships where user_id=p_actor and council_id=r.council_id and role in ('council_manager','council_operator'))
    and exists(select 1 from public.council_memberships where user_id=p_actor and council_id=target and role in ('council_manager','council_operator')))))
    then raise exception 'Sem permissão para corrigir esta solicitação ou transferir para este órgão.'; end if;
  if not exists(select 1 from public.councils where id=target and active) then raise exception 'Órgão inativo.'; end if;
  if r.status in ('cancelada','atendida','rejeitada') then raise exception 'Esta solicitação está encerrada.'; end if;
  reason := trim(p_data->>'justification'); priority := p_data->>'priority';
  amount := nullif(p_data->>'estimatedValue','')::numeric;
  if length(reason) not between 10 and 1000 or priority not in ('Alta','Média','Baixa') or
     length(trim(p_data->>'title')) not between 3 and 200 or amount < 0 or jsonb_array_length(p_data->'items') < 1 then
    raise exception 'Confira os campos e informe uma justificativa de pelo menos 10 caracteres.'; end if;
  select coalesce(jsonb_agg(to_jsonb(i) order by i.seq),'[]') into old_items from public.purchase_request_items i where request_id=r.id;
  previous := jsonb_build_object('request',to_jsonb(r),'items',old_items);
  for item in select value from jsonb_array_elements(p_data->'items') loop
    if (item->>'quantity')::numeric <= 0 or length(trim(item->>'description')) not between 2 and 160 or length(trim(item->>'unit')) not between 1 and 20 then raise exception 'Material, unidade ou quantidade inválida.'; end if;
    select m.id into material from public.materials m
      join public.purchase_request_items i on i.material_id=m.id and i.request_id=r.id
      where m.id=nullif(item->>'materialId','')::uuid and m.name=trim(item->>'description') and m.unit=trim(item->>'unit') limit 1;
    if material is null then
      select id into material from public.materials where name=trim(item->>'description') and unit=trim(item->>'unit') and active order by id limit 1;
    end if;
    if material is null then
      material := gen_random_uuid();
      insert into public.materials(id,code,name,unit) values(material,'COR-'||material::text,trim(item->>'description'),trim(item->>'unit'));
    end if;
    new_items := new_items || jsonb_build_array(jsonb_build_object('material_id',material,'quantity',(item->>'quantity')::numeric));
  end loop;
  structural := target<>r.council_id or
    (select jsonb_agg(jsonb_build_object('material_id',i->>'material_id','quantity',(i->>'quantity')::numeric) order by ord)
      from jsonb_array_elements(old_items) with ordinality t(i,ord)) is distinct from new_items;
  locked := exists(select 1 from public.process_formalizations where process_id=r.process_id)
    or exists(select 1 from public.purchase_request_items where request_id=r.id and (received_total>0 or ata_item_id is not null));
  if structural and locked then raise exception 'Materiais, quantidades e órgão só podem ser corrigidos antes da formalização, do recebimento e do compromisso de ata.'; end if;
  if target<>r.council_id and (
    exists(select 1 from public.price_registration_atas where process_id=r.process_id) or
    exists(select 1 from public.contracts where process_id=r.process_id)
  ) then raise exception 'O processo possui instrumentos vinculados. Revise esses vínculos antes de trocar o órgão.'; end if;
  if structural then
    for balance in
      select owner,mat,sum(qty) qty from (
        select r.council_id owner,(i->>'material_id')::uuid mat,-(i->>'quantity')::numeric qty from jsonb_array_elements(old_items) i
        union all select target,(i->>'material_id')::uuid,(i->>'quantity')::numeric from jsonb_array_elements(new_items) i
      ) changes group by owner,mat order by owner,mat
    loop
      insert into public.stock_balances(council_id,material_id) values(balance.owner,balance.mat) on conflict do nothing;
      perform 1 from public.stock_balances where council_id=balance.owner and material_id=balance.mat for update;
      update public.stock_balances set blocked=blocked+balance.qty,version=version+1
        where council_id=balance.owner and material_id=balance.mat and blocked+balance.qty>=0;
      if not found then raise exception 'Saldo bloqueado incompatível. A correção foi cancelada.'; end if;
    end loop;
    delete from public.purchase_request_items where request_id=r.id;
    for item in select value from jsonb_array_elements(new_items) loop
      insert into public.purchase_request_items(request_id,material_id,quantity) values(r.id,(item->>'material_id')::uuid,(item->>'quantity')::numeric);
    end loop;
  end if;
  next_status := case when structural and r.status<>'rascunho' then 'em_analise' else r.status end;
  update public.purchase_requests set title=trim(p_data->>'title'),council_id=target,estimated_value=amount,status=next_status where id=r.id;
  update public.administrative_processes set title=trim(p_data->>'title'),council_id=target where id=r.process_id;
  if target<>r.council_id then update public.attachments set council_id=target where process_id=r.process_id; end if;
  update public.process_formalizations set estimated_value=coalesce(amount,0),
    savings_value=coalesce(amount,0)-contracted_value,
    savings_percent=case when amount>0 then round((amount-contracted_value)/amount*100,2) else 0 end
    where process_id=r.process_id;
  select coalesce(max(e.position),-1)+1 into position from public.purchase_request_events e where request_id=r.id;
  insert into public.purchase_request_events(request_id,position,from_status,to_status,actor_id,at,note)
    values(r.id,position,r.status,next_status,p_actor,now(),'Correção: '||reason||' | Prioridade '||priority||
      ' | Valor estimado: '||coalesce(r.estimated_value::text,'não informado')||' → '||coalesce(amount::text,'não informado')||
      ' | Objeto: '||r.title||' → '||trim(p_data->>'title')||
      case when structural then ' | Órgão, materiais ou quantidades alterados. Retornou para análise.' else '' end);
  insert into public.audit_logs(actor_id,action,entity,entity_id,council_id,details)
    values(p_actor,'request.correct','purchase_request',r.id::text,target,
      jsonb_build_object('before',previous,'after',p_data,'structural',structural,'status',next_status));
end $$;
revoke all on function public.correct_purchase_request(uuid,uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.correct_purchase_request(uuid,uuid,text,jsonb) to service_role;

create or replace function public.purchase_request_revision(p_request uuid)
returns text language sql security definer set search_path = '' as $$
  select md5(to_jsonb(q)::text) from (
    select r.*, (select jsonb_agg(to_jsonb(i) order by i.seq) from public.purchase_request_items i where request_id=r.id) items,
    (select count(*) from public.purchase_request_events where request_id=r.id) events_count
    from public.purchase_requests r where id=p_request
  ) q
$$;
revoke all on function public.purchase_request_revision(uuid) from public,anon,authenticated;
grant execute on function public.purchase_request_revision(uuid) to service_role;

create or replace view public.v_process_progress with (security_invoker = true) as
  select p.id as process_id,
    (select count(*) from (
      select type_code from public.attachments where process_id=p.id and link_status='active'
        and upload_status='confirmed' and retention_state<>'disposed'
      union select jsonb_object_keys(p.document_exceptions)
    ) resolved where type_code in ('DFD','ETP','MR','TR','PP','PJ','ED')) as valid_types,
    round((select count(*) from (
      select type_code from public.attachments where process_id=p.id and link_status='active'
        and upload_status='confirmed' and retention_state<>'disposed'
      union select jsonb_object_keys(p.document_exceptions)
    ) resolved where type_code in ('DFD','ETP','MR','TR','PP','PJ','ED'))*100.0/7,2) as percent
  from public.administrative_processes p;
