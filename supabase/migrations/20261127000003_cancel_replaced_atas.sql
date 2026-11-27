alter table public.price_registration_atas drop constraint price_registration_atas_status_check;
alter table public.price_registration_atas add constraint price_registration_atas_status_check
  check (status in ('rascunho', 'vigente', 'cancelada'));

create function public.register_process_ata(p jsonb, p_justification text)
returns void language plpgsql set search_path = '' as $$
declare
  v_process_id uuid := (p ->> 'process_id')::uuid;
  v_council_id uuid := (p ->> 'council_id')::uuid;
  v_ata_id uuid := (p ->> 'id')::uuid;
begin
  perform 1 from public.administrative_processes
    where id = v_process_id and council_id = v_council_id for update;
  if not found then
    raise foreign_key_violation using message = 'Processo incompatível com o órgão da ata.';
  end if;

  if exists (
    select 1 from public.price_registration_atas
    where process_id = v_process_id and council_id = v_council_id and status <> 'cancelada'
  ) and nullif(btrim(p_justification), '') is null then
    raise exception 'ata_replacement_justification_required';
  end if;

  perform public.save_ata(p);
  update public.price_registration_atas
    set status = 'cancelada'
    where process_id = v_process_id and council_id = v_council_id and id <> v_ata_id
      and status <> 'cancelada';
end $$;
revoke all on function public.register_process_ata(jsonb, text) from public, anon, authenticated;
grant execute on function public.register_process_ata(jsonb, text) to service_role;

-- Uma atualização concorrente baseada em dados antigos não pode reativar a ata substituída.
create function private.prevent_cancelled_ata_reactivation() returns trigger
language plpgsql set search_path = '' as $$
begin
  if old.status = 'cancelada' and new.status <> 'cancelada' then
    raise check_violation using message = 'Uma ata cancelada não pode ser reativada.';
  end if;
  return new;
end $$;
create trigger prevent_cancelled_ata_reactivation
before update of status on public.price_registration_atas
for each row execute function private.prevent_cancelled_ata_reactivation();
