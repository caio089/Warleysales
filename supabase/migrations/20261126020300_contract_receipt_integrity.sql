-- Protege o vínculo mesmo se uma gravação contornar a RPC de recebimento.
create function private.check_contract_receipt_line() returns trigger
language plpgsql set search_path = '' as $$
begin
  if not exists (
    select 1
    from public.purchase_request_items ri
    join public.purchase_requests r on r.id = ri.request_id
    join public.contracts c on c.id = new.contract_id
    where ri.id = new.request_item_id and ri.request_id = new.request_id
      and c.council_id = r.council_id and c.process_id = r.process_id
      and ri.ata_item_id is not distinct from new.ata_item_id
      and (
        (ri.ata_item_id is null and c.ata_id is null)
        or exists (
          select 1 from public.contract_ata_items ci
          join public.ata_items ai on ai.id = ci.ata_item_id
          where ci.contract_id = c.id and ci.ata_item_id = ri.ata_item_id
            and ai.ata_id = c.ata_id
        )
      )
  ) then
    raise check_violation using message = 'Recebimento, contrato, item da ata e órgão incompatíveis.';
  end if;
  return new;
end $$;
create trigger contract_receipt_line_integrity
before insert or update on public.contract_receipt_lines
for each row execute function private.check_contract_receipt_line();
