# Execução local, deploy e backups

## Projeto Supabase e variáveis (estado real)
Projeto: `https://wdefwnmqcdomupdiorbo.supabase.co` (ref `wdefwnmqcdomupdiorbo`).

| Variável | Onde | Observação |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` + Vercel | pública |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `.env.local` + Vercel | chave publicável `sb_publishable_...` (pública). O código aceita `NEXT_PUBLIC_SUPABASE_ANON_KEY` como fallback legado |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` + Vercel (**somente servidor**) | **colar do painel: Settings > API > service_role.** Nunca prefixar com `NEXT_PUBLIC_`, nunca commitar |
| `CRON_SECRET` | `.env.local` + Vercel | aleatório ≥ 16 caracteres (`openssl rand -hex 32`). O valor local foi gerado e é distinto do de produção: gere outro para a Vercel |
| `NEXT_PUBLIC_SITE_URL`, `APP_TIMEZONE` | `.env.local` + Vercel | URL pública e fuso (`America/Fortaleza`) |

`.env*` está no `.gitignore` (exceto `.env.example`); confira com `git check-ignore -v .env.local`.

## Aplicar o banco (migrations 0001–0007 + seed + bucket)
O seed dos 7 tipos documentais e o bucket privado `process-documents` fazem parte da migration `0004`.
Escolha UMA das formas (em projeto vazio):
1. **SQL Editor**: `npm run db:bundle` gera `supabase/apply_all.sql` (todas as migrations em uma transação); cole e execute. Se falhar, nada é aplicado.
2. **CLI**: `supabase login && supabase link --project-ref wdefwnmqcdomupdiorbo && supabase db push` (pede a senha do banco).

Depois confira, sem alterar nada: `npm run db:check` (lê `.env.local`; valida 32 tabelas, seed de 7 tipos, bucket privado, RPCs e que a chave publicável não lê dados).
Só então rode os testes SQL contra o banco real, se desejar (ver `docs/04-plano-de-testes.md`; os testes usam `begin ... rollback`).

## Local sem Docker (validação do SQL)
`supabase/tests/local/00_supabase_stub.sql` cria os papéis/schemas mínimos do Supabase (`anon`, `authenticated`, `service_role`, `auth.users`, `auth.uid()`, `storage.buckets`) em um Postgres comum. Os passos usados na validação estão em `docs/07-validacao-executada.md`.
Aplicação: `npm install`, `.env.local` preenchido, `npm run dev`.

## Primeiro acesso (cadastro somente por convite, P7)
1. **Auth > URL Configuration**: Site URL = URL de produção (`http://localhost:3000` em dev) e *Redirect URLs* com `<SITE_URL>/auth/callback`. Ajuste o template de e-mail de convite/recuperação para apontar a `{{ .SiteURL }}/auth/callback?next=/redefinir-senha`.
2. **Auth > SMTP**: configure um SMTP próprio (o SMTP padrão do Supabase tem limite baixo e só entrega a membros da equipe).
3. Convide o primeiro usuário em **Auth > Users > Invite user** (ou crie com senha provisória). O trigger `on_auth_user_created` cria o perfil sem privilégios.
4. Promova o primeiro administrador central no **SQL Editor** (substitua pelo e-mail real; nenhum UUID é inventado):
   ```sql
   update public.profiles set is_central_admin = true
    where id = (select id from auth.users where email = 'admin@exemplo.gov.br');
   ```
5. Quando o Warley tiver conta (decisão P1), vincule a exclusão manual:
   ```sql
   update public.profiles set is_special_deleter = true
    where id = (select id from auth.users where email = '<email-do-warley>');
   ```
6. Cadastre conselhos pela tela de Conselhos e vincule usuários (`council_memberships`) pelo SQL Editor até existir a tela de vínculos.

## Deploy (Vercel + Supabase)
1. Projeto Supabase de produção: ver "Aplicar o banco" acima.
2. Vercel: configure as variáveis acima (Production/Preview separadas; nunca expor a service role em variável `NEXT_PUBLIC_`).
3. `vercel.json` já agenda os crons (09h/07h/06h UTC). A Vercel envia `Authorization: Bearer $CRON_SECRET` automaticamente quando a variável existe.
4. Auth → URL Configuration: Site URL e Redirect URLs de produção; ativar proteção de senha vazada (Auth > Providers > Email) e MFA conforme política (itens de configuração que não são SQL e aparecem nos advisors de segurança).
5. Pós-deploy: abrir `/login`, verificar `/api/cron/alertas` sem token (deve dar 401) e acompanhar Logs (JSON estruturado: `job.concluido`, `job.falhou`, `db.erro`).

## Backups
- Supabase: backups diários automáticos (planos pagos) e PITR recomendado; teste de restauração trimestral.
- Storage (bucket `process-documents`) **não** entra no backup de banco: agende cópia periódica (ex.: `supabase storage` + rclone para bucket externo).
- Auditoria e ledgers são append-only: preservar em qualquer restauração.
