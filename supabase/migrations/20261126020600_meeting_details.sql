alter table public.meetings
  add column responsible_id uuid references public.profiles(id),
  add column agenda text check (length(agenda) <= 8000),
  add column decisions text check (length(decisions) <= 12000),
  add column participant_ids uuid[] not null default '{}' check (cardinality(participant_ids) <= 100),
  add column attachment_ids uuid[] not null default '{}' check (cardinality(attachment_ids) <= 100);

-- Related people are independent of confirmed attendance. Validate only new links
-- so previously recorded links survive later changes to membership or retention.
create function private.validate_meeting_details() returns trigger
language plpgsql set search_path = '' as $$
declare
  old_people uuid[] := '{}';
  old_attachments uuid[] := '{}';
begin
  if tg_op = 'UPDATE' and new.council_id = old.council_id then
    old_people := array_append(old.participant_ids, old.responsible_id);
    old_attachments := old.attachment_ids;
  end if;
  if exists (
    select 1 from unnest(array_append(new.participant_ids, new.responsible_id)) as person(id)
    where person.id is not null and not exists (select 1 from unnest(old_people) p(id) where p.id = person.id)
      and not exists (
        select 1 from public.council_memberships m join public.profiles p on p.id = m.user_id
        where m.council_id = new.council_id and m.user_id = person.id and p.active
      )
  ) then
    raise check_violation using message = 'Pessoa sem vínculo ativo com o órgão da reunião.';
  end if;
  if exists (
    select 1 from unnest(new.attachment_ids) as linked(id)
    where not exists (select 1 from unnest(old_attachments) a(id) where a.id = linked.id)
      and not exists (
        select 1 from public.attachments a
        where a.id = linked.id and a.council_id = new.council_id
          and a.upload_status = 'confirmed' and a.retention_state <> 'disposed'
      )
  ) then
    raise check_violation using message = 'Anexo indisponível ou de outro órgão.';
  end if;
  return new;
end $$;

create trigger validate_meeting_details
before insert or update of council_id, responsible_id, participant_ids, attachment_ids on public.meetings
for each row execute function private.validate_meeting_details();
