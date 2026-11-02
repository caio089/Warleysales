#!/bin/bash
# Concatena as migrations em ordem em supabase/apply_all.sql para colar no SQL Editor do painel Supabase
# (alternativa a `supabase link` + `supabase db push`). Regenere sempre que uma migration mudar.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=supabase/apply_all.sql
{
  echo "-- GERADO por scripts/bundle-migrations.sh — não edite; edite supabase/migrations/*.sql e regenere."
  echo "-- Aplicar UMA vez em projeto novo/vazio (SQL Editor). Roda tudo em uma transação: falhou = nada é aplicado."
  echo "begin;"
  for f in supabase/migrations/*.sql; do
    echo; echo "-- ===== $(basename "$f") ====="; cat "$f"
  done
  echo; echo "commit;"
} > "$OUT"
echo "Gerado $OUT ($(wc -l < "$OUT") linhas)"
