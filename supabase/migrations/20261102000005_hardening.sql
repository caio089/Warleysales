-- Migration 0005: endurecimento encontrado na validação (privilégios de tabela, TRUNCATE e ledger da ata).
-- Achados corrigidos:
--  1. TRUNCATE não é barrado por RLS nem por triggers de linha: os privilégios padrão do Supabase
--     concedem ALL a anon/authenticated. Revogamos tudo e concedemos apenas SELECT onde há política RLS.
--  2. `revoke update` em nível de tabela (0004) também removeu o grant de coluna profiles.full_name: reconcedido.
--  3. Tabelas append-only agora bloqueiam TRUNCATE (trigger de comando).
--  4. append_commitment_event valida saldo no banco (defesa em profundidade contra corrida de serviços).

-- ───────────── 1. Privilégios mínimos para as roles da Data API ─────────────
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from public, anon, authenticated;

-- Somente leitura, e apenas das tabelas que possuem política de SELECT (o RLS ainda filtra por conselho).
do $$
declare t record;
begin
  for t in select distinct tablename from pg_policies where schemaname = 'public' and cmd in ('SELECT', 'ALL') loop
    execute format('grant select on public.%I to authenticated', t.tablename);
  end loop;
end $$;

-- 2. Única coluna editável pelo próprio usuário (nome). Flags de privilégio permanecem bloqueadas.
grant update (full_name) on public.profiles to authenticated;

-- Objetos futuros nascem sem acesso para a Data API (novas migrations devem conceder explicitamente).
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;

-- ───────────── 3. TRUNCATE também é imutável nas tabelas append-only ─────────────
create trigger trg_audit_logs_no_truncate before truncate on public.audit_logs
  for each statement execute function public.forbid_mutation();
create trigger trg_stock_movements_no_truncate before truncate on public.stock_movements
  for each statement execute function public.forbid_mutation();
create trigger trg_ata_commitments_no_truncate before truncate on public.ata_commitments
  for each statement execute function public.forbid_mutation();
create trigger trg_contract_amendments_no_truncate before truncate on public.contract_amendments
  for each statement execute function public.forbid_mutation();
create trigger trg_ata_extensions_no_truncate before truncate on public.ata_extensions
  for each statement execute function public.forbid_mutation();

-- ───────────── 4. Ledger da ata: o banco também confere o saldo ─────────────
create or replace function public.append_commitment_event(p_item uuid, p_expected_count integer, p_event jsonb)
returns text
language plpgsql set search_path = '' as $$
declare
  v_count integer;
  v_registered numeric;
  v_committed numeric;
  v_quantity numeric := (p_event ->> 'quantity')::numeric;
begin
  select registered_quantity into v_registered from public.ata_items where id = p_item for update;
  if not found then
    raise exception 'Item de ata inexistente.' using errcode = '23503';
  end if;

  select count(*),
         coalesce(sum(case event_type when 'commit' then quantity else -quantity end), 0)
    into v_count, v_committed
    from public.ata_commitments where item_id = p_item;
  if v_count <> p_expected_count then return 'conflict'; end if;

  if p_event ->> 'event_type' = 'commit' and v_committed + v_quantity > v_registered then
    raise exception 'Comprometimento excede a quantidade registrada do item.' using errcode = '23514';
  end if;
  if p_event ->> 'event_type' = 'release' and v_quantity > v_committed then
    raise exception 'Devolução excede o quantitativo comprometido.' using errcode = '23514';
  end if;

  insert into public.ata_commitments (item_id, event_type, quantity, council_id, legal_basis)
  values (p_item, p_event ->> 'event_type', v_quantity,
          (p_event ->> 'council_id')::uuid, nullif(p_event ->> 'legal_basis', ''));
  return 'ok';
end $$;

revoke all on function public.append_commitment_event(uuid, integer, jsonb) from public, anon, authenticated;
grant execute on function public.append_commitment_event(uuid, integer, jsonb) to service_role;
