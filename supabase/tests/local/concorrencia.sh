#!/bin/bash
# Cenário D (concorrência): 20 clientes paralelos tentam reservar 1 unidade de um saldo físico de 10,
# usando o MESMO protocolo CAS do adapter (ler saldo+versão -> calcular -> apply_stock_mutation; reler em 'conflict').
# Esperado: exatamente 10 reservas, 10 recusas por saldo insuficiente, reservado == físico == 10, nenhum saldo negativo.
# Também valida idempotência concorrente: 10 clientes enviam a MESMA chave de entrada; só 1 movimento é gravado.
# Uso: DB_URL_ARGS="-h /tmp/wspg -p 54329 -U postgres -d ws" ./concorrencia.sh   (banco local descartável!)
set -euo pipefail
PSQL="psql ${DB_URL_ARGS:--h /tmp/wspg -p 54329 -U postgres -d ws} -v ON_ERROR_STOP=1 -q -At"
export PATH=/opt/homebrew/opt/postgresql@16/bin:$PATH
C=10000000-0000-0000-0000-0000000000cc; M=20000000-0000-0000-0000-0000000000cc

$PSQL -c "insert into public.councils (id,name,acronym) values ('$C','Concorrência','CC') on conflict do nothing;
          insert into public.materials (id,code,name,unit) values ('$M','CC1','Mat','un') on conflict do nothing;
          delete from public.stock_balances where council_id='$C';
          select public.apply_stock_mutation('$C'::uuid,'$M'::uuid,0,10,0,jsonb_build_object('type','entry','quantity',10,'idempotency_key','seed-cc-'||clock_timestamp()));" >/dev/null

reserve_client() {
  $PSQL <<SQL
do \$\$
declare v record; r text; i int;
begin
  for i in 1..30 loop
    select physical, reserved, version into v from public.stock_balances where council_id='$C' and material_id='$M';
    if v.physical - v.reserved < 1 then raise notice 'RESULT:insufficient'; return; end if;
    r := public.apply_stock_mutation('$C'::uuid,'$M'::uuid,v.version,v.physical,v.reserved+1,null);
    if r = 'ok' then raise notice 'RESULT:reserved'; return; end if;
  end loop;
  raise notice 'RESULT:gaveup';
end \$\$;
SQL
}
OUT=$(for n in $(seq 1 20); do reserve_client 2>&1 & done; wait)
R=$(echo "$OUT" | grep -c 'RESULT:reserved' || true); I=$(echo "$OUT" | grep -c 'RESULT:insufficient' || true); G=$(echo "$OUT" | grep -c 'RESULT:gaveup' || true)
echo "20 clientes concorrentes: reservaram=$R recusados=$I desistiram=$G"
STATE=$($PSQL -c "select physical||'/'||reserved from public.stock_balances where council_id='$C' and material_id='$M'")
echo "Estado final físico/reservado: $STATE"
[ "$R" = "10" ] && [ "$I" = "10" ] && [ "$STATE" = "10.000/10.000" ] || { echo "FALHA cenário D"; exit 1; }

# Idempotência concorrente: mesma chave enviada por 10 clientes
KEY="idem-$(date +%s)"
send_entry() {
  $PSQL <<SQL
do \$\$
declare v record; r text; i int;
begin
  for i in 1..30 loop
    select physical, reserved, version into v from public.stock_balances where council_id='$C' and material_id='$M';
    if exists (select 1 from public.stock_movements where council_id='$C' and material_id='$M' and idempotency_key='$KEY') then return; end if;
    r := public.apply_stock_mutation('$C'::uuid,'$M'::uuid,v.version,v.physical+5,v.reserved,
         '{"type":"entry","quantity":5,"idempotency_key":"$KEY"}'::jsonb);
    if r = 'ok' then return; end if;
  end loop;
end \$\$;
SQL
}
for n in $(seq 1 10); do send_entry >/dev/null 2>&1 & done; wait
MOVS=$($PSQL -c "select count(*) from public.stock_movements where council_id='$C' and idempotency_key='$KEY'")
PHYS=$($PSQL -c "select physical from public.stock_balances where council_id='$C' and material_id='$M'")
echo "Idempotência concorrente: movimentos com a chave=$MOVS, físico=$PHYS (esperado 1 e 15.000)"
[ "$MOVS" = "1" ] && [ "$PHYS" = "15.000" ] || { echo "FALHA idempotência"; exit 1; }

# Reconciliação: saldo físico == soma assinada do ledger
$PSQL -c "select balance_physical||'='||ledger_physical from public.v_stock_reconciliation where council_id='$C'"
echo "OK: concorrência validada"
