begin;
do $$
declare
  actor uuid := gen_random_uuid();
  org uuid := gen_random_uuid();
  meeting uuid := gen_random_uuid();
  first_claim uuid;
  outsider uuid := gen_random_uuid();
begin
  insert into auth.users(id) values (actor), (outsider);
  update public.profiles set active=true where id in (actor,outsider);
  insert into public.councils(id,name,acronym) values(org,'Ata QA','ATAQA');
  insert into public.council_memberships(user_id,council_id,role) values(actor,org,'council_manager');
  insert into public.meetings(id,council_id,title,scheduled_at,status,created_by,ai_stage,ai_state)
    values(meeting,org,'Ata QA',now(),'realizada',actor,'draft','queued');
  assert not exists(select 1 from public.claim_meeting_ai() where id=meeting);
  assert (select ai_state='failed' from public.meetings where id=meeting);
  update public.meetings set ai_state='queued', ai_consent_by=outsider, ai_consent_at=now() where id=meeting;
  assert not exists(select 1 from public.claim_meeting_ai() where id=meeting);
  update public.meetings set ai_state='queued', ai_consent_by=actor where id=meeting;
  update public.council_memberships set role='viewer' where user_id=actor and council_id=org;
  assert not exists(select 1 from public.claim_meeting_ai() where id=meeting);
  update public.council_memberships set role='council_manager' where user_id=actor and council_id=org;
  update public.meetings set ai_state='queued' where id=meeting;
  select ai_claim into first_claim from public.claim_meeting_ai() where id=meeting;
  assert first_claim is not null;
  assert not exists(select 1 from public.claim_meeting_ai() where id=meeting);
  update public.meetings set ai_lease_until=now()-interval '1 second' where id=meeting;
  assert exists(select 1 from public.claim_meeting_ai() where id=meeting and ai_claim<>first_claim and ai_attempts=2);
  assert not has_function_privilege('authenticated','public.claim_meeting_ai()','execute');
  assert not has_column_privilege('authenticated','public.meetings','minutes_approved_at','UPDATE');
  assert not has_column_privilege('authenticated','public.meetings','ai_consent_by','UPDATE');
  update public.meetings set minutes_text='Texto aprovado',minutes_registered_by=actor,minutes_registered_at=now(),
    minutes_approved_by=actor,minutes_approved_at=now() where id=meeting;
  begin
    update public.meetings set minutes_text='Sobrescrita' where id=meeting;
    raise exception 'Ata aprovada foi sobrescrita';
  exception when check_violation then null;
  end;
  insert into public.meeting_action_items(meeting_id,description,minutes_task_key) values(meeting,'Atividade confirmada','qa');
  begin
    insert into public.meeting_action_items(meeting_id,description,minutes_task_key) values(meeting,'Duplicata','qa');
    raise exception 'Tarefa duplicada';
  exception when unique_violation then null;
  end;
end $$;
rollback;
