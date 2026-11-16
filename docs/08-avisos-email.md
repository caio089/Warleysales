# Avisos de vencimento por e-mail

O job existente `/api/cron/alertas` cria avisos internos para gestores de órgãos quando atas e contratos atingem os marcos de 90, 60, 30, 15, 7 e 0 dias. Com o Resend configurado, o mesmo job envia um resumo dos avisos pendentes ao e-mail de login de cada gestor. Avisos internos continuam disponíveis em `/alertas`.

## Configuração

1. Crie uma conta gratuita no [Resend](https://resend.com/pricing). O plano Free permite até 3.000 e-mails por mês e 100 por dia, conforme a tabela vigente; confira os limites antes de ativar.
2. [Verifique um domínio](https://resend.com/docs/dashboard/domains/introduction) próprio no Resend. Um endereço `@gmail.com` não pode ser usado como remetente de produção. Uma subárea como `avisos.seudominio.com.br` funciona bem.
3. Crie uma chave de API com permissão de envio. Defina `RESEND_API_KEY` e `RESEND_FROM` nas variáveis **do servidor** na Vercel. Exemplo de remetente: `Avisos Warley <alertas@avisos.seudominio.com.br>`.
4. Defina `NEXT_PUBLIC_SITE_URL` com a URL pública HTTPS da aplicação, para o link de `/alertas` funcionar no e-mail.
5. Aplique a migration `20261116000001_notification_emails.sql` no banco configurado para a aplicação e publique o código. Em um projeto novo, `npm run db:bundle` regenera `supabase/apply_all.sql` com todas as migrations.

Não envie a chave de API por chat nem a inclua no Git. Sem as três variáveis, o job só cria avisos internos e informa `email.status: not_configured` no resumo.

## Entrega e limites

- Apenas os avisos criados depois da migration entram na fila de e-mail. Os antigos continuam somente na aplicação.
- O envio é baseado na necessidade: **sem avisos pendentes, nenhum e-mail é enviado**. Quando existem avisos, cada gestor recebe **um resumo diário**, mesmo que tenha vários contratos ou atas a vencer. Não há três envios automáticos por dia.
- O cron está agendado para `09:00 UTC` no `vercel.json`, equivalente a **06:00 em Fortaleza**. O horário exato pode variar conforme a execução do agendador.
- O job consulta até **200 avisos** e envia no máximo **40 resumos por execução diária**, abaixo do limite do plano gratuito. A fila excedente fica para os próximos dias.
- O e-mail usa uma chave estável derivada dos IDs dos avisos incluídos no resumo. O [Resend conserva essa proteção por 24 horas](https://resend.com/blog/engineering-idempotency-keys).
- Se o provedor recusar o envio, o aviso fica pendente para a próxima execução; uma falha do provedor interrompe o lote para evitar muitas chamadas malsucedidas. Usuários sem e-mail no Auth ficam pendentes até que o cadastro seja corrigido.
- `email_sent_at` significa que a API aceitou a mensagem. Entrega final, rejeições e bounces dependem dos eventos do provedor e ainda não são conciliados neste projeto.
- O job diário é protegido por `CRON_SECRET` e registra uma única execução por dia. Reprocessamento de falha ocorre na próxima janela diária; uma tentativa manual no mesmo dia é ignorada pelo controle de janela.
