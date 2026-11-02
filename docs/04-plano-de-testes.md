# Plano de testes

## Automatizados (rodam sem banco): `npm run typecheck && npm test && npm run lint && npm run build`
- **Domínio puro**: fuso/datas, progresso (R1–R5), elegibilidade de limpeza, saldo de ata, vigência/prorrogação, estoque (ledger, reserva), transferência, solicitação, marcos de alerta, CNPJ, validação de arquivo.
- **Serviços** (repositórios em memória; inclui caminho transacional por RPC e upload direto prepare/confirm): autorização por conselho e papel, auditoria de negados, idempotência, concorrência simulada (ports atômicos), rollback compensatório, limpeza com/sem autorização, alertas sem duplicidade.
- **UI**: renderização estática (`renderToStaticMarkup`) de estados, tabela, formulários, acessibilidade básica.
- **Jobs**: autenticação do cron (Bearer em tempo constante) e janela única por job.
- `npm run build` valida rotas, Cache Components e Server Actions.

## SQL/RLS/concorrência (executados em Postgres 16 local com stub do Supabase)
- `supabase/tests/002_validacao_sem_pgtap.sql` (58 verificações): seed, unicidade, CAS/idempotência de estoque, saldo negativo, append-only (UPDATE/DELETE/TRUNCATE), isolamento RLS entre conselhos, usuário comum sem escrita/exclusão, escalada de privilégio, `anon`, progresso 0/1/7 e reversão, ledger da ata, jobs e notificações idempotentes.
- `supabase/tests/003_fluxos_atomicos.sql` (39 verificações): aprovação/cancelamento multi-item tudo-ou-nada, alocação por conselho, fluxo completo de transferência, rollback sem reserva órfã, recebimento parcial, reconciliação.
- `supabase/tests/local/concorrencia.sh`: cenário D (20 clientes disputando 10 unidades → 10 reservas e 10 recusas), idempotência concorrente, 8 `advance_transfer` simultâneos sobre 15 unidades.
- `supabase/tests/001_integridade_e_rls.test.sql` (pgTAP) permanece para `supabase test db` quando houver Docker.
- Os arquivos 002/003 rodam com `psql -f` (ou `execute_sql`): terminam em `ROLLBACK`; a última consulta lista `falhas | total` (esperado `0`).
- Passo a passo e resultados reais: `docs/07-validacao-executada.md`.

## Ainda faltam
- Execução dos testes SQL e dos advisors **no projeto real** (depende de aplicar as migrations).
- Testes de integração dos adapters contra o banco, E2E Playwright e carga.
