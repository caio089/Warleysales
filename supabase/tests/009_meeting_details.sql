begin;
do $$
declare
  a uuid := gen_random_uuid();
  b uuid := gen_random_uuid();
  reader uuid := gen_random_uuid();
  org_a uuid := gen_random_uuid();
  org_b uuid := gen_random_uuid();
  process_a uuid := gen_random_uuid();
  process_b uuid := gen_random_uuid();
  attachment_a uuid := gen_random_uuid();
  attachment_b uuid := gen_random_uuid();
  meeting uuid := gen_random_uuid();
  kind text;
begin
  insert into auth.users (id) values (a), (b), (reader);
  update public.profiles set active = true where id in (a,b,reader);
  insert into public.councils (id,name,acronym) values
    (org_a,'Reuniões QA A','RQA'), (org_b,'Reuniões QA B','RQB');
  insert into public.council_memberships (user_id,council_id,role) values
    (a,org_a,'council_manager'), (b,org_b,'council_manager'), (reader,org_a,'viewer');
  insert into public.administrative_processes (id,council_id,sequence,year,number,title,created_by)
    values (process_a,org_a,1,2026,'001/2026','Documento de A',a), (process_b,org_b,1,2026,'001/2026','Documento de B',b);
  select code into kind from public.document_types limit 1;
  insert into public.attachments (id,process_id,council_id,type_code,file_name,mime,size,sha256,storage_path,uploaded_by,upload_status)
    values (attachment_a,process_a,org_a,kind,'a.pdf','application/pdf',100,repeat('a',64),'qa-206-a',a,'confirmed'),
      (attachment_b,process_b,org_b,kind,'b.pdf','application/pdf',100,repeat('b',64),'qa-206-b',b,'confirmed');
  insert into public.meetings (id,council_id,title,scheduled_at,status,created_by)
    values (meeting,org_a,'Teste do detalhe',now(),'realizada',a);

  assert (select responsible_id is null and participant_ids = '{}' and agenda is null from public.meetings where id=meeting);
  update public.meetings set responsible_id=a, participant_ids=array[reader],
    agenda='Pauta registrada', decisions='Decisão registrada', attachment_ids=array[attachment_a] where id=meeting;
  assert not exists(select 1 from public.meeting_attendance where meeting_id=meeting);
  assert public.record_meeting_evidence(meeting,a,reader,'attendance');
  update public.meetings set agenda='Pauta atualizada' where id=meeting;
  assert exists(select 1 from public.meeting_attendance where meeting_id=meeting and participant_id=reader and recorded_by=a);
  assert (select attachment_ids=array[attachment_a] and participant_ids=array[reader] from public.meetings where id=meeting);

  begin
    update public.meetings set participant_ids=array[b] where id=meeting;
    raise exception 'Participante de outro órgão aceito';
  exception when check_violation then null;
  end;
  begin
    update public.meetings set responsible_id=b where id=meeting;
    raise exception 'Responsável de outro órgão aceito';
  exception when check_violation then null;
  end;
  begin
    update public.meetings set attachment_ids=array[attachment_b] where id=meeting;
    raise exception 'Anexo de outro órgão aceito';
  exception when check_violation then null;
  end;

  perform set_config('request.jwt.claims', json_build_object('sub',reader,'role','authenticated')::text,true);
  set local role authenticated;
  assert exists(select 1 from public.meetings where id=meeting);
  assert exists(select 1 from public.attachments where id=attachment_a);
  assert not exists(select 1 from public.attachments where id=attachment_b);
  assert not has_column_privilege('authenticated','public.meetings','participant_ids','UPDATE');
  perform set_config('request.jwt.claims', json_build_object('sub',b,'role','authenticated')::text,true);
  assert not exists(select 1 from public.meetings where id=meeting);
  assert not exists(select 1 from public.attachments where id=attachment_a);
end $$;
rollback;
