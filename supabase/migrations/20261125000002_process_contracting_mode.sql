-- Define se o processo usa registro de preços (ata + contrato) ou só contrato.
alter table public.administrative_processes
  add column if not exists contracting_mode text
  check (contracting_mode is null or contracting_mode in ('registro_precos', 'contrato'));

create or replace function public.set_process_contracting_mode(p_process uuid, p_actor uuid, p_mode text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  process_row public.administrative_processes;
  previous_value text;
begin
  if p_mode is null or p_mode not in ('registro_precos', 'contrato') then
    raise exception 'Informe se é registro de preços ou somente contrato.';
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
    raise exception 'Sem permissão para alterar o modo de contratação deste processo.';
  end if;

  if process_row.documental_snapshot is not null or process_row.status in ('cancelado', 'arquivado') then
    raise exception 'Este processo está encerrado para alterações.';
  end if;

  previous_value := process_row.contracting_mode;
  update public.administrative_processes
    set contracting_mode = p_mode
    where id = p_process;

  if previous_value is distinct from p_mode then
    insert into public.audit_logs(actor_id, action, entity, entity_id, council_id, details)
      values (
        p_actor,
        'process.contracting_mode',
        'administrative_process',
        p_process::text,
        process_row.council_id,
        jsonb_build_object('before', previous_value, 'after', p_mode)
      );
  end if;
end;
$$;

revoke all on function public.set_process_contracting_mode(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.set_process_contracting_mode(uuid, uuid, text) to service_role;
