-- Vigência informada no TR e reutilizada na ata e no contrato.
alter table public.administrative_processes
  add column if not exists validity_start_date date;

create or replace function public.set_process_validity_start_date(p_process uuid, p_actor uuid, p_start date)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  process_row public.administrative_processes;
  previous_value date;
begin
  if p_start is null then
    raise exception 'Informe a data de início da vigência.';
  end if;

  select * into strict process_row from public.administrative_processes
    where id = p_process for update;

  if not exists (
    select 1 from public.profiles where id = p_actor and active and (
      is_central_admin or exists (
        select 1 from public.council_memberships where user_id = p_actor
          and council_id = process_row.council_id and role in ('council_manager', 'council_operator')
      )
    )
  ) then
    raise exception 'Sem permissão para alterar a vigência deste processo.';
  end if;

  if process_row.documental_snapshot is not null or process_row.status in ('cancelado', 'arquivado') then
    raise exception 'Este processo está encerrado para alterações.';
  end if;

  previous_value := process_row.validity_start_date;
  update public.administrative_processes
    set validity_start_date = p_start
    where id = p_process;

  if previous_value is distinct from p_start then
    insert into public.audit_logs(actor_id, action, entity, entity_id, council_id, details)
      values (
        p_actor,
        'process.validity_start',
        'administrative_process',
        p_process::text,
        process_row.council_id,
        jsonb_build_object('before', previous_value, 'after', p_start)
      );
  end if;
end;
$$;

revoke all on function public.set_process_validity_start_date(uuid, uuid, date) from public, anon, authenticated;
grant execute on function public.set_process_validity_start_date(uuid, uuid, date) to service_role;
