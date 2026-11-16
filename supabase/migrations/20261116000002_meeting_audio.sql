-- Gravações de reuniões em bucket privado, com transcrição revisável no cadastro.
alter table public.meetings
  add column audio_path text,
  add column transcript_text text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('meeting-audio', 'meeting-audio', false, 26214400,
        array['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/mpeg'])
on conflict (id) do update set public = false;
-- Sem políticas de acesso em storage.objects para anon/authenticated.
-- Upload somente por URL assinada de uso único; reprodução por URL temporária.
