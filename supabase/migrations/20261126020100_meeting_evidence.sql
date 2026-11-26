create table public.meeting_attendance (
  meeting_id uuid not null references public.meetings(id),
  participant_id uuid not null references public.profiles(id),
  recorded_by uuid not null references public.profiles(id),
  recorded_at timestamptz not null default now(),
  primary key (meeting_id, participant_id)
);
create table public.meeting_task_completions (
  task_id uuid primary key references public.meeting_action_items(id),
  completed_by uuid not null references public.profiles(id),
  completed_at timestamptz not null default now(),
  due_date date
);
alter table public.meeting_attendance enable row level security;
alter table public.meeting_task_completions enable row level security;
revoke all on public.meeting_attendance, public.meeting_task_completions from anon, authenticated;
grant select on public.meeting_attendance, public.meeting_task_completions to service_role;

-- Writes go through the authorized server operation and commit together with the audit event.
create function public.record_meeting_evidence(p_meeting uuid, p_actor uuid, p_target uuid, p_kind text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  m public.meetings%rowtype;
  changed integer;
begin
  select * into m from public.meetings where id = p_meeting for update;
  if not found or not exists (
    select 1 from public.profiles p where p.id = p_actor and p.active and
      (p.is_central_admin or exists (select 1 from public.council_memberships cm
        where cm.council_id = m.council_id and cm.user_id = p_actor
          and cm.role in ('council_manager','council_operator')))
  ) then return false; end if;

  if p_kind = 'attendance' then
    if m.status <> 'realizada' or not exists (
      select 1 from public.council_memberships where council_id = m.council_id and user_id = p_target
    ) then return false; end if;
    insert into public.meeting_attendance (meeting_id, participant_id, recorded_by)
      values (p_meeting, p_target, p_actor) on conflict do nothing;
  elsif p_kind = 'completion' then
    insert into public.meeting_task_completions (task_id, completed_by, due_date)
      select id, p_actor, due_date from public.meeting_action_items
      where id = p_target and meeting_id = p_meeting and not done
      on conflict do nothing;
  else return false;
  end if;

  get diagnostics changed = row_count;
  if changed = 0 then return false; end if;
  if p_kind = 'completion' then
    update public.meeting_action_items set done = true where id = p_target;
  end if;
  insert into public.audit_logs (actor_id, action, entity, entity_id, council_id, details)
    values (p_actor, 'meeting.' || p_kind, 'meeting', p_meeting::text, m.council_id,
      jsonb_build_object('targetId', p_target));
  return true;
end $$;
revoke all on function public.record_meeting_evidence(uuid,uuid,uuid,text) from public, anon, authenticated;
grant execute on function public.record_meeting_evidence(uuid,uuid,uuid,text) to service_role;

-- A save based on an older meeting snapshot cannot undo a recorded completion.
create function private.keep_meeting_task_completion() returns trigger
language plpgsql set search_path = '' as $$
begin
  if exists (select 1 from public.meeting_task_completions where task_id = old.id) then
    new.done := true;
  end if;
  return new;
end $$;
create trigger keep_meeting_task_completion before update on public.meeting_action_items
for each row execute function private.keep_meeting_task_completion();
