begin;
do $$
declare
  manager uuid := gen_random_uuid();
  member uuid := gen_random_uuid();
  outsider uuid := gen_random_uuid();
  council uuid := gen_random_uuid();
  meeting uuid := gen_random_uuid();
  task uuid := gen_random_uuid();
begin
  insert into auth.users (id) values (manager), (member), (outsider);
  insert into public.councils (id,name,acronym) values (council,'Teste de evidências','EVID');
  insert into public.council_memberships values
    (manager,council,'council_manager'),(member,council,'viewer');
  insert into public.meetings (id,council_id,title,scheduled_at,status,created_by)
    values (meeting,council,'Teste de autoria',now(),'realizada',manager);
  insert into public.meeting_action_items (id,meeting_id,description,responsible_id,due_date,done)
    values (task,meeting,'Tarefa',member,'2026-11-30',false);
  assert not public.record_meeting_evidence(meeting,outsider,task,'completion');
  assert not public.record_meeting_evidence(meeting,manager,outsider,'attendance');
  assert public.record_meeting_evidence(meeting,manager,member,'attendance');
  assert not public.record_meeting_evidence(meeting,manager,member,'attendance');
  assert public.record_meeting_evidence(meeting,manager,task,'completion');
  assert not public.record_meeting_evidence(meeting,manager,task,'completion');
  update public.meeting_action_items set done=false,due_date='2026-12-15' where id=task;
  assert (select done from public.meeting_action_items where id=task);
  assert exists (select 1 from public.meeting_task_completions where task_id=task
    and completed_by=manager and completed_at is not null and due_date='2026-11-30');
  assert exists (select 1 from public.meeting_attendance where meeting_id=meeting
    and participant_id=member and recorded_by=manager);
  assert (select count(*) from public.audit_logs where entity_id=meeting::text and actor_id=manager)=2;
  assert not has_function_privilege('authenticated','public.record_meeting_evidence(uuid,uuid,uuid,text)','execute');
  assert not has_table_privilege('authenticated','public.meeting_task_completions','insert');
end $$;
rollback;
