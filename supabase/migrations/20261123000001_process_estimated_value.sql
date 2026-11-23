alter table public.administrative_processes
  add column if not exists estimated_value numeric(15,2) check (estimated_value >= 0);

create or replace function public.set_process_estimated_value(p_process uuid, p_actor uuid, p_value numeric)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  process_row public.administrative_processes;
  request_row public.purchase_requests;
  previous_value numeric;
begin
  if p_value is null or p_value < 0 or p_value > 9999999999999.99 or p_value <> round(p_value, 2) then
    raise exception 'Informe um valor estimado válido.';
  end if;

  -- Same lock order as request corrections.
  select * into request_row from public.purchase_requests
    where process_id = p_process order by created_at desc, id desc limit 1 for update;
  select * into strict process_row from public.administrative_processes
    where id = p_process for update;

  if not exists (
    select 1 from public.profiles where id = p_actor and active and (
      is_central_admin or exists (
        select 1 from public.council_memberships where user_id = p_actor
          and council_id = process_row.council_id and role in ('council_manager', 'council_operator')
      )
    )
  ) or (request_row.id is not null and request_row.council_id <> process_row.council_id) then
    raise exception 'Sem permissão para alterar o valor estimado deste processo.';
  end if;

  if process_row.documental_snapshot is not null or process_row.status in ('cancelado', 'arquivado') then
    raise exception 'Este processo está encerrado para alterações.';
  end if;

  if request_row.id is not null then
    previous_value := request_row.estimated_value;
    update public.purchase_requests set estimated_value = p_value where id = request_row.id;
  else
    previous_value := process_row.estimated_value;
    update public.administrative_processes set estimated_value = p_value where id = p_process;
  end if;

  update public.process_formalizations
    set estimated_value = p_value,
        savings_value = p_value - contracted_value,
        savings_percent = case when p_value > 0 then round((p_value - contracted_value) / p_value * 100, 2) else 0 end
    where process_id = p_process;

  if previous_value is distinct from p_value then
    insert into public.audit_logs(actor_id, action, entity, entity_id, council_id, details)
      values (p_actor, 'process.estimated_value', 'administrative_process', p_process::text, process_row.council_id,
        jsonb_build_object('before', previous_value, 'after', p_value, 'requestId', request_row.id));
  end if;
end;
$$;

revoke all on function public.set_process_estimated_value(uuid, uuid, numeric) from public, anon, authenticated;
grant execute on function public.set_process_estimated_value(uuid, uuid, numeric) to service_role;
