begin;

insert into auth.users (id, email) values
  ('00000000-0000-4000-8000-000000020501', 'calendar-qa-a@example.test'),
  ('00000000-0000-4000-8000-000000020502', 'calendar-qa-b@example.test'),
  ('00000000-0000-4000-8000-000000020503', 'calendar-qa-viewer@example.test');
update public.profiles set active = true where id in (
  '00000000-0000-4000-8000-000000020501',
  '00000000-0000-4000-8000-000000020502',
  '00000000-0000-4000-8000-000000020503'
);
insert into public.councils (id, name, acronym) values
  ('10000000-0000-4000-8000-000000020501', 'Agenda QA A', 'QA205A'),
  ('10000000-0000-4000-8000-000000020502', 'Agenda QA B', 'QA205B');
insert into public.council_memberships (user_id, council_id, role) values
  ('00000000-0000-4000-8000-000000020501', '10000000-0000-4000-8000-000000020501', 'council_manager'),
  ('00000000-0000-4000-8000-000000020502', '10000000-0000-4000-8000-000000020502', 'council_manager'),
  ('00000000-0000-4000-8000-000000020503', '10000000-0000-4000-8000-000000020501', 'viewer');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000020501","role":"authenticated"}', true);

do $$
declare touched int;
begin
  insert into public.calendar_appointments (council_id, title, starts_at, ends_at)
  values ('10000000-0000-4000-8000-000000020501', 'Compromisso QA', '2026-11-26T12:00Z', '2026-11-26T13:00Z');
  update public.calendar_appointments set starts_at = '2026-11-27T17:00Z', ends_at = '2026-11-27T18:00Z'
  where title = 'Compromisso QA';
  get diagnostics touched = row_count;
  if touched <> 1 then raise exception 'Reagendamento não aplicado'; end if;
  begin
    update public.calendar_appointments set ends_at = starts_at where title = 'Compromisso QA';
    raise exception 'Intervalo inválido aceito';
  exception when check_violation then null;
  end;
  begin
    update public.calendar_appointments set council_id = '10000000-0000-4000-8000-000000020502' where title = 'Compromisso QA';
    raise exception 'Órgão alterado indevidamente';
  exception when insufficient_privilege then null;
  end;
end $$;

select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000020502","role":"authenticated"}', true);
do $$
declare touched int;
begin
  if exists (select 1 from public.calendar_appointments where title = 'Compromisso QA') then
    raise exception 'Registro exposto a outro órgão';
  end if;
  update public.calendar_appointments set title = 'Alteração indevida' where title = 'Compromisso QA';
  get diagnostics touched = row_count;
  if touched <> 0 then raise exception 'Outro órgão alterou o registro'; end if;
end $$;

select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000020503","role":"authenticated"}', true);
do $$
declare touched int;
begin
  if not exists (select 1 from public.calendar_appointments where title = 'Compromisso QA') then
    raise exception 'Leitura do próprio órgão bloqueada';
  end if;
  update public.calendar_appointments set title = 'Alteração indevida' where title = 'Compromisso QA';
  get diagnostics touched = row_count;
  if touched <> 0 then raise exception 'Visualizador alterou o registro'; end if;
  begin
    insert into public.calendar_appointments (council_id, title, starts_at, ends_at)
    values ('10000000-0000-4000-8000-000000020501', 'Cadastro indevido', '2026-11-26T12:00Z', '2026-11-26T13:00Z');
    raise exception 'Visualizador cadastrou um compromisso';
  exception when insufficient_privilege then null;
  end;
end $$;

rollback;
