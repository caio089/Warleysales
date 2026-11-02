# Arquitetura (estado atual da implementação)

Complementa `00-fase1-arquitetura.md` (fonte das regras R1–R16 e decisões P1–P8).

## Visão geral
Monólito modular em Next.js 16 (App Router, Cache Components) + Supabase (Postgres, Auth, Storage privado).

```
src/
  app/                 rotas (telas, route handlers de auth e cron, proxy de sessão em src/proxy.ts)
  modules/<dominio>/   schemas (Zod) · domain (regras puras) · service · repository (port) · repository.memory (testes) · actions
  server/              raiz de composição (container), sessão, runner de telas/ações, adapters Supabase
  shared/              lib (result, authz, tempo, decimal), jobs, ui (componentes acessíveis)
supabase/              migrations, tests (pgTAP), seed
```

Camadas e fluxo: `Página/Server Action → runAction/loadScreen → Service (valida Zod, autoriza, audita) → Repository (port) → Adapter Supabase`.
- **Domínio puro** (`domain/`): sem I/O, 100% testável (datas, saldo de ata, estoque, progresso, retenção).
- **Serviços**: retornam `Result<T>` (códigos VALIDATION, FORBIDDEN, NOT_FOUND, CONFLICT, INVALID_STATE, INSUFFICIENT_BALANCE…). Mensagens técnicas de banco nunca chegam ao usuário.
- **Adapters Supabase** (`src/server/supabase/adapters`): usam `service_role` apenas no servidor; a autorização de negócio fica nos serviços e o RLS é defesa em profundidade.
- **Telas sem fonte de dados** (variáveis ausentes) mostram "Fonte de dados não configurada" — nunca dados simulados.

## Concorrência e atomicidade
| Ponto | Mecanismo |
|---|---|
| Saldo de estoque | `InventoryRepository.transact` → leitura + cálculo em TS + RPC `apply_stock_mutation` (`FOR UPDATE`, checagem de `version`, ledger e saldo na mesma transação; até 6 tentativas em conflito) |
| Saldo de ata | `appendEventAtomically` → RPC `append_commitment_event` (trava o item, confere que o ledger não mudou) |
| Idempotência | UNIQUE `(conselho, material, idempotency_key)`, `purchase_receipt_keys`, `dedup_key` das notificações, `document_cleanup_runs.key`, `scheduled_job_runs(job, janela)` |
| Agregados (ata, contrato, solicitação, transferência, reunião) | RPCs `save_*` recebem JSON e gravam pai + filhos em uma transação; históricos/aditivos são append-only |
| Imutabilidade | trigger `forbid_mutation` em `audit_logs`, `stock_movements`, `ata_commitments`, `contract_amendments`, `ata_extensions` |

## Sessão e autenticação
`proxy.ts` renova o token (`@supabase/ssr`). `resolveActorFromSession` valida o JWT com `getClaims()` e carrega papéis em `profiles`/`council_memberships` (nunca `user_metadata`). Convite/recuperação: link do e-mail → `/auth/callback` (troca PKCE, destinos permitidos em lista) → `/redefinir-senha`.

## Jobs (Vercel Cron)
`/api/cron/{alertas,reconciliacao,limpeza}` exigem `Authorization: Bearer $CRON_SECRET` (comparação em tempo constante), executam no máximo uma vez por dia civil (America/Fortaleza) por job e registram em `scheduled_job_runs`.
