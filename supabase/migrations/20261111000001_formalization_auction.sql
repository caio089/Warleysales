-- Contratação do pregão: data da sessão e quantidade contratada.
alter table public.process_formalizations
  add column if not exists auction_date date,
  add column if not exists contracted_quantity numeric(15,3) check (contracted_quantity is null or contracted_quantity > 0);

notify pgrst, 'reload schema';
