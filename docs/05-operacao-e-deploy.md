# Execução local, deploy e backups

## Local
1. `npm install`; copie `.env.example` para `.env.local` e preencha.
2. Supabase local (Docker): `supabase start`, `supabase db reset` (aplica migrations 0001–0004 e seed), use as chaves exibidas.
3. `npm run dev`.

Variáveis: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (**somente servidor**), `CRON_SECRET` (≥16 caracteres, aleatório), `NEXT_PUBLIC_SITE_URL`, `APP_TIMEZONE`.

## Primeiro acesso (cadastro somente por convite, P7)
1. Convide o usuário pelo painel do Supabase (Auth → Invite). Ajuste o template do e-mail para apontar a `{{ .SiteURL }}/auth/callback?next=/redefinir-senha` e cadastre essa URL em *Redirect URLs*.
2. Defina manualmente o admin central e, quando o UUID do Warley for conhecido, a flag de exclusão (ver `supabase/seed.sql`).
3. Cadastre conselhos e vínculos (`council_memberships`) — pela tela de conselhos/SQL.

## Deploy (Vercel + Supabase)
1. Projeto Supabase de produção: `supabase link` + `supabase db push`.
2. Vercel: configure as variáveis acima (Production/Preview separadas; nunca expor a service role em variável `NEXT_PUBLIC_`).
3. `vercel.json` já agenda os crons (09h/07h/06h UTC). A Vercel envia `Authorization: Bearer $CRON_SECRET` automaticamente quando a variável existe.
4. Auth → URL Configuration: Site URL e Redirect URLs de produção; ativar proteção de senha vazada e MFA conforme política.
5. Pós-deploy: abrir `/login`, verificar `/api/cron/alertas` sem token (deve dar 401) e acompanhar Logs (JSON estruturado: `job.concluido`, `job.falhou`, `db.erro`).

## Backups
- Supabase: backups diários automáticos (planos pagos) e PITR recomendado; teste de restauração trimestral.
- Storage (bucket `process-documents`) **não** entra no backup de banco: agende cópia periódica (ex.: `supabase storage` + rclone para bucket externo).
- Auditoria e ledgers são append-only: preservar em qualquer restauração.
