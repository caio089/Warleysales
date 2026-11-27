alter table public.profiles drop constraint profiles_staff_category_check;
alter table public.profiles add constraint profiles_staff_category_check
  check (staff_category in (
    'unclassified', 'collaborator', 'intern', 'central_admin',
    'council_manager', 'council_operator', 'viewer', 'director',
    'request_collaborator', 'purchasing_collaborator'
  ));
