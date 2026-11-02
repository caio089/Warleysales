# Validação realmente executada

Data: 02/11/2026. Este documento separa **o que foi comprovado** do **que depende do usuário**.

## 1. Projeto Supabase real (`wdefwnmqcdomupdiorbo`) — NÃO foi alterado
- O conector MCP do Supabase deste ambiente só enxerga **outro** projeto (`pbyimrsfgnqrdmkojvdr`, de outra organização) e responde *"You do not have permission"* ao consultar `wdefwnmqcdomupdiorbo`. Por segurança, **nenhuma migration foi aplicada em projeto algum** via MCP (aplicar no projeto errado seria destrutivo).
- Com a service role que o usuário colou em `.env.local`, `npm run db:check` (somente leitura) confirmou que o projeto está **vazio**: as 32 tabelas, o seed e o bucket não existem (`PGRST205: table not in schema cache`). A service role não executa DDL.
- Consequência: `get_advisors` (security/performance) e `generate_typescript_types` **não foram executados** no projeto real. Os equivalentes foram verificados no Postgres local (item 2).
- **Para concluir**: `docs/05-operacao-e-deploy.md` → "Aplicar o banco" (`npm run db:bundle` + SQL Editor, ou `supabase db push`), depois `npm run db:check` e os advisors no painel.

## 2. Postgres 16 local (descartável) com stub do Supabase
Reproduzível sem Docker: `initdb` + `supabase/tests/local/00_supabase_stub.sql` + migrations + testes.

| Verificação | Resultado |
|---|---|
| Migrations 0001–0007 em banco limpo, uma a uma e via `supabase/apply_all.sql` (transação única) | aplicam sem erro |
| `002_validacao_sem_pgtap.sql` | 58/58 OK |
| `003_fluxos_atomicos.sql` | 39/39 OK |
| `concorrencia.sh` (cenário D: 20 clientes × 10 unidades; idempotência concorrente; 8 `advance_transfer` simultâneos) | 10 reservas/10 recusas; 1 movimento por chave; 5 transferências aprovadas, reservado = 15 |
| Checagens equivalentes aos advisors | 0 tabelas sem RLS; 0 funções `public` executáveis por `anon`/`authenticated`; 0 FKs sem índice; 0 funções sem `search_path`; 1 `SECURITY DEFINER` em `public` (`handle_new_user`, sem execute para API) |

Itens cobertos pelos testes: isolamento entre conselhos (processos, saldos, transferências por origem/destino, perfis, vínculos, auditoria), usuário comum sem escrita/exclusão, escalada de privilégio bloqueada (flags, vínculos, papéis, auditoria forjada, RPCs, TRUNCATE), auditoria/ledgers append-only (UPDATE/DELETE/TRUNCATE), saldo negativo e reserva > físico impedidos, progresso 0/1/7 com reversão, idempotência (chaves de estoque, jobs, notificações, recebimento) e atomicidade tudo-ou-nada das RPCs.

### Bugs encontrados pelos testes e corrigidos
1. **TRUNCATE por `authenticated`** funcionava (privilégios padrão do Supabase dão `ALL`; RLS e triggers de linha não barram TRUNCATE) → migration `0005` revoga tudo de `anon`/`authenticated`, concede só `SELECT` onde há política RLS e adiciona triggers `BEFORE TRUNCATE` nas tabelas append-only.
2. `revoke update` em nível de tabela (0004) removeu o grant de coluna `profiles.full_name` → reconcedido em `0005`.
3. `append_commitment_event` não conferia saldo no banco → agora recusa comprometer acima do registrado e devolver acima do comprometido (`23514`).
4. Helpers `SECURITY DEFINER` de RLS ficavam em `public` (viram RPC pública; advisor 0029) → movidos para o schema `private` (alteração in-place nas migrations 0001/0004, pois nada havia sido aplicado).
5. FKs sem índice (30) → migration `0006`.

## 3. Aplicação
- `npm run typecheck`, `npm test` (240 testes), `npm run lint` e `npm run build`: passam.
- `npm run dev` + `curl`: `/login` 200 (renderiza "Entrar"); `/dashboard` e `/processos` entregam o redirect para `/login` (`NEXT_REDIRECT;replace;/login;307` — streaming do Next 16 devolve HTTP 200 com o redirect no corpo); `/` → 307 `/dashboard`; `/api/cron/alertas` sem token → 401; com `CRON_SECRET` → 500 enquanto o banco real estiver vazio (`scheduled_job_runs` inexistente), comportamento esperado até aplicar as migrations.
- **Não foi criado usuário de teste** no Auth (o projeto está sem schema e não há ferramenta segura). Passos de convite/primeiro admin/Warley em `05-operacao-e-deploy.md`.
- Tipos gerados do banco (`generate_typescript_types`) não foram usados: os adapters têm tipos de linha manuais e continuam coerentes com o SQL; gerar após aplicar no projeto real é opcional.

## 4. Limitações resolvidas nesta rodada
- Aprovar/cancelar solicitação multi-item e avançar transferência: RPCs transacionais (migration `0007`), usadas automaticamente pelo adapter Supabase; testes de serviço garantem a delegação e os testes SQL garantem o tudo-ou-nada.
- Upload de anexos: direto ao Storage por URL assinada, com confirmação por tamanho, magic bytes e SHA-256 (`bodySizeLimit` de Server Action removido). **Não testado contra o Storage real** (depende de aplicar o bucket).
