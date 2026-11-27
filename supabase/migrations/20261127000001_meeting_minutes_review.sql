alter table public.meetings
  add column minutes_draft text check (length(minutes_draft) <= 20000),
  add column minutes_approved_at timestamptz,
  add column minutes_approved_by uuid references public.profiles(id),
  add check ((minutes_approved_at is null) = (minutes_approved_by is null));
alter table public.meeting_action_items add column minutes_task_key text;
create unique index meeting_minutes_task_key on public.meeting_action_items(meeting_id, minutes_task_key)
  where minutes_task_key is not null;

-- Keep the approved text immutable, including writes from the legacy manual editor.
create function private.keep_approved_meeting_minutes() returns trigger
language plpgsql set search_path = '' as $$
begin
  if old.minutes_approved_at is not null and
    row(new.minutes_text,new.minutes_registered_by,new.minutes_registered_at,new.minutes_approved_at,new.minutes_approved_by)
      is distinct from row(old.minutes_text,old.minutes_registered_by,old.minutes_registered_at,old.minutes_approved_at,old.minutes_approved_by)
  then raise check_violation using message = 'A ata aprovada está protegida.'; end if;
  return new;
end $$;
create trigger keep_approved_meeting_minutes before update on public.meetings
for each row execute function private.keep_approved_meeting_minutes();

alter table public.meetings add column ai_stage text check (ai_stage in ('transcript','draft')),
  add column ai_state text check (ai_state in ('queued','running','failed','done')),
  add column ai_lease_until timestamptz,
  add column ai_claim uuid,
  add column ai_attempts integer not null default 0;
create index meeting_ai_queue on public.meetings(ai_state,ai_lease_until) where ai_state in ('queued','running');

create function public.claim_meeting_ai() returns setof public.meetings
language sql set search_path = '' as $$
  update public.meetings set ai_state='failed', ai_claim=null, ai_lease_until=null
  where ai_state='running' and ai_lease_until < now() and ai_attempts >= 3;
  update public.meetings m set ai_state='running', ai_lease_until=now()+interval '2 minutes',
    ai_claim=gen_random_uuid(), ai_attempts=m.ai_attempts+1
  where m.id=(select id from public.meetings where
    ai_state='queued' or (ai_state='running' and ai_lease_until < now() and ai_attempts < 3)
    order by scheduled_at, id for update skip locked limit 1)
  returning m.*;
$$;
revoke all on function public.claim_meeting_ai() from public, anon, authenticated;
grant execute on function public.claim_meeting_ai() to service_role;
alter table public.meetings add column minutes_suggestions text[] not null default '{}',
  add column minutes_reviewed_at timestamptz;
alter table public.meetings add column minutes_reviewed_by uuid references public.profiles(id);
