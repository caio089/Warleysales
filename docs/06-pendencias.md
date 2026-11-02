# Pendências e limitações conhecidas

## Decisões do usuário ainda abertas
- **P1 – Warley**: resolvido. Conta `owarleysales@gmail.com` (`31ddcba8-8df8-4dfc-8d2b-124e3e783935`) com `is_central_admin` e `is_special_deleter`.
- **P2 – Retenção**: sem tabela de temporalidade aprovada. O job de limpeza só **arquiva**; elimina somente com autorização formal registrada (`retention_authorizations`) após 30 dias, relatório de encerramento e sem bloqueios. Relatório, bloqueio e liberação de bloqueio agora têm UI.
- **P6 – Nomenclatura dos 7 tipos**: provisória (DFD, ETP, MR=Matriz de Riscos, TR, PP, PJ, ED); editar `document_types` e `document-types.ts` quando confirmada.
- **P7 – Vínculos**: convite continua no Auth; a tela `/administracao/usuarios` grava `council_memberships`.
- Seções §19, §25 e §29 citadas no pedido não existem em `00-fase1-arquitetura.md`; foram aplicados os padrões seguros documentados.

## O que depende do usuário
- **Migrations no projeto `wdefwnmqcdomupdiorbo`**: aplicadas (0001–0007, seed dos 7 tipos, bucket privado). `npm run db:check` passou.
- **`SUPABASE_SERVICE_ROLE_KEY`** e um `CRON_SECRET` próprio na Vercel (produção).
- **Auth**: Site URL/Redirect URLs, SMTP, proteção de senha vazada e MFA.
- **P2 tabela de retenção** e **P6 nomenclatura dos 7 tipos** (ver acima).

## Validação (ver `07-validacao-executada.md`)
- Migrations, RPCs, RLS, testes SQL e concorrência foram executados em um **Postgres 16 local descartável com stub do Supabase**, não no projeto real. Auth real (`getClaims`, convite, recuperação), Storage real (URL assinada de upload), PostgREST e cron em produção continuam **não validados de ponta a ponta**.
- Sem testes E2E (Playwright) nem teste de carga.
- Advisors do Supabase (security/performance) só podem ser consultados depois de aplicar as migrations no projeto real.

## Limitações de projeto
- **Resolvido**: aprovação/cancelamento de solicitação multi-item e avanço de transferência agora são RPCs SQL únicas (`approve_purchase_request`, `cancel_purchase_request`, `advance_transfer`, migration 0007). Resta o caminho com compensação em TypeScript apenas para o repositório em memória dos testes.
- **Resolvido**: upload de anexos direto ao Storage por URL assinada (`prepareUpload` → envio do navegador → `confirmUpload` com conferência de tamanho, magic bytes e SHA-256). Anexo pendente/falho não conta no progresso. Pendência menor: anexos `pending` abandonados não são limpos automaticamente (job futuro).
- `transact` carrega todas as chaves de idempotência do par conselho/material; adequado para o volume esperado, mas deve virar consulta por chave se o ledger crescer muito.
- `reconcile` faz uma consulta de ledger por saldo (N consultas); usar a view `v_stock_reconciliation` quando o volume crescer.
- Auditoria lista os 1000 registros mais recentes (sem paginação nem filtro por data na UI).
- Alertas são apenas internos (sem e-mail), conforme H7.
- Varredura de antivírus indisponível (H5): validação por extensão, magic bytes, tamanho e SHA-256.
- Falha em job marca a janela como `failed` e não repete sozinha (reexecução manual).
