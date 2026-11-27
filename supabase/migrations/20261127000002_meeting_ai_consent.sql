alter table public.meetings
  add column ai_consent_by uuid references public.profiles(id),
  add column ai_consent_at timestamptz,
  add check ((ai_consent_by is null) = (ai_consent_at is null));

-- Old requests have no verifiable consent attached to the work item.
update public.meetings set ai_state='failed', ai_claim=null, ai_lease_until=null
where ai_state in ('queued','running');

create or replace function public.claim_meeting_ai() returns setof public.meetings
language sql set search_path = '' as $$
  update public.meetings m set ai_state='failed', ai_claim=null, ai_lease_until=null
  where (m.ai_state='queued' or (m.ai_state='running' and m.ai_lease_until < now()))
  and (
    m.status='cancelada' or m.ai_consent_at is null or m.ai_consent_by is null
    or m.ai_attempts >= 3
    or not exists (
      select 1 from public.profiles p where p.id=m.ai_consent_by and p.active and
      (p.is_central_admin or exists (
        select 1 from public.council_memberships cm where cm.user_id=p.id and cm.council_id=m.council_id
        and cm.role in ('council_manager','council_operator')
      ))
    )
  );

  update public.meetings m set ai_state='running', ai_lease_until=now()+interval '2 minutes',
    ai_claim=gen_random_uuid(), ai_attempts=m.ai_attempts+1
  where m.id=(select q.id from public.meetings q where
    (q.ai_state='queued' or (q.ai_state='running' and q.ai_lease_until < now()))
    and q.ai_attempts < 3 and q.status <> 'cancelada' and q.ai_consent_at is not null
    and exists (
      select 1 from public.profiles p where p.id=q.ai_consent_by and p.active and
      (p.is_central_admin or exists (
        select 1 from public.council_memberships cm where cm.user_id=p.id and cm.council_id=q.council_id
        and cm.role in ('council_manager','council_operator')
      ))
    )
    order by q.scheduled_at, q.id for update of q skip locked limit 1)
  returning m.*;
$$;
revoke all on function public.claim_meeting_ai() from public, anon, authenticated;
grant execute on function public.claim_meeting_ai() to service_role;
