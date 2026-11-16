-- Distingue órgãos públicos de empresas privadas atendidas pela assessoria.
alter table public.councils
  add column if not exists organization_type text not null default 'public_body';

alter table public.councils
  drop constraint if exists councils_organization_type_check;

alter table public.councils
  add constraint councils_organization_type_check
  check (organization_type in ('public_body', 'private_company'));

create index if not exists idx_councils_organization_type
  on public.councils (organization_type, active);

comment on column public.councils.organization_type is
  'public_body para órgão público; private_company para empresa privada atendida pela assessoria.';
