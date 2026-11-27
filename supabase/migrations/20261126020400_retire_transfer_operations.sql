-- Keep transfer history and its read policies. Retire only operational access.
lock table public.stock_transfers in share row exclusive mode;

do $$
begin
  if exists (
    select 1 from public.stock_transfers
    where status in ('aprovada', 'separada', 'em_transito')
  ) then
    raise exception 'Conclua ou regularize as transferências com material reservado ou em trânsito antes de desativar o módulo.';
  end if;
end
$$;

revoke execute on function public.save_transfer(jsonb),
  public.advance_transfer(uuid, text, uuid, timestamptz, text, jsonb)
  from public, anon, authenticated, service_role;

revoke insert, update, delete, truncate on
  public.stock_transfers, public.stock_transfer_items, public.stock_transfer_events
  from public, anon, authenticated, service_role;
