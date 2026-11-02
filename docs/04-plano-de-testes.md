# Plano de testes

## Automatizados (rodam sem banco): `npm run typecheck && npm test && npm run lint`
- **Domínio puro**: fuso/datas, progresso (R1–R5), elegibilidade de limpeza, saldo de ata, vigência/prorrogação, estoque (ledger, reserva), transferência, solicitação, marcos de alerta, CNPJ, validação de arquivo.
- **Serviços** (repositórios em memória): autorização por conselho e papel, auditoria de negados, idempotência, concorrência simulada (ports atômicos), rollback compensatório, limpeza com/sem autorização, alertas sem duplicidade.
- **UI**: renderização estática (`renderToStaticMarkup`) de estados, tabela, formulários, acessibilidade básica.
- **Jobs**: autenticação do cron (Bearer em tempo constante) e janela única por job.
- `npm run build` valida rotas, Cache Components e Server Actions.

## Que exigem Supabase (escritos, NÃO executados neste ambiente)
- `supabase/tests/001_integridade_e_rls.test.sql` (pgTAP): unicidade, CAS de estoque, idempotência, imutabilidade, RLS por conselho, bloqueio de escrita direta, progresso.
- Executar com `supabase start && supabase db reset && supabase test db`.
- **Faltam** (recomendado): testes de integração dos adapters contra o banco local; E2E Playwright dos fluxos (login → processo → anexos → solicitação → recebimento → transferência) e teste de carga de concorrência no estoque/ata.
