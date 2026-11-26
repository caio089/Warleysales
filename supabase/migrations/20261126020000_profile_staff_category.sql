-- Classificação declarada para relatórios individuais/mensais. Registros antigos permanecem sem classificação.
alter table public.profiles add column staff_category text not null default 'unclassified'
  check (staff_category in ('unclassified', 'collaborator', 'intern'));
create index idx_profiles_staff_category on public.profiles (staff_category) where staff_category = 'intern';
