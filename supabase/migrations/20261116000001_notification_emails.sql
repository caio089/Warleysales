-- Alertas antigos permanecem apenas no aplicativo. Novos avisos entram na fila de e-mail.
alter table public.notifications
  add column email_queued_at timestamptz,
  add column email_sent_at timestamptz,
  add column email_attempted_at timestamptz,
  add column email_failures integer not null default 0,
  add column email_last_error text;
alter table public.notifications alter column email_queued_at set default now();
create index notifications_pending_email_idx on public.notifications (created_at)
  where email_queued_at is not null and email_sent_at is null;

create function public.record_notification_email_failure(
  p_notification_ids uuid[], p_attempted_at timestamptz, p_reason text
) returns void language sql security definer set search_path = '' as $$
  update public.notifications
  set email_attempted_at = p_attempted_at,
      email_failures = email_failures + 1,
      email_last_error = left(p_reason, 200)
  where id = any(p_notification_ids) and email_sent_at is null;
$$;
revoke all on function public.record_notification_email_failure(uuid[], timestamptz, text) from public, anon, authenticated;
grant execute on function public.record_notification_email_failure(uuid[], timestamptz, text) to service_role;
