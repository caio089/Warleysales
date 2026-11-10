#!/bin/bash
# Concatena as migrations em ordem em supabase/apply_all.sql para colar no SQL Editor do painel Supabase
# (alternativa a `supabase link` + `supabase db push`). Regenere sempre que uma migration mudar.
set -euo pipefail
cd "$(dirname "$0")/.."
node scripts/bundle-migrations.mjs
