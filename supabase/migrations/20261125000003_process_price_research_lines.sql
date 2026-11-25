-- Linhas da pesquisa de preços (valor de referência por item) + total estimado.
alter table public.administrative_processes
  add column if not exists price_research_lines jsonb;

create or replace function public.set_process_price_research(p_process uuid, p_actor uuid, p_lines jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  process_row public.administrative_processes;
  request_row public.purchase_requests;
  previous_value numeric;
  total_value numeric := 0;
  line jsonb;
  line_total numeric;
begin
  if p_lines is null or jsonb_typeof(p_lines) <> 'array' or jsonb_array_length(p_lines) < 1 then
    raise exception 'Informe ao menos um item com valor de referência.';
  end if;

  for line in select * from jsonb_array_elements(p_lines)
  loop
    begin
      line_total := (line ->> 'lineTotal')::numeric;
    exception when others then
      raise exception 'Valor de referência inválido em um dos itens.';
    end;
    if line_total is null or line_total < 0 or line_total > 9999999999999.99 or line_total <> round(line_total, 2) then
      raise exception 'Informe valores de referência válidos, com até duas casas decimais.';
    end if;
    total_value := total_value + line_total;
  end loop;

  total_value := round(total_value, 2);

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
    raise exception 'Sem permissão para alterar a pesquisa de preços deste processo.';
  end if;

  if process_row.documental_snapshot is not null or process_row.status in ('cancelado', 'arquivado') then
    raise exception 'Este processo está encerrado para alterações.';
  end if;

  if request_row.id is not null then
    previous_value := request_row.estimated_value;
    update public.purchase_requests set estimated_value = total_value where id = request_row.id;
  else
    previous_value := process_row.estimated_value;
  end if;

  update public.administrative_processes
    set estimated_value = total_value,
        price_research_lines = p_lines
    where id = p_process;

  update public.process_formalizations
    set estimated_value = total_value,
        savings_value = total_value - contracted_value,
        savings_percent = case when total_value > 0 then round((total_value - contracted_value) / total_value * 100, 2) else 0 end
    where process_id = p_process;

  if previous_value is distinct from total_value then
    insert into public.audit_logs(actor_id, action, entity, entity_id, council_id, details)
      values (
        p_actor,
        'process.price_research',
        'administrative_process',
        p_process::text,
        process_row.council_id,
        jsonb_build_object('before', previous_value, 'after', total_value, 'lines', p_lines, 'requestId', request_row.id)
      );
  end if;
end;
$$;

revoke all on function public.set_process_price_research(uuid, uuid, jsonb) from public, anon, authenticated;
grant execute on function public.set_process_price_research(uuid, uuid, jsonb) to service_role;
