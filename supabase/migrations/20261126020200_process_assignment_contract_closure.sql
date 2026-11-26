-- Campos opcionais preservam os processos e contratos anteriores.
alter table public.administrative_processes
  add column responsible_id uuid references public.profiles(id),
  add column process_type text check (process_type is null or length(trim(process_type)) between 1 and 80);
create index administrative_processes_responsible_id_idx on public.administrative_processes(responsible_id)
  where responsible_id is not null;

create function private.check_process_responsible_membership() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.responsible_id is not null and not exists (
    select 1 from public.council_memberships m join public.profiles p on p.id = m.user_id
    where m.user_id = new.responsible_id and m.council_id = new.council_id and p.active
  ) then
    raise check_violation using message = 'O responsável precisa ser usuário ativo do órgão do processo.';
  end if;
  return new;
end $$;
create trigger administrative_processes_responsible_membership
before insert or update of responsible_id, council_id on public.administrative_processes
for each row execute function private.check_process_responsible_membership();

alter table public.contracts
  add column closed_at timestamptz,
  add column closed_by uuid references public.profiles(id);
alter table public.contracts add constraint contracts_closure_pair
  check ((closed_at is null) = (closed_by is null));

-- O recebimento antigo continua sem contrato individual conhecido.
create table public.contract_receipt_lines (
  request_id uuid not null references public.purchase_requests(id),
  receipt_key text not null,
  request_item_id uuid not null references public.purchase_request_items(id),
  contract_id uuid not null references public.contracts(id),
  ata_item_id uuid references public.ata_items(id),
  quantity numeric(15,3) not null check (quantity > 0),
  created_at timestamptz not null default now(),
  primary key (request_id, receipt_key, request_item_id),
  foreign key (request_id, receipt_key) references public.purchase_receipt_keys(request_id, receipt_key)
);
create index contract_receipt_lines_contract_idx on public.contract_receipt_lines(contract_id);
alter table public.contract_receipt_lines enable row level security;
create policy contract_receipt_lines_select on public.contract_receipt_lines
for select to authenticated using (exists (
  select 1 from public.purchase_requests r where r.id = request_id
  and private.has_council_access(r.council_id)
));
grant select on public.contract_receipt_lines to authenticated;

-- O wrapper preserva todas as regras da RPC vigente e grava a atribuição na
-- mesma transação. Falha de qualquer inserção reverte o recebimento inteiro.
create function public.receive_purchase_request_for_contract(
  p_request uuid, p_contract uuid, p_actor uuid, p_at timestamptz,
  p_receipt_key text, p_lines jsonb,
  p_close_incomplete boolean default false, p_justification text default null
) returns jsonb language plpgsql set search_path = '' as $$
declare
  v_request public.purchase_requests%rowtype;
  v_contract public.contracts%rowtype;
  v_line record;
  v_contract_total numeric;
  v_attributed numeric;
  v_received_total numeric;
  v_other_contracts integer;
  v_result jsonb;
begin
  if p_contract is null or p_lines is null or jsonb_typeof(p_lines) <> 'array' then
    return jsonb_build_object('ok', false, 'code', 'VALIDATION', 'message', 'Selecione um contrato válido.');
  end if;
  select * into v_request from public.purchase_requests where id = p_request;
  if not found then
    return jsonb_build_object('ok', false, 'code', 'NOT_FOUND', 'message', 'Solicitação não encontrada.');
  end if;
  -- A mesma linha de processo serializa recebimentos de contratos distintos.
  perform 1 from public.administrative_processes
    where id = v_request.process_id and council_id = v_request.council_id for update;
  select * into v_contract from public.contracts where id = p_contract;
  if not found or v_contract.process_id is distinct from v_request.process_id
    or v_contract.council_id is distinct from v_request.council_id then
    return jsonb_build_object('ok', false, 'code', 'VALIDATION', 'message', 'Contrato incompatível com a solicitação e o órgão.');
  end if;
  if exists(select 1 from public.purchase_receipt_keys where request_id = p_request and receipt_key = p_receipt_key) then
    if exists(select 1 from public.contract_receipt_lines
      where request_id = p_request and receipt_key = p_receipt_key and contract_id <> p_contract) then
      return jsonb_build_object('ok', false, 'code', 'CONFLICT', 'message', 'A chave de recebimento já pertence a outro contrato.');
    end if;
    return jsonb_build_object('ok', true);
  end if;
  for v_line in
    select ri.id as item_id, ri.ata_item_id, sum((line.value ->> 'received')::numeric) as quantity
    from jsonb_array_elements(p_lines) line
    join public.purchase_request_items ri on ri.id = (line.value ->> 'item_id')::uuid
    where ri.request_id = p_request
    group by ri.id, ri.ata_item_id
  loop
    if v_line.ata_item_id is not null then
      select coalesce(sum(ci.quantity), 0) into v_contract_total
      from public.contract_ata_items ci where ci.contract_id = p_contract and ci.ata_item_id = v_line.ata_item_id;
      if v_contract.ata_id is null or v_contract_total = 0 then
        return jsonb_build_object('ok', false, 'code', 'VALIDATION', 'message', 'Item da ata não pertence ao contrato escolhido.');
      end if;
      select coalesce(sum(cr.quantity), 0) into v_attributed
      from public.contract_receipt_lines cr where cr.contract_id = p_contract and cr.ata_item_id = v_line.ata_item_id;
      select coalesce(sum(ri.received_total), 0) into v_received_total
      from public.purchase_request_items ri join public.purchase_requests r on r.id = ri.request_id
      where r.process_id = v_request.process_id and r.council_id = v_request.council_id
        and ri.ata_item_id = v_line.ata_item_id;
      select count(*) into v_other_contracts from public.contract_ata_items ci
      join public.contracts c on c.id = ci.contract_id
      where c.id <> p_contract and c.process_id = v_request.process_id and c.council_id = v_request.council_id
        and ci.ata_item_id = v_line.ata_item_id;
      if v_other_contracts > 0 and v_received_total > (
        select coalesce(sum(cr.quantity), 0) from public.contract_receipt_lines cr
        join public.contracts c on c.id = cr.contract_id
        where c.process_id = v_request.process_id and c.council_id = v_request.council_id
          and cr.ata_item_id = v_line.ata_item_id
      ) then
        return jsonb_build_object('ok', false, 'code', 'CONFLICT', 'message', 'Há recebimentos históricos sem contrato individual comprovado para este item.');
      end if;
      if v_attributed + (case when v_other_contracts = 0 then v_received_total - v_attributed else 0 end) + v_line.quantity > v_contract_total then
        return jsonb_build_object('ok', false, 'code', 'VALIDATION', 'message', 'Quantidade acima do saldo contratado para este contrato.');
      end if;
    elsif v_contract.ata_id is not null then
      return jsonb_build_object('ok', false, 'code', 'VALIDATION', 'message', 'Item sem ata não corresponde ao contrato escolhido.');
    end if;
  end loop;
  v_result := public.receive_purchase_request(p_request, p_actor, p_at, p_receipt_key,
    p_lines, p_close_incomplete, p_justification);
  if not coalesce((v_result ->> 'ok')::boolean, false) then return v_result; end if;
  insert into public.contract_receipt_lines(request_id, receipt_key, request_item_id, contract_id, ata_item_id, quantity)
  select p_request, p_receipt_key, ri.id, p_contract, ri.ata_item_id, sum((line.value ->> 'received')::numeric)
  from jsonb_array_elements(p_lines) line
  join public.purchase_request_items ri on ri.id = (line.value ->> 'item_id')::uuid
  where ri.request_id = p_request
  group by ri.id, ri.ata_item_id;
  return v_result;
end $$;
revoke all on function public.receive_purchase_request_for_contract(uuid, uuid, uuid, timestamptz, text, jsonb, boolean, text)
  from public, anon, authenticated;
grant execute on function public.receive_purchase_request_for_contract(uuid, uuid, uuid, timestamptz, text, jsonb, boolean, text)
  to service_role;
