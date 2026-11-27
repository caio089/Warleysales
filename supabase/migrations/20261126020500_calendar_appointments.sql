create table public.calendar_appointments (
  id uuid primary key default gen_random_uuid(),
  council_id uuid not null references public.councils(id),
  created_by uuid not null default auth.uid() references public.profiles(id),
  title text not null check (length(btrim(title)) between 3 and 200),
  description text not null default '' check (length(description) <= 2000),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  check (ends_at > starts_at)
);
create index calendar_appointments_scope_date_idx on public.calendar_appointments (council_id, starts_at);
alter table public.calendar_appointments enable row level security;
revoke all on public.calendar_appointments from public, anon, authenticated;
grant select on public.calendar_appointments to authenticated;
grant insert (council_id, title, description, starts_at, ends_at),
  update (title, description, starts_at, ends_at) on public.calendar_appointments to authenticated;
create policy calendar_appointment_read on public.calendar_appointments for select to authenticated
  using (private.has_council_access(council_id));
create policy calendar_appointment_create on public.calendar_appointments for insert to authenticated
  with check (created_by = auth.uid() and private.has_council_role(council_id, array['council_manager','council_operator']::public.council_role[]));
create policy calendar_appointment_edit on public.calendar_appointments for update to authenticated
  using (private.has_council_role(council_id, array['council_manager','council_operator']::public.council_role[]))
  with check (private.has_council_role(council_id, array['council_manager','council_operator']::public.council_role[]));
