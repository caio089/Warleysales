-- Migration 0008: celular WhatsApp do conselho (E.164), para envio futuro de mensagens.
-- Vazio é permitido; se informado, exige 55 + DDD + 9 dígitos (celular).

alter table public.councils
  add column if not exists whatsapp_e164 text;

alter table public.councils
  drop constraint if exists councils_whatsapp_e164_check;

alter table public.councils
  add constraint councils_whatsapp_e164_check
  check (whatsapp_e164 is null or whatsapp_e164 ~ '^55[1-9][0-9]9[0-9]{8}$');

comment on column public.councils.whatsapp_e164 is
  'Celular WhatsApp em E.164 (55 + DDD + 9 dígitos). Reservado para envio futuro de mensagens.';
